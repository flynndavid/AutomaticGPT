import { TextInput, View, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/features/shared';

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

  return (
    <View className="flex-row items-center bg-input rounded-3xl px-1 py-1 min-h-[48px] max-h-[120px] mx-4">
      <Pressable onPress={onPlusPress} className="w-10 h-10 items-center justify-center mr-1">
        <Ionicons name="add" size={24} color={isDark ? '#9ca3af' : '#666'} />
      </Pressable>

      <TextInput
        className="flex-1 text-base leading-5 px-2 py-2.5 text-foreground max-h-[100px]"
        placeholder="Ask anything"
        placeholderTextColor={isDark ? '#6b7280' : '#999'}
        value={input}
        onChangeText={onInputChange}
        onSubmitEditing={onSend}
        blurOnSubmit={false}
        multiline
        textAlignVertical="center"
      />

      <View className="flex-row items-center gap-1">
        <Pressable onPress={onVoicePress} className="w-10 h-10 items-center justify-center">
          <Ionicons name="mic" size={20} color={isDark ? '#9ca3af' : '#666'} />
        </Pressable>

        <Pressable
          onPress={onSend}
          disabled={!canSend}
          className={`w-10 h-10 rounded-full justify-center items-center ${
            canSend ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="arrow-up" size={20} color="white" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
