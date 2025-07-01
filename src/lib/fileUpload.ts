/**
 * File Upload Utilities
 * Handles file validation, image processing, and Supabase storage integration
 */
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';
import { FileAttachment } from '@/types/api';

// Configuration constants
export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 10485760, // 10MB default
  maxImageSize: 1024, // Max width/height for AI processing
  supportedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] as const,
  supportedDocumentTypes: ['application/pdf', 'text/plain', 'text/csv'] as const,
  thumbnailSize: 150,
} as const;

export const SUPPORTED_FILE_TYPES: string[] = [
  ...FILE_UPLOAD_CONFIG.supportedImageTypes,
  ...FILE_UPLOAD_CONFIG.supportedDocumentTypes,
];

/**
 * File validation utilities
 */
export const validateFile = (file: { size: number; type: string; name: string }) => {
  const errors: string[] = [];

  // Check file size
  if (file.size > FILE_UPLOAD_CONFIG.maxFileSize) {
    const maxSizeMB = FILE_UPLOAD_CONFIG.maxFileSize / (1024 * 1024);
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  // Check file type
  if (SUPPORTED_FILE_TYPES.indexOf(file.type) === -1) {
    errors.push('File type not supported');
  }

  // Check file name
  if (!file.name || file.name.length === 0) {
    errors.push('File name is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Image processing utilities
 */
export const processImage = async (uri: string): Promise<{
  processedUri: string;
  thumbnailUri: string;
  width: number;
  height: number;
}> => {
  try {
    // Get image info
    const imageInfo = await ImageManipulator.manipulateAsync(uri, [], {
      base64: false,
    });

    // Resize if needed (maintain aspect ratio)
    const shouldResize = 
      imageInfo.width > FILE_UPLOAD_CONFIG.maxImageSize || 
      imageInfo.height > FILE_UPLOAD_CONFIG.maxImageSize;

    let processedUri = uri;
    if (shouldResize) {
      const aspectRatio = imageInfo.width / imageInfo.height;
      let newWidth = FILE_UPLOAD_CONFIG.maxImageSize;
      let newHeight = FILE_UPLOAD_CONFIG.maxImageSize;

      if (aspectRatio > 1) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }

      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: Math.floor(newWidth), height: Math.floor(newHeight) } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      processedUri = resizedImage.uri;
    }

    // Create thumbnail
    const thumbnailSize = FILE_UPLOAD_CONFIG.thumbnailSize;
    const thumbnailImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: thumbnailSize, height: thumbnailSize } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    return {
      processedUri,
      thumbnailUri: thumbnailImage.uri,
      width: shouldResize ? Math.floor(imageInfo.width > imageInfo.height ? FILE_UPLOAD_CONFIG.maxImageSize : FILE_UPLOAD_CONFIG.maxImageSize * (imageInfo.width / imageInfo.height)) : imageInfo.width,
      height: shouldResize ? Math.floor(imageInfo.height > imageInfo.width ? FILE_UPLOAD_CONFIG.maxImageSize : FILE_UPLOAD_CONFIG.maxImageSize * (imageInfo.height / imageInfo.width)) : imageInfo.height,
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Convert image to base64 for AI processing
 */
export const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Determine MIME type from URI
    const extension = uri.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg'; // default
    
    switch (extension) {
      case 'png':
        mimeType = 'image/png';
        break;
      case 'gif':
        mimeType = 'image/gif';
        break;
      case 'webp':
        mimeType = 'image/webp';
        break;
    }

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to convert image to base64');
  }
};

/**
 * Read text file content
 */
export const readTextFile = async (uri: string): Promise<string> => {
  try {
    const content = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return content;
  } catch (error) {
    console.error('Error reading text file:', error);
    throw new Error('Failed to read text file');
  }
};

/**
 * Upload file to Supabase storage
 */
export const uploadFileToStorage = async (
  file: FileAttachment,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Generate unique file path
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomStr}.${extension}`;
    const filePath = `chat-attachments/${fileName}`;

    // Read file as binary
    const fileInfo = await FileSystem.getInfoAsync(file.uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    // For web compatibility, we need to handle file upload differently
    let fileData: ArrayBuffer;
    
    if (typeof window !== 'undefined') {
      // Web environment
      const response = await fetch(file.uri);
      fileData = await response.arrayBuffer();
    } else {
      // React Native environment
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileData = bytes.buffer;
    }

    // Simulate progress updates
    onProgress?.(10);

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: false,
      });

    onProgress?.(80);

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chat-files')
      .getPublicUrl(filePath);

    onProgress?.(100);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete file from Supabase storage
 */
export const deleteFileFromStorage = async (path: string): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const { error } = await supabase.storage
      .from('chat-files')
      .remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get file type category
 */
export const getFileTypeCategory = (mimeType: string): 'image' | 'document' | 'unknown' => {
  // Check if it's an image type
  for (let i = 0; i < FILE_UPLOAD_CONFIG.supportedImageTypes.length; i++) {
    if (FILE_UPLOAD_CONFIG.supportedImageTypes[i] === mimeType) {
      return 'image';
    }
  }
  
  // Check if it's a document type
  for (let i = 0; i < FILE_UPLOAD_CONFIG.supportedDocumentTypes.length; i++) {
    if (FILE_UPLOAD_CONFIG.supportedDocumentTypes[i] === mimeType) {
      return 'document';
    }
  }
  
  return 'unknown';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file icon name based on type
 */
export const getFileIconName = (mimeType: string): string => {
  switch (getFileTypeCategory(mimeType)) {
    case 'image':
      return 'image';
    case 'document':
      if (mimeType === 'application/pdf') return 'document-text';
      return 'document';
    default:
      return 'document';
  }
};