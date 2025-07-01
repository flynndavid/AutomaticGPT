import React, { useState } from 'react';
import { Text, View, Pressable, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useConversations } from '@/features/chat/hooks/useConversations';
import { ConversationShareModal } from '@/features/chat/components/ConversationShareModal';
import { AnalyticsDashboard } from '@/features/chat/components/AnalyticsDashboard';
import { animationConfigs } from '@/lib/animations';
import { config } from '@/config';
import { FEATURES } from '@/config/features';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onConversationSelect?: (conversationId: string) => void;
  currentConversationId?: string;
}

// Navigation items
const navigationItems = [
  { id: 'chat', label: 'New Chat', icon: 'add-outline' },
  { id: 'documents', label: 'Documents', icon: 'document-text-outline' },
  { id: 'memories', label: 'Memories', icon: 'library-outline' },
  { id: 'connections', label: 'Connections', icon: 'people-outline' },
];

const profileMenuItems = [
  { id: 'profile', label: 'Profile', icon: 'person-outline' },
  { id: 'analytics', label: 'Analytics', icon: 'analytics-outline' },
  { id: 'billing', label: 'Billing', icon: 'card-outline' },
  { id: 'theme', label: 'Theme', icon: 'contrast-outline' },
  { id: 'share', label: 'Share App', icon: 'share-outline' },
  { id: 'logout', label: 'Log Out', icon: 'log-out-outline' },
];

