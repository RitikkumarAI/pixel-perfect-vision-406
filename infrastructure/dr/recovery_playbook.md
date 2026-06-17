# NEXUS PLATFORM - DISASTER RECOVERY PLAYBOOK

## 1. Core Objectives

- **RPO (Recovery Point Objective)**: 5 Minutes. Data loss should not exceed the last 5 minutes of state (backed by RDS Multi-AZ block replication).
- **RTO (Recovery Time Objective)**: 1 Hour. We should be able to restore the entire cloud infrastructure from a cold state within 60 minutes.

## 2. Recovery Playbooks

### Scenario A: Complete Region Failure (us-east-1 goes down)

1. Export AWS credentials for `us-west-2`.
2. Update `variables.tf` mapping `aws_region = "us-west-2"`.
3. Execute Infrastructure rebuild:
   ```bash
   cd infrastructure/terraform
   terraform init
   terraform apply -auto-approve
   ```
4. Restore Database from global snapshot:
   ```bash
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier nexus-db-prod \
     --db-snapshot-identifier arn:aws:rds:us-east-1:1234567890:snapshot:latest \
     --availability-zone us-west-2a
   ```
5. Apply K8s Manifests to the new EKS cluster.
   ```bash
   aws eks update-kubeconfig --name nexus-cluster-prod --region us-west-2
   kubectl apply -f infrastructure/k8s/
   ```
6. Re-route DNS (Route53) to the new ALB Ingress URL.

### Scenario B: Accidental Data Deletion (User/DB Drop)

1. Do NOT touch terraform.
2. Identify the exact time of deletion.
3. Initiate RDS Point-in-Time Recovery (PITR):
   ```bash
   aws rds restore-db-instance-to-point-in-time \
     --source-db-instance-identifier nexus-db-prod \
     --target-db-instance-identifier nexus-db-prod-restore \
     --restore-time "2026-06-12T00:00:00Z"
   ```
4. Hot swap the Database URL in K8s secrets once restored.

### Scenario C: S3 Object Overwrite

1. S3 Versioning is enabled via Terraform `aws_s3_bucket_versioning`.
2. If an object is overwritten, fetch the previous Version ID via AWS CLI and restore it.
