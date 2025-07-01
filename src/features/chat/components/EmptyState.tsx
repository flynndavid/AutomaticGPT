import { ScrollView, Pressable, Text, View } from 'react-native';
import { useTheme } from '@/features/shared';
import { suggestionCardShadow } from '@/lib/styles';

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
    <View className="mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          gap: 12,
        }}
      >
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion.id}
            onPress={() => handleSuggestionPress(suggestion.title, suggestion.subtitle)}
            className="bg-card rounded-xl border border-border/5 px-4 py-4 min-w-[160px] max-w-[200px]"
            style={suggestionCardShadow}
          >
            <Text className="text-lg font-semibold text-foreground mb-1">{suggestion.title}</Text>
            <Text className="text-base text-muted-foreground leading-5">{suggestion.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
