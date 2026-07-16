import { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';

export type UploadFolder = 'avatars' | 'banners' | 'posts' | 'projects';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

const FOLDER_CONFIG: Record<UploadFolder, {
  folder: string;
  maxBytes: number;
  transformation: object[];
}> = {
  avatars: {
    folder: 'synq/avatars',
    maxBytes: 5 * 1024 * 1024, // 5 MB
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
  },
  banners: {
    folder: 'synq/banners',
    maxBytes: 10 * 1024 * 1024, // 10 MB
    transformation: [
      { width: 1500, height: 500, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
  },
  posts: {
    folder: 'synq/posts',
    maxBytes: 8 * 1024 * 1024,
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
  },
  projects: {
    folder: 'synq/projects',
    maxBytes: 8 * 1024 * 1024,
    transformation: [
      { width: 1400, crop: 'limit' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
  },
};

export class UploadService {
  /**
   * Upload a file buffer to Cloudinary.
   * Returns structured result with URL and public_id.
   */
  static async upload(
    buffer: Buffer,
    folder: UploadFolder,
    userId: string,
  ): Promise<UploadResult> {
    const config = FOLDER_CONFIG[folder];

    if (buffer.byteLength > config.maxBytes) {
      throw ApiError.badRequest(
        `File too large. Maximum size is ${config.maxBytes / (1024 * 1024)} MB.`,
      );
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: config.folder,
          public_id: `${userId}_${Date.now()}`,
          transformation: config.transformation,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          overwrite: true,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(ApiError.internal('Image upload failed. Please try again.'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );
      stream.end(buffer);
    });
  }

  /**
   * Delete an image from Cloudinary by public_id.
   * Silent fail — don't break the request if deletion fails.
   */
  static async delete(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error(`Cloudinary delete failed for ${publicId}:`, err);
    }
  }

  /**
   * Delete multiple images — used when a project is deleted.
   */
  static async deleteMany(publicIds: string[]): Promise<void> {
    await Promise.allSettled(publicIds.map((id) => this.delete(id)));
  }
}
