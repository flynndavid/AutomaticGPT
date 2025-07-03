import React from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/features/shared';
import { ModelConfig } from '@/config/models';

interface ModelSelectorProps {
  visible: boolean;
  onClose: () => void;
  selectedModel: ModelConfig | null;
  availableModels: ModelConfig[];
  onSelectModel: (modelId: string) => void;
}

interface ModelGroupProps {
  provider: 'openai' | 'anthropic';
  models: ModelConfig[];
  selectedModel: ModelConfig | null;
  onSelectModel: (modelId: string) => void;
  isDark: boolean;
}

function ModelGroup({ provider, models, selectedModel, onSelectModel, isDark }: ModelGroupProps) {
  const providerName = provider === 'openai' ? 'OpenAI' : 'Anthropic';
  const providerIcon = provider === 'openai' ? 'logo-javascript' : 'chatbox-outline';

  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <Ionicons name={providerIcon} size={20} color={isDark ? '#fff' : '#000'} />
        <Text className="text-lg font-semibold text-foreground ml-2">{providerName}</Text>
      </View>
      
      {models.map((model) => (
        <Pressable
          key={model.id}
          onPress={() => onSelectModel(model.id)}
          className={`p-4 rounded-lg mb-2 border ${
            selectedModel?.id === model.id
              ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
              : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-medium text-foreground">{model.name}</Text>
              <Text className="text-sm text-muted-foreground mt-1">{model.description}</Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Max tokens: {model.maxTokens.toLocaleString()}
              </Text>
            </View>
            {selectedModel?.id === model.id && (
              <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function ModelSelector({ 
  visible, 
  onClose, 
  selectedModel, 
  availableModels, 
  onSelectModel 
}: ModelSelectorProps) {
  const { isDark } = useTheme();

  // Group models by provider
  const openaiModels = availableModels.filter(model => model.provider === 'openai');
  const anthropicModels = availableModels.filter(model => model.provider === 'anthropic');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-xl font-semibold text-foreground">Select Model</Text>
          <Pressable onPress={onClose} className="w-8 h-8 items-center justify-center">
            <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4">
          {openaiModels.length > 0 && (
            <ModelGroup
              provider="openai"
              models={openaiModels}
              selectedModel={selectedModel}
              onSelectModel={onSelectModel}
              isDark={isDark}
            />
          )}
          
          {anthropicModels.length > 0 && (
            <ModelGroup
              provider="anthropic"
              models={anthropicModels}
              selectedModel={selectedModel}
              onSelectModel={onSelectModel}
              isDark={isDark}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}