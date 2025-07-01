export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic';
  description: string;
  maxTokens: number;
  supportsTools: boolean;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Most capable GPT-4 model',
    maxTokens: 128000,
    supportsTools: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Faster, more affordable GPT-4',
    maxTokens: 128000,
    supportsTools: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'High-performance GPT-4',
    maxTokens: 128000,
    supportsTools: true,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and efficient',
    maxTokens: 16385,
    supportsTools: true,
  },
  // Anthropic Models
  {
    id: 'claude-4-sonnet',
    name: 'Claude 4 Sonnet',
    provider: 'anthropic',
    description: 'Latest and most capable Claude model',
    maxTokens: 200000,
    supportsTools: true,
  },
  {
    id: 'claude-3.5',
    name: 'Claude 3.5',
    provider: 'anthropic',
    description: 'Powerful and efficient Claude model',
    maxTokens: 200000,
    supportsTools: true,
  },
];

export const DEFAULT_MODEL_ID = 'gpt-4o';

export const getModelById = (id: string): ModelConfig | undefined => {
  for (const model of AVAILABLE_MODELS) {
    if (model.id === id) {
      return model;
    }
  }
  return undefined;
};

export const getModelsByProvider = (provider: 'openai' | 'anthropic'): ModelConfig[] => {
  const result: ModelConfig[] = [];
  for (const model of AVAILABLE_MODELS) {
    if (model.provider === provider) {
      result.push(model);
    }
  }
  return result;
};

export const getAvailableModels = (): ModelConfig[] => {
  // In a real app, you might filter based on available API keys
  return AVAILABLE_MODELS;
};