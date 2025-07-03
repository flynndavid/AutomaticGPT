import { Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/features/shared';
import { useState } from 'react';
import { useModelSelection } from '../hooks/useModelSelection';
import { ModelSelector } from './ModelSelector';

interface ChatHeaderProps {
  onMenuPress?: () => void;
  onNewChatPress?: () => void;
}

export function ChatHeader({ onMenuPress, onNewChatPress }: ChatHeaderProps) {
  const { isDark } = useTheme();
  const { selectedModel, selectModel, availableModels, isLoading } = useModelSelection();
  const [showModelSelector, setShowModelSelector] = useState(false);

  const handleModelSelectorPress = () => {
    setShowModelSelector(true);
  };

  const handleModelSelect = async (modelId: string) => {
    await selectModel(modelId);
    setShowModelSelector(false);
  };

  return (
    <>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={onMenuPress} className="w-10 h-10 items-center justify-center">
          <Ionicons name="menu" size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>

        <Pressable 
          onPress={handleModelSelectorPress} 
          className="flex-row items-center flex-1 justify-center"
        >
          <Text className="text-lg font-semibold text-foreground mr-1">
            {isLoading ? 'Loading...' : selectedModel?.name || 'Select Model'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={isDark ? '#9ca3af' : '#666'}
            className="ml-0.5"
          />
        </Pressable>

        <View className="flex-row items-center gap-2">
          <Pressable onPress={onNewChatPress} className="w-10 h-10 items-center justify-center">
            <Ionicons name="create-outline" size={24} color={isDark ? '#fff' : '#000'} />
          </Pressable>
        </View>
      </View>

      <ModelSelector
        visible={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        selectedModel={selectedModel}
        availableModels={availableModels}
        onSelectModel={handleModelSelect}
      />
    </>
  );
}
