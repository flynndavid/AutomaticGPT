import { useChat } from "@ai-sdk/react";
import { UIMessage } from "ai";
import * as Haptics from "expo-haptics";
import { Fragment, useEffect, useRef } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Animated, { Layout, Easing, FadeIn } from "react-native-reanimated";

import { KeyboardPaddingView } from "@/components/keyboard-padding";
import { CelsiusConvertCard, WeatherCard } from "@/components/tool-cards";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";

const Avatar = ({ role }: { role: "user" | "assistant" | string }) => (
  <View
    className={cn(
      "w-8 h-8 rounded-full items-center justify-center",
      role === "user" ? "bg-blue-500" : "bg-gray-700"
    )}
  >
    {role === "user" ? (
      <Ionicons name="person" size={18} color="white" />
    ) : (
      <Ionicons name="sparkles" size={20} color="white" />
    )}
  </View>
);

const Header = () => (
  <View style={styles.header}>
    <Pressable style={styles.headerButton}>
      <Ionicons name="menu" size={24} color="#000" />
    </Pressable>
    
    <View style={styles.headerCenter}>
      <Text style={styles.headerTitle}>ChatGPT</Text>
      <Text style={styles.headerSubtitle}>4o</Text>
      <Ionicons name="chevron-forward" size={16} color="#666" style={styles.chevron} />
    </View>
    
    <Pressable style={styles.headerButton}>
      <Ionicons name="qr-code-outline" size={24} color="#000" />
    </Pressable>
  </View>
);

export function Chat() {
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
    } as any);
  };

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const onSend = () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleSubmit();
    handleInputChange("");
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-red-500 text-center">{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header />
      
      <View style={styles.contentContainer}>
        <ScrollView
          ref={scrollViewRef}
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              {/* Empty state content can go here if needed */}
            </View>
          )}
          
          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}
          {isLoading && messages.at(-1)?.role !== "assistant" && (
            <Message
              message={
                {
                  id: "loading",
                  role: "assistant",
                  content: "",
                  parts: [{ type: "text", text: "" }],
                } as UIMessage
              }
            />
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          {messages.length === 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsContainer}
              contentContainerStyle={styles.suggestionsContent}
            >
              <Pressable style={styles.suggestionCard}>
                <Text style={styles.suggestionTitle}>Create a</Text>
                <Text style={styles.suggestionSubtitle}>modern shed design for a backyard</Text>
              </Pressable>
              <Pressable style={styles.suggestionCard}>
                <Text style={styles.suggestionTitle}>Optimize</Text>
                <Text style={styles.suggestionSubtitle}>pool chemical balance</Text>
              </Pressable>
              <Pressable style={styles.suggestionCard}>
                <Text style={styles.suggestionTitle}>Plan</Text>
                <Text style={styles.suggestionSubtitle}>a weekend hiking trip</Text>
              </Pressable>
              <Pressable style={styles.suggestionCard}>
                <Text style={styles.suggestionTitle}>Write</Text>
                <Text style={styles.suggestionSubtitle}>a professional email</Text>
              </Pressable>
            </ScrollView>
          )}
          
          <View style={styles.inputWrapper}>
            <Pressable style={styles.plusButton}>
              <Ionicons name="add" size={24} color="#666" />
            </Pressable>
            
            <TextInput
              style={styles.textInput}
              placeholder="Ask anything"
              placeholderTextColor="#999"
              value={input}
              onChangeText={handleInputChange}
              onSubmitEditing={onSend}
              blurOnSubmit={false}
              multiline
              textAlignVertical="center"
            />
            
            <View style={styles.rightButtons}>
              <Pressable style={styles.voiceButton}>
                <Ionicons name="mic" size={20} color="#666" />
              </Pressable>
              
              <Pressable
                onPress={onSend}
                disabled={!input.trim() || isLoading}
                style={[
                  styles.sendButton,
                  (!input.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="arrow-up" size={20} color="white" />
                )}
              </Pressable>
            </View>
          </View>
        </View>
        <KeyboardPaddingView />
      </View>
    </SafeAreaView>
  );
}

function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  const content = message.parts
    .map((part) => {
      switch (part.type) {
        case "text": {
          if (!part.text) return null;
          return <Text>{part.text}</Text>;
        }
        case "tool-invocation": {
          const { toolInvocation } = part;
          if (toolInvocation.state === "result") {
            if (toolInvocation.toolName === "weather") {
              return <WeatherCard {...toolInvocation.result} />;
            } else if (
              toolInvocation.toolName === "convertFahrenheitToCelsius"
            ) {
              return <CelsiusConvertCard {...toolInvocation.result} />;
            }
            return (
              <Text>
                Tool: {toolInvocation.toolName} - Result:{" "}
                {JSON.stringify(toolInvocation.result, null, 2)}
              </Text>
            );
          }
          return (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" />
              <Text className="ml-2 text-zinc-500">
                Calling: {toolInvocation.toolName}...
              </Text>
            </View>
          );
        }
        default:
          return null;
      }
    })
    .filter(Boolean);

  if (message.id === "loading") {
    return (
      <Animated.View
        layout={Layout.easing(Easing.ease).delay(100)}
        entering={FadeIn.duration(200)}
        className="flex-row items-end gap-2"
      >
        <Avatar role="assistant" />
        <View className="bg-white p-3 rounded-t-2xl rounded-br-2xl">
          <ActivityIndicator color="#6b7280" />
        </View>
      </Animated.View>
    );
  }

  if (!content.length) return null;

  return (
    <Animated.View
      layout={Layout.easing(Easing.ease).delay(100)}
      entering={FadeIn.duration(200)}
      className={cn("flex-row items-end gap-2", isUser && "self-end")}
    >
      {!isUser && <Avatar role="assistant" />}
      <View
        className={cn(
          "p-3 rounded-2xl max-w-[85%]",
          isUser
            ? "bg-blue-500 rounded-br-none"
            : "bg-white rounded-bl-none"
        )}
      >
        <Text
          style={styles.messageText}
          className={cn(isUser ? "text-white" : "text-zinc-800")}
        >
          {content.map((jsx, key) => (
            <Fragment key={key}>{jsx}</Fragment>
          ))}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginRight: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginRight: 4,
  },
  chevron: {
    marginLeft: 2,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  suggestionCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    minWidth: 140,
    maxWidth: 180,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontSize: 11,
    color: "#666",
    lineHeight: 14,
  },
  inputContainer: {
    backgroundColor: "#fff",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8f8f8",
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 48,
    maxHeight: 120,
    marginHorizontal: 16,
    marginBottom: 0,
  },
  plusButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 8,
    paddingVertical: 10,
    color: "#000",
    maxHeight: 100,
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  voiceButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#C2C2C2",
  },
  sendButtonPressed: {
    opacity: 0.7,
  },
  messageText: {
    fontSize: 17,
    lineHeight: 22,
  },
  suggestionsContainer: {
    marginBottom: 8,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  contentContainer: {
    flex: 1,
  },
});
