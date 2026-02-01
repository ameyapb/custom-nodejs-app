import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/system/logger.js";

const STORAGE_DIR = path.resolve(process.cwd(), "storage", "images");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (err) {
    logger.error("Failed to create storage directory", err);
    throw err;
  }
}

export async function saveImageFile(imageBuffer, originalFilename) {
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error("Image buffer is empty");
  }

  if (imageBuffer.length > MAX_FILE_SIZE) {
    throw new Error(`File exceeds maximum size of ${MAX_FILE_SIZE} bytes`);
  }

  try {
    await ensureStorageDir();

    const fileExtension = path.extname(originalFilename);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(STORAGE_DIR, uniqueFilename);

    await fs.writeFile(filePath, imageBuffer);
    logger.info(
      `Image file saved. filename=${uniqueFilename} size=${imageBuffer.length}. [module=services/imageStorage, event=file_saved]`
    );
    return {
      filename: uniqueFilename,
      filePath: filePath,
      fileSizeBytes: imageBuffer.length,
    };
  } catch (err) {
    logger.error("Failed to save image file", err);
    throw err;
  }
}

export async function deleteImageFile(filePath) {
  try {
    await fs.unlink(filePath);
    logger.info(
      `Image file deleted. [module=services/imageStorage, event=file_deleted]`
    );
  } catch (err) {
    logger.error("Failed to delete image file", err);
    throw err;
  }
}

export async function readImageFile(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch (err) {
    logger.error("Failed to read image file", err);
    throw err;
  }
}
