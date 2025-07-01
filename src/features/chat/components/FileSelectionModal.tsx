/**
 * File Selection Modal
 * Native action sheet style interface for selecting files
 */
import { View, Text, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/features/shared';

interface FileSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFiles: () => void;
  onSelectImages: () => void;
  onCaptureImage: () => void;
}

export function FileSelectionModal({
  visible,
  onClose,
  onSelectFiles,
  onSelectImages,
  onCaptureImage,
}: FileSelectionModalProps) {
  const { bottom } = useSafeAreaInsets();
  const { isDark } = useTheme();

  const options = [
    {
      icon: 'camera' as const,
      title: 'Take Photo',
      subtitle: 'Capture with camera',
      onPress: () => {
        onClose();
        onCaptureImage();
      },
    },
    {
      icon: 'images' as const,
      title: 'Photo Library',
      subtitle: 'Choose from photos',
      onPress: () => {
        onClose();
        onSelectImages();
      },
    },
    {
      icon: 'document' as const,
      title: 'Browse Files',
      subtitle: 'Select documents',
      onPress: () => {
        onClose();
        onSelectFiles();
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
      >
        <Pressable
          className="bg-background rounded-t-3xl"
          style={{ paddingBottom: bottom + 16 }}
          onPress={() => {}} // Prevent closing when tapping content
        >
          {/* Header */}
          <View className="px-6 py-4 border-b border-border/10">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">
                Add Files
              </Text>
              <Pressable
                onPress={onClose}
                className="w-8 h-8 items-center justify-center rounded-full bg-muted"
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? '#9ca3af' : '#6b7280'}
                />
              </Pressable>
            </View>
            <Text className="text-sm text-muted-foreground mt-1">
              Choose how you'd like to add files to your message
            </Text>
          </View>

          {/* Options */}
          <View className="px-6 py-4">
            {options.map((option, index) => (
              <Pressable
                key={option.title}
                onPress={option.onPress}
                className={`flex-row items-center p-4 rounded-2xl ${
                  index < options.length - 1 ? 'mb-3' : ''
                } bg-muted/50 active:bg-muted`}
              >
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color="#3b82f6"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-medium text-foreground">
                    {option.title}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {option.subtitle}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? '#9ca3af' : '#6b7280'}
                />
              </Pressable>
            ))}
          </View>

          {/* Footer note */}
          <View className="px-6 pb-2">
            <Text className="text-xs text-muted-foreground text-center">
              Supported: Images, PDFs, and text files up to 10MB
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}