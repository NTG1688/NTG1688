import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CloudflareR2Config } from "@/types";

let s3ClientInstance: S3Client | null = null;
let currentBucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "namtrung-media";
let currentPublicDomain = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || "https://media.nhapkhaunamtrung.com";

/**
 * Khởi tạo hoặc cập nhật cấu hình kết nối Cloudflare R2 linh động
 */
export function initR2Client(config?: Partial<CloudflareR2Config>): S3Client {
  const accountId = config?.endpoint ? undefined : process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const endpoint = config?.endpoint || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);
  const accessKeyId = config?.access_key_id || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
  const secretAccessKey = config?.secret_access_key || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";
  
  if (config?.bucket) currentBucketName = config.bucket;
  if (config?.public_domain) currentPublicDomain = config.public_domain;

  s3ClientInstance = new S3Client({
    region: "auto",
    endpoint: endpoint || "https://placeholder.r2.cloudflarestorage.com",
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3ClientInstance;
}

export function getR2Client(): S3Client {
  if (!s3ClientInstance) {
    return initR2Client();
  }
  return s3ClientInstance;
}

/**
 * Tạo URL Upload trực tiếp có chữ ký (Presigned URL)
 * Cho phép client upload trực tiếp lên Cloudflare R2 mà không làm nghẽn server
 */
export async function createPresignedUploadUrl(
  filename: string,
  contentType: string,
  folder: "declarations" | "orders" | "avatars" | "receipts" = "orders"
) {
  const client = getR2Client();
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${folder}/${timestamp}_${randomSuffix}_${cleanFilename}`;

  const command = new PutObjectCommand({
    Bucket: currentBucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  const publicUrl = `${currentPublicDomain.replace(/\/$/, "")}/${key}`;

  return {
    uploadUrl,
    publicUrl,
    key,
  };
}
