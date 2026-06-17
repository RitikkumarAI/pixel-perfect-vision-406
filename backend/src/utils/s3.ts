import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "us-east-1";

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy-access-key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy-secret-key",
  },
});

export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "nexus-ai-workspace-bucket";
