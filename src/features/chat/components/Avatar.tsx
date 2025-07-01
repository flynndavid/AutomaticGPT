import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

interface AvatarProps {
  role: 'user' | 'assistant' | string;
}

export function Avatar({ role }: AvatarProps) {
  return (
    <View
      testID="avatar-container"
      className={cn(
        'w-8 h-8 rounded-full items-center justify-center',
        role === 'user' ? 'bg-blue-500' : 'bg-gray-700'
      )}
    >
      {role === 'user' ? (
        <Ionicons name="person" size={18} color="white" />
      ) : (
        <Ionicons name="sparkles" size={20} color="white" />
      )}
    </View>
  );
}
