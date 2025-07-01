import { TextInput, View, Pressable, ActivityIndicator, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/features/shared';
import { FileAttachment } from '@/types/api';
import { FilePreview } from './FilePreview';

interface InputBarProps {
  input: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onVoicePress?: () => void;
  onPlusPress?: () => void;
  attachments?: FileAttachment[];
  onRemoveAttachment?: (id: string) => void;
  canSend?: boolean;
}

export function InputBar({
  input,
  onInputChange,
  onSend,
  isLoading,
  onVoicePress,
  onPlusPress,
  attachments = [],
  onRemoveAttachment,
  canSend: canSendProp,
}: InputBarProps) {
  const hasContent = input.trim() || attachments.length > 0;
  const allFilesUploaded = attachments.length === 0 || attachments.every(file => file.uploadStatus === 'uploaded');
  const canSend = canSendProp !== undefined ? canSendProp : (hasContent && !isLoading && allFilesUploaded);
  const { isDark } = useTheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      className="bg-input rounded-t-3xl shadow-lg border-t border-border/10"
      style={{ paddingBottom: bottom }}
    >
      <View className="px-4 pt-4 pb-2">
        {/* File attachments preview */}
        {attachments.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {attachments.map((file) => (
              <FilePreview
                key={file.id}
                file={file}
                onRemove={onRemoveAttachment || (() => {})}
              />
            ))}
          </ScrollView>
        )}

        {/* Full width input field */}
        <TextInput
          className="text-lg leading-6 px-4 py-3 text-foreground max-h-[120px] min-h-[48px]"
          placeholder={attachments.length > 0 ? "Add a message..." : "Ask anything"}
          placeholderTextColor={isDark ? '#6b7280' : '#999'}
          value={input}
          onChangeText={onInputChange}
          onSubmitEditing={onSend}
          blurOnSubmit={false}
          multiline
          textAlignVertical="top"
        />

        {/* Button row below input */}
        <View className="flex-row items-center justify-between pt-2">
          <Pressable onPress={onPlusPress} className="w-12 h-12 items-center justify-center">
            <Ionicons 
              name={attachments.length > 0 ? "add-circle" : "add"} 
              size={28} 
              color={attachments.length > 0 ? '#3b82f6' : (isDark ? '#9ca3af' : '#666')} 
            />
          </Pressable>

          <View className="flex-row items-center gap-3">
            <Pressable onPress={onVoicePress} className="w-12 h-12 items-center justify-center">
              <Ionicons name="mic" size={24} color={isDark ? '#9ca3af' : '#666'} />
            </Pressable>

            <Pressable
              onPress={onSend}
              disabled={!canSend}
              className={`w-12 h-12 rounded-full justify-center items-center ${
                canSend ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons name="arrow-up" size={24} color="white" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Upload status indicator */}
        {attachments.length > 0 && !allFilesUploaded && (
          <View className="flex-row items-center mt-2 px-2">
            <ActivityIndicator size="small" color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className="text-xs text-muted-foreground ml-2">
              Uploading files...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
