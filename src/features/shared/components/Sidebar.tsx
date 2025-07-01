import React, { useState } from 'react';
import { Text, View, Pressable, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { animationConfigs } from '@/lib/animations';
import { config } from '@/config';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

// Dummy data for navigation and chat history
const navigationItems = [
  { id: 'chat', label: 'New Chat', icon: 'chatbubbles-outline' },
  { id: 'history', label: 'Chat History', icon: 'time-outline' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline' },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' },
];

const chatHistory = [
  { id: '1', title: 'React Native Performance Tips', timestamp: '2 hours ago' },
  { id: '2', title: 'TypeScript Best Practices', timestamp: '1 day ago' },
  { id: '3', title: 'Building a Chat App', timestamp: '3 days ago' },
  { id: '4', title: 'Expo Router Navigation', timestamp: '1 week ago' },
  { id: '5', title: 'Animation with Reanimated', timestamp: '2 weeks ago' },
];

const profileMenuItems = [
  { id: 'profile', label: 'Profile', icon: 'person-outline' },
  { id: 'billing', label: 'Billing', icon: 'card-outline' },
  { id: 'share', label: 'Share App', icon: 'share-outline' },
  { id: 'logout', label: 'Log Out', icon: 'log-out-outline' },
];

export function Sidebar({
  isOpen,
  onClose,
  appName,
  userName = 'John Doe',
  userEmail = 'john.doe@example.com',
  userAvatar,
}: SidebarProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(isOpen ? 0 : -300);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Use app name from config if not provided as prop
  const displayAppName = appName || config.branding.appName;

  // Animation styles
  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen ? 0.5 : 0, animationConfigs.normal),
  }));

  // Animate sidebar when isOpen changes
  React.useEffect(() => {
    translateX.value = withTiming(isOpen ? 0 : -300, animationConfigs.normal, (finished) => {
      if (finished && !isOpen) {
        runOnJS(onClose)();
      }
    });
  }, [isOpen, translateX, onClose]);

  const handleOverlayPress = () => {
    onClose();
  };

  const handleNavPress = (itemId: string) => {
    console.log(`Navigate to: ${itemId}`);
    // TODO: Implement navigation
  };

  const handleChatPress = (chatId: string) => {
    console.log(`Open chat: ${chatId}`);
    // TODO: Implement chat loading
  };

  const handleProfilePress = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleProfileMenuPress = (itemId: string) => {
    console.log(`Profile action: ${itemId}`);
    setIsProfileMenuOpen(false);
    // TODO: Implement profile actions
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={[
          overlayStyle,
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 },
        ]}
        className="bg-black"
      >
        <Pressable style={{ flex: 1 }} onPress={handleOverlayPress} />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        style={[
          sidebarStyle,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 300,
            zIndex: 999,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
        className="bg-card border-r border-border"
      >
        <ScrollView className="flex-1">
          {/* Header Section */}
          <View className="px-6 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">{displayAppName}</Text>
              <Pressable onPress={onClose} className="w-8 h-8 items-center justify-center">
                <Ionicons name="close" size={20} color={isDark ? '#fff' : '#000'} />
              </Pressable>
            </View>
          </View>

          {/* Navigation Section */}
          <View className="py-4">
            <Text className="text-sm font-semibold text-muted-foreground px-6 mb-3 uppercase tracking-wider">
              Navigation
            </Text>
            {navigationItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleNavPress(item.id)}
                className="flex-row items-center px-6 py-3 active:bg-muted"
              >
                <Ionicons name={item.icon as any} size={20} color={isDark ? '#9ca3af' : '#666'} />
                <Text className="ml-3 text-base text-foreground">{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Chat History Section */}
          <View className="py-4">
            <Text className="text-sm font-semibold text-muted-foreground px-6 mb-3 uppercase tracking-wider">
              Recent Chats
            </Text>
            {chatHistory.map((chat) => (
              <Pressable
                key={chat.id}
                onPress={() => handleChatPress(chat.id)}
                className="px-6 py-3 active:bg-muted"
              >
                <Text className="text-sm font-medium text-foreground mb-1" numberOfLines={1}>
                  {chat.title}
                </Text>
                <Text className="text-xs text-muted-foreground">{chat.timestamp}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* User Profile Section - Sticky at bottom */}
        <View className="bg-card">
          <Pressable onPress={handleProfilePress} className="flex-row items-center px-6 py-4">
            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} className="w-10 h-10 rounded-full" />
              ) : (
                <Text className="text-primary-foreground font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {userName}
              </Text>
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {userEmail}
              </Text>
            </View>
            <Ionicons
              name={isProfileMenuOpen ? 'chevron-down' : 'chevron-up'}
              size={16}
              color={isDark ? '#9ca3af' : '#666'}
            />
          </Pressable>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <View className="border-t border-border/50">
              {profileMenuItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleProfileMenuPress(item.id)}
                  className="flex-row items-center px-6 py-3 active:bg-muted"
                >
                  <Ionicons name={item.icon as any} size={18} color={isDark ? '#9ca3af' : '#666'} />
                  <Text className="ml-3 text-sm text-foreground">{item.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </>
  );
}
