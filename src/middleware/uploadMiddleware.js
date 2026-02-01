import multer from "multer";
import logger from "../utils/system/logger.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`));
  }
};

export const uploadImageMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export function handleMulterErrors(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    logger.warn(
      `Multer error: ${err.code}. [module=middleware/upload, event=multer_error]`
    );
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err) {
    logger.warn(
      `File upload rejected: ${err.message}. [module=middleware/upload, event=file_rejected]`
    );
    return res.status(400).json({ message: err.message });
  }
  next();
}
