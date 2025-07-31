import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadOptions {
  directory: string; // Directory to save file to, relative to upload root
  generateThumbnail?: boolean;
  allowedMimes?: string[];
  maxSize?: number; // in bytes
}

@Injectable()
export class FileUploadService {
  private readonly uploadRoot = 'public/uploads'; // Can be configured from env

  constructor() {
    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.mkdir(this.uploadRoot, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create upload directory: ${error.message}`);
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
        // TODO: Implement thumbnail generation
        // Could use sharp or similar library
        // const thumbnail = await this.generateThumbnail(filePath);
      }

      return uniqueFilename;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Delete a file
   * @param filename The filename to delete
   * @param directory The directory containing the file
   */
  async deleteFile(filename: string, directory: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadRoot, directory, filename);
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
