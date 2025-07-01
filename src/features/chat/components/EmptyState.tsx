import { ScrollView, Pressable, Text } from 'react-native';
import { useTheme } from '@/features/shared';

const suggestions = [
  {
    id: '1',
    title: 'Create a',
    subtitle: 'modern shed design for a backyard',
  },
  {
    id: '2',
    title: 'Optimize',
    subtitle: 'pool chemical balance',
  },
  {
    id: '3',
    title: 'Plan',
    subtitle: 'a weekend hiking trip',
  },
  {
    id: '4',
    title: 'Write',
    subtitle: 'a professional email',
  },
];

interface EmptyStateProps {
  onSuggestionPress?: (suggestion: string) => void;
}

export function EmptyState({ onSuggestionPress }: EmptyStateProps) {
  const { isDark } = useTheme();

  const handleSuggestionPress = (title: string, subtitle: string) => {
    const suggestionText = `${title} ${subtitle}`;
    onSuggestionPress?.(suggestionText);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-2"
      contentContainerStyle={{
        paddingHorizontal: 16,
        gap: 8,
      }}
    >
      {suggestions.map((suggestion) => (
        <Pressable
          key={suggestion.id}
          onPress={() => handleSuggestionPress(suggestion.title, suggestion.subtitle)}
          className="bg-card rounded-xl px-3 py-2 border border-border min-w-[140px] max-w-[180px]"
        >
          <Text className="text-md font-semibold text-foreground mb-0.5">{suggestion.title}</Text>
          <Text className="text-sm text-muted-foreground leading-[14px]">
            {suggestion.subtitle}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
