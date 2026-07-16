import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { ApiError } from '../utils/ApiError';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only JPEG, PNG, WebP, and GIF images are allowed'));
  }
};

// Store in memory — we stream directly to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB hard cap (Cloudinary will enforce per-folder limits)
    files: 4,                    // max 4 files per request (project screenshots)
  },
});

// Named exports for common use cases
export const uploadSingle = (field: string) => upload.single(field);
export const uploadArray  = (field: string, max: number) => upload.array(field, max);
