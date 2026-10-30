/* eslint-disable @typescript-eslint/no-explicit-any */
import { isCloudinaryConfigured, uploadToCloudinary } from "../config/cloudinary.js";

export type IFolderName = "image" | "slips" | "media" | "doc" | string;

export const getSingleFilePath = (
  files: any,
  fieldName = "image",
  folderOverride?: string,
) => {
  const fileField = files && files[fieldName];
  if (fileField && Array.isArray(fileField) && fileField.length > 0) {
    let folder = folderOverride;
    if (!folder) {
      if (fieldName === "slip" || fieldName === "donationSlip") {
        folder = "slips";
      } else if (
        fieldName === "profileImage" ||
        fieldName === "avatar" ||
        fieldName === "image"
      ) {
        folder = "image";
      } else {
        folder = fieldName;
      }
    }
    return `/${folder}/${fileField[0].filename}`;
  }

  return undefined;
};

export const getMultipleFilesPath = (
  files: any,
  fieldName = "image",
  folderOverride?: string,
) => {
  const folderFiles = files && files[fieldName];
  if (folderFiles && Array.isArray(folderFiles)) {
    const folder = folderOverride || fieldName;
    return folderFiles.map((file: any) => `/${folder}/${file.filename}`);
  }

  return undefined;
};

/**
 * Resolves an uploaded file from req.files.
 * If Cloudinary is configured, it uploads the file to Cloudinary and returns the secure URL.
 * Otherwise, it falls back to the local uploads directory path.
 */
export const uploadFileToCloudinaryOrLocal = async (
  files: any,
  fieldNames: string | string[],
  cloudinaryFolder: string = "phulpur_blood_network",
): Promise<string | undefined> => {
  const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];

  for (const field of fields) {
    const fileField = files && files[field];
    if (fileField && Array.isArray(fileField) && fileField.length > 0) {
      const file = fileField[0];

      // If Cloudinary credentials are set up in .env, upload directly to Cloudinary
      if (isCloudinaryConfigured() && file.path) {
        try {
          const uploadRes = await uploadToCloudinary(file.path, cloudinaryFolder, true);
          if (uploadRes?.secure_url) {
            return uploadRes.secure_url;
          }
        } catch (error) {
          console.error(
            `Cloudinary upload failed for ${field}, falling back to local storage:`,
            error,
          );
        }
      }

      // Fallback to local static file path
      let localFolder = "image";
      if (field === "slip" || field === "donationSlip") {
        localFolder = "slips";
      } else if (field === "media" || field === "video") {
        localFolder = "media";
      } else if (field === "doc" || field === "document") {
        localFolder = "doc";
      }

      return `/${localFolder}/${file.filename}`;
    }
  }

  return undefined;
};

export default {
  getSingleFilePath,
  getMultipleFilesPath,
  uploadFileToCloudinaryOrLocal,
};
