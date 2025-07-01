/**
 * File Preview Component
 * Displays file thumbnails, upload progress, and management actions
 */
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/features/shared';
import { FileAttachment } from '@/types/api';
import { getFileIconName, formatFileSize, getFileTypeCategory } from '@/lib/fileUpload';

interface FilePreviewProps {
  file: FileAttachment;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
}

export function FilePreview({ file, onRemove, onRetry }: FilePreviewProps) {
  const { isDark } = useTheme();
  const isImage = getFileTypeCategory(file.type) === 'image';
  const isUploading = file.uploadStatus === 'uploading';
  const hasError = file.uploadStatus === 'error';
  const isUploaded = file.uploadStatus === 'uploaded';

  const getStatusColor = () => {
    switch (file.uploadStatus) {
      case 'uploaded':
        return '#10b981'; // green
      case 'error':
        return '#ef4444'; // red
      case 'uploading':
        return '#3b82f6'; // blue
      default:
        return isDark ? '#6b7280' : '#9ca3af'; // gray
    }
  };

  const getStatusIcon = () => {
    switch (file.uploadStatus) {
      case 'uploaded':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'uploading':
        return null; // Show activity indicator instead
      default:
        return 'time';
    }
  };

  return (
    <View className="w-20 mr-3">
      {/* File preview container */}
      <View className="relative">
        <View className="w-20 h-20 rounded-2xl bg-muted border border-border overflow-hidden">
          {isImage && file.thumbnailUri ? (
            <Image
              source={{ uri: file.thumbnailUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons
                name={getFileIconName(file.type)}
                size={32}
                color={isDark ? '#9ca3af' : '#6b7280'}
              />
            </View>
          )}

          {/* Upload overlay */}
          {(isUploading || hasError) && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center">
              {isUploading ? (
                <ActivityIndicator color="white" size="small" />
              ) : hasError ? (
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
              ) : null}
            </View>
          )}
        </View>

        {/* Status indicator */}
        <View
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
          style={{ backgroundColor: getStatusColor() }}
        >
          {isUploading ? (
            <ActivityIndicator color="white" size={12} />
          ) : (
            <Ionicons
              name={getStatusIcon() || 'time'}
              size={12}
              color="white"
            />
          )}
        </View>

        {/* Remove button */}
        <Pressable
          onPress={() => onRemove(file.id)}
          className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-red-500 items-center justify-center"
        >
          <Ionicons name="close" size={14} color="white" />
        </Pressable>
      </View>

      {/* File info */}
      <View className="mt-2">
        <Text
          className="text-xs text-foreground font-medium"
          numberOfLines={1}
        >
          {file.name}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </Text>

        {/* Upload progress */}
        {isUploading && file.uploadProgress !== undefined && (
          <View className="mt-1">
            <View className="h-1 bg-muted rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-500 transition-all duration-200"
                style={{ width: `${file.uploadProgress}%` }}
              />
            </View>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {file.uploadProgress}%
            </Text>
          </View>
        )}

        {/* Error message */}
        {hasError && (
          <View className="mt-1">
            <Text className="text-xs text-red-500" numberOfLines={2}>
              {file.error || 'Upload failed'}
            </Text>
            {onRetry && (
              <Pressable
                onPress={() => onRetry(file.id)}
                className="mt-1"
              >
                <Text className="text-xs text-blue-500 font-medium">
                  Retry
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}