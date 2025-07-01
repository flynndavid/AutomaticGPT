import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModelConfig, getModelById, getAvailableModels, DEFAULT_MODEL_ID } from '@/config/models';

const MODEL_STORAGE_KEY = '@chat_selected_model';

export function useModelSelection() {
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted model selection on mount
  useEffect(() => {
    const loadPersistedModel = async () => {
      try {
        const persistedModelId = await AsyncStorage.getItem(MODEL_STORAGE_KEY);
        const modelId = persistedModelId || DEFAULT_MODEL_ID;
        const model = getModelById(modelId);
        
        if (model) {
          setSelectedModel(model);
        } else {
          // Fallback to default if persisted model not found
          const defaultModel = getModelById(DEFAULT_MODEL_ID);
          if (defaultModel) {
            setSelectedModel(defaultModel);
          }
        }
      } catch (error) {
        console.error('Failed to load persisted model:', error);
        // Fallback to default model
        const defaultModel = getModelById(DEFAULT_MODEL_ID);
        if (defaultModel) {
          setSelectedModel(defaultModel);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedModel();
  }, []);

  const selectModel = async (modelId: string) => {
    const model = getModelById(modelId);
    if (!model) {
      console.error('Model not found:', modelId);
      return;
    }

    try {
      await AsyncStorage.setItem(MODEL_STORAGE_KEY, modelId);
      setSelectedModel(model);
    } catch (error) {
      console.error('Failed to persist model selection:', error);
      // Still update local state even if persistence fails
      setSelectedModel(model);
    }
  };

  const availableModels = getAvailableModels();

  return {
    selectedModel,
    selectModel,
    availableModels,
    isLoading,
  };
}