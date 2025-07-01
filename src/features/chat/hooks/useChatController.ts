import { useChat } from '@ai-sdk/react';
import * as Haptics from 'expo-haptics';

export function useChatController() {
  const {
    messages,
    error,
    handleInputChange: coreHandleInputChange,
    input,
    handleSubmit,
    isLoading,
  } = useChat({
    maxSteps: 5,
  });

  const handleInputChange = (text: string) => {
    coreHandleInputChange({
      target: {
        value: text,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const onSend = () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleSubmit();
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleInputChange(suggestion);
  };

  return {
    messages,
    error,
    input,
    isLoading,
    handleInputChange,
    onSend,
    handleSuggestionPress,
  };
}
