terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
  backend "s3" {
    bucket         = "nexus-terraform-state-prod"
    key            = "platform/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. VPC & Networking
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.1"

  name = "nexus-vpc-${var.environment}"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false # High Availability
  one_nat_gateway_per_az = true
}

# 2. RDS PostgreSQL (Multi-AZ)
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.1.1"

  identifier = "nexus-db-${var.environment}"
  engine     = "postgres"
  engine_version = "15.4"
  instance_class = "db.m6gd.large"
  allocated_storage = 100
  
  db_name  = "nexus"
  username = "nexus_admin"
  password = var.db_password # Injected via Secrets Manager

  multi_az               = true
  db_subnet_group_name   = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [aws_security_group.db_sg.id]

  backup_retention_period = 30
  storage_encrypted       = true
  deletion_protection     = true
}

# 3. ElastiCache Redis
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id          = "nexus-redis-${var.environment}"
  description                   = "Nexus Production Redis Cluster"
  node_type                     = "cache.m6g.large"
  port                          = 6379
  parameter_group_name          = "default.redis7.cluster.on"
  automatic_failover_enabled    = true
  multi_az_enabled              = true
  num_node_groups               = 3
  replicas_per_node_group       = 2
  
  snapshot_retention_limit      = 7 # Redis Persistence
  transit_encryption_enabled    = true
  at_rest_encryption_enabled    = true

  subnet_group_name          = aws_elasticache_subnet_group.redis_subnet.name
  security_group_ids         = [aws_security_group.redis_sg.id]
}

# 4. Amazon EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.16.0"

  cluster_name    = "nexus-cluster-${var.environment}"
  cluster_version = "1.28"

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    standard_workers = {
      min_size     = 3
      max_size     = 20
      desired_size = 5

      instance_types = ["t3.xlarge"]
      capacity_type  = "ON_DEMAND"
    }
    ai_workers = {
      min_size     = 1
      max_size     = 5
      desired_size = 2
      instance_types = ["g4dn.xlarge"] # GPU instances for heavy AI processing if needed
    }
  }
}

# 5. S3 Bucket (With Versioning)
resource "aws_s3_bucket" "nexus_storage" {
  bucket = "nexus-storage-${var.environment}"
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.nexus_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

# (Security Groups elided for brevity)
