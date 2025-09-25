import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export interface FileUploadOptions {
  directory: string; // Directory to save file to, relative to upload root
  generateThumbnail?: boolean;
  allowedMimes?: string[];
  maxSize?: number; // in bytes
}

@Injectable()
export class FileUploadService {
  private readonly uploadRoot = process.env.UPLOAD_FILE || '../mot-php-admin'; // Legacy system (PHP) uses ../mot-php-admin to store uploaded files

  private readonly THUMB_SIZES = {
    '100x100': [100, 100],
    '64x64': [64, 64],
    '50x50': [50, 50],
  };

  constructor() {
    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.mkdir(this.uploadRoot, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create upload directory:`, { cause: error });
    }
  }

  /**
   * Generate thumbnails for an image
   * @param filename Original filename
   * @param directory Directory containing the image
   */
  private async generateThumbnails(
    filename: string,
    directory: string
  ): Promise<void> {
    try {
      const originalPath = path.join(this.uploadRoot, directory, filename);

      // Create thumbnails directory if it doesn't exist
      for (const size of Object.keys(this.THUMB_SIZES)) {
        const thumbDir = path.join(this.uploadRoot, directory, 'thumbs', size);
        await fs.mkdir(thumbDir, { recursive: true });
      }

      // Generate thumbnails for each size
      for (const [size, [width, height]] of Object.entries(this.THUMB_SIZES)) {
        const thumbPath = path.join(
          this.uploadRoot,
          directory,
          'thumbs',
          size,
          filename
        );

        await sharp(originalPath)
          .resize(width, height, {
            fit: 'cover',
            position: 'center',
          })
          .toFile(thumbPath);
      }
    } catch (error) {
      throw new Error(`Failed to generate thumbnails:`, { cause: error });
    }
  }

  /**
   * Upload a file with given options
   * @param file The file to upload
   * @param options Upload options
   * @returns The saved filename
   */
  async uploadFile(
    file: Express.Multer.File,
    options: FileUploadOptions
  ): Promise<string> {
    try {
      if (!file) {
        return '';
      }

      // Validate file if needed
      if (
        options.allowedMimes &&
        !options.allowedMimes.includes(file.mimetype)
      ) {
        throw new Error(
          `Invalid file type. Allowed types: ${options.allowedMimes.join(', ')}`
        );
      }

      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(
          `File too large. Maximum size allowed: ${options.maxSize} bytes`
        );
      }

      // Generate unique filename
      const fileExt = path.extname(file.originalname);
      const uniqueFilename = `${uuidv4()}${fileExt}`;

      // Create full directory path
      const uploadDir = path.join(this.uploadRoot, options.directory);
      await fs.mkdir(uploadDir, { recursive: true });

      // Save file
      const filePath = path.join(uploadDir, uniqueFilename);
      await fs.writeFile(filePath, file.buffer);

      // Generate thumbnail if needed
      if (options.generateThumbnail) {
        await this.generateThumbnails(uniqueFilename, options.directory);
      }

      return uniqueFilename;
    } catch (error) {
      throw new Error(`Failed to upload file:`, { cause: error });
    }
  }

  /**
   * Delete a file and its thumbnails
   * @param filename The filename to delete
   * @param directory The directory containing the file
   */
  async deleteFile(filename: string, directory: string): Promise<void> {
    try {
      // Delete original file
      const filePath = path.join(this.uploadRoot, directory, filename);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        // Ignore errors if file doesn't exist
        const error = err as NodeJS.ErrnoException;
        if (error.code !== 'ENOENT') {
          throw err;
        }
      }

      // Delete thumbnails if they exist
      for (const size of Object.keys(this.THUMB_SIZES)) {
        try {
          const thumbPath = path.join(
            this.uploadRoot,
            directory,
            'thumbs',
            size,
            filename
          );
          await fs.unlink(thumbPath);
        } catch (err) {
          // Ignore errors if thumbnail doesn't exist
          const error = err as NodeJS.ErrnoException;
          if (error.code !== 'ENOENT') {
            throw err;
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to delete file:`, { cause: error });
    }
  }
}
