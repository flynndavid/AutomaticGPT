import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function WeatherCard(props: { location: string; temperature: number }) {
  return (
    <View className="bg-white/90 p-3 rounded-lg w-full flex-row items-center gap-3">
      <Ionicons name="cloud" size={24} color="#4b5563" />
      <View>
        <Text className="font-bold text-base text-zinc-800">
          Weather for {props.location}
        </Text>
        <Text className="text-zinc-600 text-base">
          {props.temperature}°F
        </Text>
      </View>
    </View>
  );
}

export function CelsiusConvertCard(props: {
  temperature: number;
  celsius: number;
}) {
  return (
    <View className="bg-white/90 p-3 rounded-lg w-full flex-row items-center gap-3">
      <Ionicons name="thermometer" size={24} color="#4b5563" />
      <View>
        <Text className="font-bold text-base text-zinc-800">
          Temperature Conversion
        </Text>
        <Text className="text-zinc-600 text-base">
          {props.temperature}°F is equal to {props.celsius}°C
        </Text>
      </View>
    </View>
  );
}
