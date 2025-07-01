/**
 * File Upload Hook
 * Manages file upload state, queue, and Supabase integration
 */
import { useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { FileAttachment } from '@/types/api';
import {
  validateFile,
  processImage,
  uploadFileToStorage,
  getFileTypeCategory,
  formatFileSize,
} from '@/lib/fileUpload';

interface UseFileUploadReturn {
  attachments: FileAttachment[];
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  selectFiles: () => void;
  selectImages: () => void;
  captureImage: () => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  uploadPendingFiles: () => Promise<void>;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  /**
   * Create file attachment object from picker result
   */
  const createFileAttachment = (file: {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  }): FileAttachment => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    return {
      id,
      name: file.name || 'Unknown file',
      type: file.mimeType || 'application/octet-stream',
      size: file.size || 0,
      uri: file.uri,
      uploadStatus: 'pending',
      uploadProgress: 0,
    };
  };

  /**
   * Validate and add files to attachments
   */
  const addFiles = useCallback(async (files: FileAttachment[]) => {
    const validFiles: FileAttachment[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const validation = validateFile(file);
      if (validation.isValid) {
        // Process images to create thumbnails
        if (getFileTypeCategory(file.type) === 'image') {
          try {
            const processed = await processImage(file.uri);
            validFiles.push({
              ...file,
              thumbnailUri: processed.thumbnailUri,
            });
          } catch (error) {
            console.error('Error processing image:', error);
            errors.push(`Failed to process ${file.name}`);
          }
        } else {
          validFiles.push(file);
        }
      } else {
        errors.push(`${file.name}: ${validation.errors.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      Alert.alert('File Upload Error', errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
    }
  }, []);

  /**
   * Select files using document picker
   */
  const selectFiles = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const files = result.assets.map(asset => createFileAttachment({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType,
          size: asset.size,
        }));
        await addFiles(files);
      }
    } catch (error) {
      console.error('Error selecting files:', error);
      Alert.alert('Error', 'Failed to select files');
    }
  }, [addFiles]);

  /**
   * Select images from photo library
   */
  const selectImages = useCallback(async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets) {
        const files = result.assets.map(asset => createFileAttachment({
          uri: asset.uri,
          name: `image_${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
          size: asset.fileSize,
        }));
        await addFiles(files);
      }
    } catch (error) {
      console.error('Error selecting images:', error);
      Alert.alert('Error', 'Failed to select images');
    }
  }, [addFiles]);

  /**
   * Capture image using camera
   */
  const captureImage = useCallback(async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const file = createFileAttachment({
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
          size: asset.fileSize,
        });
        await addFiles([file]);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  }, [addFiles]);

  /**
   * Remove attachment by ID
   */
  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(file => file.id !== id));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  }, []);

  /**
   * Clear all attachments
   */
  const clearAttachments = useCallback(() => {
    setAttachments([]);
    setUploadProgress({});
  }, []);

  /**
   * Upload all pending files to Supabase storage
   */
  const uploadPendingFiles = useCallback(async () => {
    const pendingFiles = attachments.filter(file => file.uploadStatus === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const file of pendingFiles) {
        // Update status to uploading
        setAttachments(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, uploadStatus: 'uploading' as const }
              : f
          )
        );

        try {
          // Upload file with progress tracking
          const result = await uploadFileToStorage(file, (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [file.id]: progress,
            }));
          });

          // Update file with upload result
          setAttachments(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { 
                    ...f, 
                    uploadStatus: 'uploaded' as const,
                    supabaseUrl: result.url,
                    uploadProgress: 100,
                  }
                : f
            )
          );
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          
          // Update file with error status
          setAttachments(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { 
                    ...f, 
                    uploadStatus: 'error' as const,
                    error: error instanceof Error ? error.message : 'Upload failed',
                  }
                : f
            )
          );
        }
      }
    } finally {
      setIsUploading(false);
    }
  }, [attachments]);

  return {
    attachments,
    isUploading,
    uploadProgress,
    selectFiles,
    selectImages,
    captureImage,
    removeAttachment,
    clearAttachments,
    uploadPendingFiles,
  };
};