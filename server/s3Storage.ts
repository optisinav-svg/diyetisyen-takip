import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.AWS_S3_BUCKET || "diyetisyen-takip-exports";

/**
 * Upload file to S3
 */
export async function uploadFileToS3(
  fileKey: string,
  fileContent: string | Buffer,
  contentType: string = "application/json"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn("[S3] AWS credentials not configured. File will not be uploaded.");
      return { success: true, url: undefined };
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: fileContent,
      ContentType: contentType,
    });

    await s3Client.send(command);

    console.log(`File uploaded to S3: s3://${bucketName}/${fileKey}`);

    // Generate signed URL (valid for 7 days)
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 7 * 24 * 60 * 60 });

    return { success: true, url };
  } catch (error) {
    console.error("S3 upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload file to S3",
    };
  }
}

/**
 * Generate S3 file key for export
 */
export function generateExportFileKey(
  userId: number,
  reportType: string,
  format: "csv" | "json"
): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `exports/user-${userId}/${reportType}-${timestamp}.${format === "csv" ? "csv" : "json"}`;
}

/**
 * Upload meal report to S3
 */
export async function uploadMealReportToS3(
  userId: number,
  reportData: string,
  format: "csv" | "json"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileKey = generateExportFileKey(userId, "meal-report", format);
    const contentType = format === "csv" ? "text/csv" : "application/json";

    return uploadFileToS3(fileKey, reportData, contentType);
  } catch (error) {
    console.error("Upload meal report error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload meal report",
    };
  }
}

/**
 * Upload measurements report to S3
 */
export async function uploadMeasurementsReportToS3(
  userId: number,
  reportData: string,
  format: "csv" | "json"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileKey = generateExportFileKey(userId, "measurements-report", format);
    const contentType = format === "csv" ? "text/csv" : "application/json";

    return uploadFileToS3(fileKey, reportData, contentType);
  } catch (error) {
    console.error("Upload measurements report error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload measurements report",
    };
  }
}

/**
 * Upload income report to S3
 */
export async function uploadIncomeReportToS3(
  userId: number,
  reportData: string,
  format: "csv" | "json"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileKey = generateExportFileKey(userId, "income-report", format);
    const contentType = format === "csv" ? "text/csv" : "application/json";

    return uploadFileToS3(fileKey, reportData, contentType);
  } catch (error) {
    console.error("Upload income report error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload income report",
    };
  }
}

/**
 * Upload performance report to S3
 */
export async function uploadPerformanceReportToS3(
  userId: number,
  reportData: string,
  format: "csv" | "json"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileKey = generateExportFileKey(userId, "performance-report", format);
    const contentType = format === "csv" ? "text/csv" : "application/json";

    return uploadFileToS3(fileKey, reportData, contentType);
  } catch (error) {
    console.error("Upload performance report error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload performance report",
    };
  }
}

/**
 * Upload user data export to S3 (GDPR)
 */
export async function uploadUserDataExportToS3(
  userId: number,
  userData: string,
  format: "csv" | "json"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileKey = generateExportFileKey(userId, "user-data-export", format);
    const contentType = format === "csv" ? "text/csv" : "application/json";

    return uploadFileToS3(fileKey, userData, contentType);
  } catch (error) {
    console.error("Upload user data export error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload user data export",
    };
  }
}