// Format timestamp for display
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 10080)}w ago`;
  return date.toLocaleDateString();
};

export function Sidebar({
  isOpen,
  onClose,
  appName,
  userName = 'John Doe',
  userEmail = 'john.doe@example.com',
  userAvatar,
  onConversationSelect,
  currentConversationId,
}: SidebarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { conversations, loading, createConversation, deleteConversation, archiveConversation } =
    useConversations();
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(isOpen ? 0 : -300);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [selectedConversationForShare, setSelectedConversationForShare] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);

  // Use app name from config if not provided as prop
  const displayAppName = appName || config.branding.appName;

  // Use authenticated user data if available
  const displayUserName = user?.email?.split('@')[0] || userName;
  const displayUserEmail = user?.email || userEmail;

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

  const handleNavPress = async (itemId: string) => {
    if (itemId === 'chat') {
      // Create new conversation
      setIsCreatingConversation(true);
      try {
        const newConversation = await createConversation();
        if (newConversation && onConversationSelect) {
          onConversationSelect(newConversation.id);
          onClose();
        }
      } catch (error) {
        console.error('Failed to create conversation:', error);
        Alert.alert('Error', 'Failed to create new conversation');
      } finally {
        setIsCreatingConversation(false);
      }
    } else {
      console.log(`Navigate to: ${itemId}`);
      // TODO: Implement navigation for other items
    }
  };

  const handleConversationPress = (conversationId: string) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId);
      onClose();
    }
  };

  const handleConversationLongPress = (conversationId: string, title: string) => {
    Alert.alert('Conversation Options', `What would you like to do with "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Share',
        onPress: () => {
          setSelectedConversationForShare({ id: conversationId, title });
        },
      },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          try {
            await archiveConversation(conversationId);
          } catch (error) {
            console.error('Failed to archive conversation:', error);
            Alert.alert('Error', 'Failed to archive conversation');
          }
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Delete Conversation',
            'Are you sure you want to delete this conversation? This action cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deleteConversation(conversationId);
                  } catch (error) {
                    console.error('Failed to delete conversation:', error);
                    Alert.alert('Error', 'Failed to delete conversation');
                  }
                },
              },
            ]
          );
        },
      },
    ]);
  };

  const handleProfilePress = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            onClose();
          } catch (error) {
            console.error('Sign out error:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  const handleProfileMenuPress = (itemId: string) => {
    console.log(`Profile action: ${itemId}`);

    if (itemId === 'theme') {
      toggleTheme();
    } else if (itemId === 'analytics') {
      setShowAnalyticsDashboard(true);
    } else if (itemId === 'logout' && FEATURES.enableAuth) {
      handleSignOut();
      return;
    }

    setIsProfileMenuOpen(false);
    // TODO: Implement other profile actions
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
              Pages
            </Text>
            {navigationItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleNavPress(item.id)}
                className="flex-row items-center px-6 py-3 active:bg-muted"
                disabled={item.id === 'chat' && isCreatingConversation}
              >
                <Ionicons name={item.icon as any} size={20} color={isDark ? '#9ca3af' : '#666'} />
                <Text className="ml-3 text-sm font-medium text-foreground">{item.label}</Text>
                {item.id === 'chat' && isCreatingConversation && (
                  <Text className="ml-auto text-xs text-muted-foreground">Creating...</Text>
                )}
              </Pressable>
            ))}
          </View>

          {/* Chat History Section */}
          <View className="py-4 flex-1">
            <Text className="text-sm font-semibold text-muted-foreground px-6 mb-3 uppercase tracking-wider">
              Chat History
            </Text>

            {loading ? (
              <View className="px-6 py-4">
                <Text className="text-sm text-muted-foreground">Loading conversations...</Text>
              </View>
            ) : conversations.length === 0 ? (
              <View className="px-6 py-4">
                <Text className="text-sm text-muted-foreground">No conversations yet</Text>
                <Text className="text-xs text-muted-foreground mt-1">
                  Start a new chat to begin
                </Text>
              </View>
            ) : (
              conversations.map((conversation) => (
                <Pressable
                  key={conversation.id}
                  onPress={() => handleConversationPress(conversation.id)}
                  onLongPress={() =>
                    handleConversationLongPress(conversation.id, conversation.title)
                  }
                  className={`px-6 py-3 active:bg-muted ${
                    currentConversationId === conversation.id ? 'bg-muted' : ''
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-2">
                      <Text className="text-sm font-medium text-foreground mb-1" numberOfLines={1}>
                        {conversation.title}
                      </Text>
                      {conversation.last_message_preview && (
                        <Text className="text-xs text-muted-foreground mb-1" numberOfLines={1}>
                          {conversation.last_message_preview}
                        </Text>
                      )}
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-muted-foreground">
                          {conversation.last_message_at
                            ? formatTimestamp(conversation.last_message_at)
                            : formatTimestamp(conversation.updated_at)}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {conversation.message_count} msg
                          {conversation.message_count !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    {currentConversationId === conversation.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={isDark ? '#3b82f6' : '#2563eb'}
                      />
                    )}
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>

        {/* User Profile Section - Sticky at bottom */}
        <View
          className="bg-card rounded-t-3xl shadow-lg border-t border-border/10"
          style={{ paddingBottom: insets.bottom }}
        >
          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <View className="border-b border-border/50">
              {profileMenuItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleProfileMenuPress(item.id)}
                  className="flex-row items-center px-6 py-3 active:bg-muted"
                >
                  <Ionicons name={item.icon as any} size={18} color={isDark ? '#9ca3af' : '#666'} />
                  <Text className="ml-3 text-sm font-medium text-foreground">
                    {item.label}
                    {item.id === 'theme' && (
                      <Text className="text-muted-foreground"> ({isDark ? 'Dark' : 'Light'})</Text>
                    )}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Pressable onPress={handleProfilePress} className="flex-row items-center px-6 py-4">
            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} className="w-10 h-10 rounded-full" />
              ) : (
                <Text className="text-primary-foreground font-semibold">
                  {displayUserName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                {displayUserName}
              </Text>
              <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                {displayUserEmail}
              </Text>
            </View>
            <Ionicons
              name={isProfileMenuOpen ? 'chevron-down' : 'chevron-up'}
              size={16}
              color={isDark ? '#9ca3af' : '#666'}
            />
          </Pressable>
        </View>
      </Animated.View>

      {/* Conversation Share Modal */}
      {selectedConversationForShare && (
        <ConversationShareModal
          visible={!!selectedConversationForShare}
          onClose={() => setSelectedConversationForShare(null)}
          conversationId={selectedConversationForShare.id}
          conversationTitle={selectedConversationForShare.title}
        />
      )}

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        visible={showAnalyticsDashboard}
        onClose={() => setShowAnalyticsDashboard(false)}
      />
    </>
  );
}
