/**
 * AnalyticsDashboard Component
 * Displays comprehensive analytics for conversations and AI usage
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/features/shared/hooks/useTheme';
import { useConversationAnalytics } from '../hooks/useConversationAnalytics';

interface AnalyticsDashboardProps {
  visible: boolean;
  onClose: () => void;
}

export function AnalyticsDashboard({ visible, onClose }: AnalyticsDashboardProps) {
  const { isDark } = useTheme();
  const { stats, analytics, loading, error, refreshStats, exportData } = useConversationAnalytics();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'conversations' | 'usage'>(
    'overview'
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      const data = await exportData(format);
      if (data) {
        // In a real app, you'd save to file or share
        await Share.share({
          message: `Analytics Export (${format.toUpperCase()})`,
          title: 'Conversation Analytics Export',
        });
      } else {
        Alert.alert('Error', 'Failed to export data');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const renderOverviewTab = () => {
    if (!stats) return null;

    return (
      <ScrollView className="flex-1 p-4">
        {/* Key Metrics */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Key Metrics</Text>
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-card p-4 rounded-lg">
                <Text className="text-2xl font-bold text-primary">
                  {formatNumber(stats.totalConversations)}
                </Text>
                <Text className="text-sm text-muted-foreground">Total Conversations</Text>
              </View>
            </View>
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-card p-4 rounded-lg">
                <Text className="text-2xl font-bold text-primary">
                  {formatNumber(stats.totalMessages)}
                </Text>
                <Text className="text-sm text-muted-foreground">Total Messages</Text>
              </View>
            </View>
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-card p-4 rounded-lg">
                <Text className="text-2xl font-bold text-primary">
                  {formatNumber(stats.totalTokensUsed)}
                </Text>
                <Text className="text-sm text-muted-foreground">Tokens Used</Text>
              </View>
            </View>
            <View className="w-1/2 px-2 mb-4">
              <View className="bg-card p-4 rounded-lg">
                <Text className="text-2xl font-bold text-primary">
                  {formatTime(stats.averageResponseTime)}
                </Text>
                <Text className="text-sm text-muted-foreground">Avg Response Time</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Model Usage */}
        {stats.mostUsedModels.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">Model Usage</Text>
            <View className="bg-card rounded-lg p-4">
              {stats.mostUsedModels.slice(0, 5).map((model, index) => (
                <View key={model.model} className="flex-row items-center justify-between py-2">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">{model.model}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {formatNumber(model.tokens)} tokens
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatNumber(model.count)} uses
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tool Usage */}
        {stats.toolUsageStats.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">Tool Usage</Text>
            <View className="bg-card rounded-lg p-4">
              {stats.toolUsageStats.slice(0, 5).map((tool, index) => (
                <View key={tool.tool} className="flex-row items-center justify-between py-2">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">{tool.tool}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {tool.successRate.toFixed(1)}% success rate
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatNumber(tool.count)} uses
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Conversation Length Distribution */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Conversation Lengths</Text>
          <View className="bg-card rounded-lg p-4">
            {stats.conversationLengthDistribution.map((dist, index) => (
              <View key={dist.range} className="flex-row items-center justify-between py-2">
                <Text className="text-sm text-foreground">{dist.range}</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {formatNumber(dist.count)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderConversationsTab = () => {
    return (
      <ScrollView className="flex-1 p-4">
        <Text className="text-lg font-semibold text-foreground mb-4">Conversation Details</Text>
        {analytics.map((conv) => (
          <View key={conv.id} className="bg-card rounded-lg p-4 mb-4">
            <Text className="text-base font-medium text-foreground mb-2" numberOfLines={2}>
              {conv.title}
            </Text>

            <View className="flex-row flex-wrap mb-2">
              <View className="w-1/2 mb-2">
                <Text className="text-xs text-muted-foreground">Messages</Text>
                <Text className="text-sm font-medium text-foreground">
                  {conv.messageCount} ({conv.userMessageCount}U/{conv.assistantMessageCount}A)
                </Text>
              </View>
              <View className="w-1/2 mb-2">
                <Text className="text-xs text-muted-foreground">Tokens</Text>
                <Text className="text-sm font-medium text-foreground">
                  {formatNumber(conv.totalTokens)}
                </Text>
              </View>
              <View className="w-1/2 mb-2">
                <Text className="text-xs text-muted-foreground">Duration</Text>
                <Text className="text-sm font-medium text-foreground">
                  {formatDuration(conv.duration)}
                </Text>
              </View>
              <View className="w-1/2 mb-2">
                <Text className="text-xs text-muted-foreground">Avg Response</Text>
                <Text className="text-sm font-medium text-foreground">
                  {formatTime(conv.averageResponseTime)}
                </Text>
              </View>
            </View>

            {conv.toolsUsed.length > 0 && (
              <View className="mb-2">
                <Text className="text-xs text-muted-foreground">Tools Used</Text>
                <Text className="text-sm text-foreground">{conv.toolsUsed.join(', ')}</Text>
              </View>
            )}

            {conv.modelsUsed.length > 0 && (
              <View>
                <Text className="text-xs text-muted-foreground">Models</Text>
                <Text className="text-sm text-foreground">{conv.modelsUsed.join(', ')}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderUsageTab = () => {
    if (!stats) return null;

    return (
      <ScrollView className="flex-1 p-4">
        {/* Daily Activity */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Recent Activity</Text>
          <View className="bg-card rounded-lg p-4">
            {stats.messagesByDay.slice(-7).map((day) => (
              <View key={day.date} className="flex-row items-center justify-between py-2">
                <Text className="text-sm text-foreground">
                  {new Date(day.date).toLocaleDateString()}
                </Text>
                <View className="flex-row space-x-4">
                  <Text className="text-sm text-muted-foreground">{day.count} msgs</Text>
                  <Text className="text-sm text-muted-foreground">
                    {formatNumber(day.tokens)} tokens
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Response Time Distribution */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Response Times</Text>
          <View className="bg-card rounded-lg p-4">
            {stats.responseTimeDistribution.map((dist) => (
              <View key={dist.range} className="flex-row items-center justify-between py-2">
                <Text className="text-sm text-foreground">{dist.range}</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {formatNumber(dist.count)} responses
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Export Options */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Export Data</Text>
          <View className="flex-row space-x-4">
            <Pressable
              onPress={() => handleExport('json')}
              disabled={isExporting}
              className="flex-1 bg-primary rounded-lg py-3 items-center"
            >
              <Text className="text-primary-foreground font-medium">Export JSON</Text>
            </Pressable>
            <Pressable
              onPress={() => handleExport('csv')}
              disabled={isExporting}
              className="flex-1 bg-secondary rounded-lg py-3 items-center"
            >
              <Text className="text-secondary-foreground font-medium">Export CSV</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
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
          <Text className="text-lg font-semibold text-foreground">Analytics Dashboard</Text>
          <View className="flex-row items-center space-x-2">
            <Pressable
              onPress={refreshStats}
              disabled={loading}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="refresh" size={20} color={isDark ? '#fff' : '#000'} />
            </Pressable>
            <Pressable onPress={onClose} className="w-8 h-8 items-center justify-center">
              <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
            </Pressable>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row border-b border-border">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'conversations', label: 'Conversations' },
            { key: 'usage', label: 'Usage' },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setSelectedTab(tab.key as any)}
              className={`flex-1 py-3 items-center ${
                selectedTab === tab.key ? 'border-b-2 border-primary' : ''
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedTab === tab.key ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
            <Text className="text-muted-foreground mt-2">Loading analytics...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-red-500 text-center">{error.message}</Text>
            <Pressable onPress={refreshStats} className="mt-4 bg-primary rounded-lg px-4 py-2">
              <Text className="text-primary-foreground">Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {selectedTab === 'overview' && renderOverviewTab()}
            {selectedTab === 'conversations' && renderConversationsTab()}
            {selectedTab === 'usage' && renderUsageTab()}
          </>
        )}

        {/* Loading Overlay for Export */}
        {isExporting && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <View className="bg-card rounded-lg p-6 items-center">
              <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
              <Text className="text-foreground mt-2">Exporting data...</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
