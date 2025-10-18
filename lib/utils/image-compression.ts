import imageCompression from "browser-image-compression";

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  initialQuality?: number;
  fileType?: string;
}

export const defaultCompressionOptions: CompressionOptions = {
  maxSizeMB: 0.5, // Maximum file size in MB
  maxWidthOrHeight: 800, // Maximum width or height in pixels
  initialQuality: 0.8, // Initial quality (0-1)
  fileType: "image/jpeg", // Output file type
};

/**
 * Compress an image file to reduce its size while maintaining quality
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise<File> - The compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = defaultCompressionOptions
): Promise<File> {
  const compressionOptions = {
    ...defaultCompressionOptions,
    ...options,
    useWebWorker: true,
  };

  try {
    const originalSize = (file.size / 1024 / 1024).toFixed(2);

    const compressedFile = await imageCompression(file, compressionOptions);

    const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
    const compressionRatio = (
      ((file.size - compressedFile.size) / file.size) *
      100
    ).toFixed(1);

    console.log(`Image compression successful:`);
    console.log(`- Original size: ${originalSize}MB`);
    console.log(`- Compressed size: ${compressedSize}MB`);
    console.log(`- Compression ratio: ${compressionRatio}%`);

    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    throw new Error(
      "Failed to compress image. Please try with a different image."
    );
  }
}

/**
 * Validate an image file before compression
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB before compression
 * @returns boolean - Whether the file is valid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "Please select a valid image file (PNG, JPG, JPEG, etc.)",
    };
  }

  // Check file size
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `Image file is too large. Please select an image smaller than ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Create a preview URL for an image file
 * @param file - The image file
 * @returns Promise<string> - The preview URL
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get file size in a human-readable format
 * @param bytes - File size in bytes
 * @returns string - Human-readable file size
 */
export function getFileSizeString(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}



