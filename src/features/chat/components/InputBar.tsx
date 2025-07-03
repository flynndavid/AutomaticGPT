import { TextInput, View, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/features/shared';
import { webInteractionUtils, webLayoutUtils } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface InputBarProps {
  input: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onVoicePress?: () => void;
  onPlusPress?: () => void;
}

export function InputBar({
  input,
  onInputChange,
  onSend,
  isLoading,
  onVoicePress,
  onPlusPress,
}: InputBarProps) {
  const canSend = input.trim() && !isLoading;
  const { isDark } = useTheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      className="bg-input rounded-t-3xl shadow-lg border-t border-border/10"
      style={{ paddingBottom: bottom }}
    >
      <View className="px-4 pt-4 pb-2">
        {/* Full width input field */}
        <TextInput
          className="text-lg leading-6 px-4 py-3 text-foreground max-h-[120px] min-h-[48px]"
          placeholder="Ask anything"
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
            <Ionicons name="add" size={28} color={isDark ? '#9ca3af' : '#666'} />
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
      </View>
    </View>
  );
}
