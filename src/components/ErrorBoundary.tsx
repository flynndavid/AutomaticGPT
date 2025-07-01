import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { haptics } from '@/lib/haptics';
import { logger } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

/**
 * Simple Error Boundary with haptic feedback
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error boundary caught:', error, errorInfo);
    haptics.error();
  }

  handleRetry = () => {
    haptics.buttonPress();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <View className="flex-1 justify-center items-center p-6 bg-background">
      <View className="items-center max-w-sm">
        <Text className="text-6xl mb-4">😵</Text>
        <Text className="text-xl font-semibold text-foreground mb-2 text-center">
          Something went wrong
        </Text>
        <Text className="text-muted-foreground mb-6 text-center">
          We encountered an unexpected error. Don't worry, your data is safe.
        </Text>
        <Pressable
          onPress={onRetry}
          className="bg-primary px-6 py-3 rounded-lg active:opacity-80"
        >
          <Text className="text-primary-foreground font-medium">Try Again</Text>
        </Pressable>
        {__DEV__ && error && (
          <View className="mt-6 p-4 bg-destructive/10 rounded-lg">
            <Text className="text-destructive text-sm font-mono">
              {error.message}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Network error fallback component
 */
export function NetworkErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <Text className="text-4xl mb-4">📶</Text>
      <Text className="text-lg font-semibold mb-2 text-center">
        Connection Problem
      </Text>
      <Text className="text-muted-foreground mb-6 text-center">
        Please check your internet connection and try again.
      </Text>
      <Pressable
        onPress={onRetry}
        className="bg-primary px-6 py-3 rounded-lg active:opacity-80"
      >
        <Text className="text-primary-foreground font-medium">Retry</Text>
      </Pressable>
    </View>
  );
}