import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

interface ErrorAlertProps {
  error: string | null;
  onDismiss: () => void;
  title?: string;
  showAlert?: boolean;
}

export function ErrorAlert({
  error,
  onDismiss,
  title = 'Error',
  showAlert = false,
}: ErrorAlertProps) {
  React.useEffect(() => {
    if (error && showAlert) {
      Alert.alert(
        title,
        error,
        [
          {
            text: 'OK',
            onPress: onDismiss,
          },
        ],
        { cancelable: true, onDismiss }
      );
    }
  }, [error, showAlert, title, onDismiss]);

  if (!error || showAlert) {
    return null;
  }

  return (
    <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 m-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-destructive font-semibold text-sm mb-1">{title}</Text>
          <Text className="text-destructive text-sm">{error}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} className="ml-2 p-1">
          <Text className="text-destructive font-bold text-lg">×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
