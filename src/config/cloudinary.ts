import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import env from "./env.js";

// Initialize Cloudinary with environment variables
cloudinary.config({
  cloud_name: env.cloudinary.cloud_name,
  api_key: env.cloudinary.api_key,
  api_secret: env.cloudinary.api_secret,
  secure: true,
});

/**
 * Checks if Cloudinary is configured with valid credentials.
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    env.cloudinary.cloud_name &&
    env.cloudinary.api_key &&
    env.cloudinary.api_secret
  );
};

/**
 * Uploads a local file from disk to Cloudinary and optionally removes the local copy.
 *
 * @param filePath Full path to the local file
 * @param folder Target folder inside Cloudinary
 * @param deleteLocalAfterUpload Auto-remove local file on upload success (defaults to true)
 */
export const uploadToCloudinary = async (
  filePath: string,
  folder: string = "phulpur_blood_network",
  deleteLocalAfterUpload: boolean = true
): Promise<UploadApiResponse | null> => {
  if (!isCloudinaryConfigured()) {
    console.warn("⚠️ Cloudinary credentials not configured. Skipping Cloudinary upload.");
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });

    if (deleteLocalAfterUpload && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn("Could not delete local temporary file after Cloudinary upload:", err);
      }
    }

    return result;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};

/**
 * Uploads a memory Buffer to Cloudinary using upload_stream.
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string = "phulpur_blood_network",
  filename?: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: filename,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload stream failed"));
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Deletes an asset from Cloudinary using either public_id or its full secure URL.
 */
export const deleteFromCloudinary = async (
  publicIdOrUrl: string
): Promise<any> => {
  try {
    if (!isCloudinaryConfigured() || !publicIdOrUrl) return null;

    let publicId = publicIdOrUrl;
    if (publicIdOrUrl.startsWith("http")) {
      const parts = publicIdOrUrl.split("/");
      const uploadIdx = parts.findIndex((p) => p === "upload");
      if (uploadIdx !== -1) {
        const pathSegments = parts.slice(uploadIdx + 1);
        if (pathSegments[0] && /^v\d+$/.test(pathSegments[0])) {
          pathSegments.shift();
        }
        const fullPath = pathSegments.join("/");
        publicId = fullPath.replace(/\.[^/.]+$/, "");
      }
    }

    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    return null;
  }
};

export { cloudinary };
export default cloudinary;
