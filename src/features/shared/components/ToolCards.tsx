import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export function WeatherCard(props: { location: string; temperature: number }) {
  const { isDark } = useTheme();

  return (
    <View className="bg-card/90 p-3 rounded-lg w-full flex-row items-center gap-3">
      <Ionicons name="cloud" size={24} color={isDark ? '#9ca3af' : '#4b5563'} />
      <View>
        <Text className="font-bold text-base text-foreground">Weather for {props.location}</Text>
        <Text className="text-muted-foreground text-base">{props.temperature}°F</Text>
      </View>
    </View>
  );
}

export function CelsiusConvertCard(props: { temperature: number; celsius: number }) {
  const { isDark } = useTheme();

  return (
    <View className="bg-card/90 p-3 rounded-lg w-full flex-row items-center gap-3">
      <Ionicons name="thermometer" size={24} color={isDark ? '#9ca3af' : '#4b5563'} />
      <View>
        <Text className="font-bold text-base text-foreground">Temperature Conversion</Text>
        <Text className="text-muted-foreground text-base">
          {props.temperature}°F is equal to {props.celsius}°C
        </Text>
      </View>
    </View>
  );
}
