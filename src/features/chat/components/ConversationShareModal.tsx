/**
 * ConversationShareModal Component
 * Modal for sharing conversations with other users or publicly
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/features/shared/hooks/useTheme';
import { useConversationSharing } from '../hooks/useConversationSharing';
import type { ConversationShare } from '@/lib/supabase';

interface ConversationShareModalProps {
  visible: boolean;
  onClose: () => void;
  conversationId: string;
  conversationTitle: string;
}

export function ConversationShareModal({
  visible,
  onClose,
  conversationId,
  conversationTitle,
}: ConversationShareModalProps) {
  const { isDark } = useTheme();
  const {
    loading,
    error,
    shareConversation,
    getConversationShares,
    removeShare,
    generateShareLink,
  } = useConversationSharing();

  const [shares, setShares] = useState<ConversationShare[]>([]);
  const [isPublicShare, setIsPublicShare] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');
  const [permissions, setPermissions] = useState<string[]>(['read']);
  const [shareLink, setShareLink] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadShares();
    }
  }, [visible]);

  const loadShares = async () => {
    try {
      const sharesData = await getConversationShares(conversationId);
      setShares(sharesData);
    } catch (err) {
      console.error('Failed to load shares:', err);
    }
  };

  const handleShare = async () => {
    if (!isPublicShare && !shareEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address or enable public sharing');
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

      const shareData = await shareConversation({
        conversationId,
        sharedWith: isPublicShare ? undefined : shareEmail.trim(),
        permissions,
        expiresAt: expiresAt.toISOString(),
      });

      if (shareData) {
        await loadShares();
        setShareEmail('');

        if (isPublicShare) {
          const link = await generateShareLink(conversationId, parseInt(expiryDays));
          setShareLink(link);
        }

        Alert.alert('Success', 'Conversation shared successfully!');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to share conversation');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    Alert.alert('Remove Share', 'Are you sure you want to remove this share?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const success = await removeShare(shareId);
          if (success) {
            await loadShares();
            Alert.alert('Success', 'Share removed successfully');
          } else {
            Alert.alert('Error', 'Failed to remove share');
          }
        },
      },
    ]);
  };

  const handleShareLink = async () => {
    if (shareLink) {
      try {
        await Share.share({
          message: `Check out this conversation: ${conversationTitle}`,
          url: shareLink,
        });
      } catch (err) {
        console.error('Error sharing link:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPermissions = (perms: string[]) => {
    return perms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <Text className="text-lg font-semibold text-foreground">Share Conversation</Text>
          <Pressable onPress={onClose} className="w-8 h-8 items-center justify-center">
            <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
          </Pressable>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Conversation Info */}
          <View className="mb-6">
            <Text className="text-sm text-muted-foreground mb-1">Conversation</Text>
            <Text className="text-base font-medium text-foreground" numberOfLines={2}>
              {conversationTitle}
            </Text>
          </View>

          {/* Share Options */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-foreground mb-4">Share Settings</Text>

            {/* Public Share Toggle */}
            <View className="flex-row items-center justify-between mb-4 p-3 bg-card rounded-lg">
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">Public Share</Text>
                <Text className="text-xs text-muted-foreground">
                  Anyone with the link can view this conversation
                </Text>
              </View>
              <Switch
                value={isPublicShare}
                onValueChange={setIsPublicShare}
                trackColor={{ false: '#767577', true: '#3b82f6' }}
                thumbColor={isPublicShare ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>

            {/* Email Input (if not public) */}
            {!isPublicShare && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Share with User</Text>
                <TextInput
                  className="border border-border rounded-lg px-3 py-2 text-foreground"
                  placeholder="Enter email address"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={shareEmail}
                  onChangeText={setShareEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Permissions */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Permissions</Text>
              <View className="flex-row space-x-2">
                <Pressable
                  onPress={() => setPermissions(['read'])}
                  className={`px-3 py-2 rounded-lg ${
                    permissions.includes('read') && permissions.length === 1
                      ? 'bg-primary'
                      : 'bg-card border border-border'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      permissions.includes('read') && permissions.length === 1
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    Read Only
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setPermissions(['read', 'write'])}
                  className={`px-3 py-2 rounded-lg ${
                    permissions.includes('write') ? 'bg-primary' : 'bg-card border border-border'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      permissions.includes('write') ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    Read & Write
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Expiry Days */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Expires in (days)</Text>
              <TextInput
                className="border border-border rounded-lg px-3 py-2 text-foreground w-20"
                value={expiryDays}
                onChangeText={setExpiryDays}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            {/* Share Button */}
            <Pressable
              onPress={handleShare}
              disabled={loading}
              className={`bg-primary rounded-lg py-3 items-center ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-primary-foreground font-medium">Share Conversation</Text>
              )}
            </Pressable>

            {/* Share Link */}
            {shareLink && (
              <View className="mt-4 p-3 bg-card rounded-lg">
                <Text className="text-sm font-medium text-foreground mb-2">Share Link</Text>
                <Text className="text-xs text-muted-foreground mb-2" numberOfLines={2}>
                  {shareLink}
                </Text>
                <Pressable
                  onPress={handleShareLink}
                  className="bg-secondary rounded px-3 py-2 self-start"
                >
                  <Text className="text-secondary-foreground text-sm">Share Link</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Current Shares */}
          {shares.length > 0 && (
            <View>
              <Text className="text-base font-semibold text-foreground mb-4">Current Shares</Text>
              {shares.map((share) => (
                <View key={share.id} className="bg-card rounded-lg p-3 mb-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-foreground">
                        {share.shared_with ? share.shared_with : 'Public Share'}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        Permissions: {formatPermissions(share.permissions)}
                      </Text>
                      {share.expires_at && (
                        <Text className="text-xs text-muted-foreground">
                          Expires: {formatDate(share.expires_at)}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => handleRemoveShare(share.id)}
                      className="w-8 h-8 items-center justify-center"
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Error Display */}
          {error && (
            <View className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Text className="text-red-800 text-sm">{error.message}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
