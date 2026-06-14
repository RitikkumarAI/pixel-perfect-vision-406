# SOC2 COMPLIANCE CONTROLS MAP

## Security Pillar
- **CC6.1 (Logical Access Security)**: Managed via Passkeys, MFA (TOTP), and Multi-SAML Strategy mappings. PostgreSQL RLS enforces zero-trust tenant boundaries.
- **CC6.6 (External Threats)**: Network boundary protected via AWS WAF and ALB ingress. True Impossible Travel (Haversine GeoIP) blocks anomalous sessions.
- **CC7.1 (System Operations)**: Infrastructure mapped via Terraform. Node execution profiled via Sentry.

## Availability Pillar
- **A1.2 (Environmental Protection)**: EKS spanning 3 AWS Availability Zones. RDS Multi-AZ ensures fault tolerance.
- **A1.3 (Data Backup)**: Point-in-time recovery enabled. 30-day RDS snapshot retention.

## Confidentiality Pillar
- **C1.1 (Data Protection)**: AES-256-GCM encryption on all sensitive database fields. S3 objects encrypted at rest via KMS.
- **C1.2 (Data Disposal)**: Handled via Data Retention Policies (30-day soft delete purge).
