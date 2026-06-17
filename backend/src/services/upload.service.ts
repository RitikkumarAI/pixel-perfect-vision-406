import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET_NAME } from "../utils/s3";
import { v4 as uuidv4 } from "uuid";

export class UploadService {
  /**
   * Directly uploads a buffer to S3. Ideal for small files like avatars.
   */
  public async uploadBuffer(
    fileBuffer: Buffer,
    mimetype: string,
    originalName: string,
    folder: string = "general",
  ): Promise<string> {
    const extension = originalName.split(".").pop();
    const key = `${folder}/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
    });

    await s3Client.send(command);

    // In production with a CDN, replace this with the CloudFront URL
    return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  }

  /**
   * Generates a pre-signed URL allowing the frontend to upload a file directly to S3.
   * Crucial for large video or document uploads to avoid hitting the Node.js memory limits.
   */
  public async generatePresignedUrl(
    filename: string,
    contentType: string,
    folder: string = "uploads",
  ) {
    const extension = filename.split(".").pop();
    const key = `${folder}/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // URL valid for 15 minutes
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return {
      presignedUrl,
      fileUrl: `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`,
      key,
    };
  }
}
