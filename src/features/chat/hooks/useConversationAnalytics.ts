/**
 * useConversationAnalytics Hook
 * Provides advanced analytics for conversations and messages
 */

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { logger } from '@/lib/logger';

export interface ConversationStats {
  totalConversations: number;
  totalMessages: number;
  totalTokensUsed: number;
  averageMessagesPerConversation: number;
  averageResponseTime: number;
  mostUsedModels: { model: string; count: number; tokens: number }[];
  conversationsByDay: { date: string; count: number }[];
  messagesByDay: { date: string; count: number; tokens: number }[];
  toolUsageStats: { tool: string; count: number; successRate: number }[];
  conversationLengthDistribution: { range: string; count: number }[];
  responseTimeDistribution: { range: string; count: number }[];
}

export interface ConversationAnalytics {
  id: string;
  title: string;
  messageCount: number;
  totalTokens: number;
  averageResponseTime: number;
  createdAt: string;
  lastMessageAt: string;
  duration: number; // in minutes
  toolsUsed: string[];
  modelsUsed: string[];
  userMessageCount: number;
  assistantMessageCount: number;
}

interface UseConversationAnalyticsReturn {
  stats: ConversationStats | null;
  analytics: ConversationAnalytics[];
  loading: boolean;
  error: Error | null;
  refreshStats: () => Promise<void>;
  getConversationAnalytics: (conversationId: string) => Promise<ConversationAnalytics | null>;
  getDateRangeStats: (startDate: string, endDate: string) => Promise<ConversationStats | null>;
  exportData: (format: 'json' | 'csv') => Promise<string | null>;
}

export const useConversationAnalytics = (): UseConversationAnalyticsReturn => {
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [analytics, setAnalytics] = useState<ConversationAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Get basic conversation stats
      const { data: conversations } = await db.getConversations(user.id);
      if (!conversations) return;

      // Calculate comprehensive stats
      const statsPromises = conversations.map(async (conv) => {
        const { data: messages } = await db.getMessages(conv.id);
        return { conversation: conv, messages: messages || [] };
      });

      const conversationData = await Promise.all(statsPromises);

      // Process analytics
      const totalConversations = conversations.length;
      const allMessages = conversationData.flatMap(({ messages }) => messages);
      const totalMessages = allMessages.length;
      const totalTokensUsed = allMessages.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0);

      // Calculate averages
      const averageMessagesPerConversation =
        totalConversations > 0 ? totalMessages / totalConversations : 0;
      const responseTimes = allMessages
        .filter((msg) => msg.role === 'assistant' && msg.response_time_ms)
        .map((msg) => msg.response_time_ms!);
      const averageResponseTime =
        responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
          : 0;

      // Model usage stats
      const modelStats = new Map<string, { count: number; tokens: number }>();
      allMessages.forEach((msg) => {
        if (msg.model_used) {
          const existing = modelStats.get(msg.model_used) || { count: 0, tokens: 0 };
          modelStats.set(msg.model_used, {
            count: existing.count + 1,
            tokens: existing.tokens + (msg.tokens_used || 0),
          });
        }
      });
      const mostUsedModels = Array.from(modelStats.entries())
        .map(([model, stats]) => ({ model, ...stats }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Time-based analytics
      const conversationsByDay = getDataByDay(conversations.map((c) => c.created_at));
      const messagesByDay = getMessagesByDay(allMessages);

      // Tool usage analytics
      const toolUsageStats = getToolUsageStats(allMessages);

      // Distribution analytics
      const conversationLengthDistribution = getConversationLengthDistribution(conversationData);
      const responseTimeDistribution = getResponseTimeDistribution(responseTimes);

      const analyticsStats: ConversationStats = {
        totalConversations,
        totalMessages,
        totalTokensUsed,
        averageMessagesPerConversation,
        averageResponseTime,
        mostUsedModels,
        conversationsByDay,
        messagesByDay,
        toolUsageStats,
        conversationLengthDistribution,
        responseTimeDistribution,
      };

      setStats(analyticsStats);

      // Generate detailed analytics for each conversation
      const detailedAnalytics: ConversationAnalytics[] = conversationData.map(
        ({ conversation, messages }) => {
          const userMessages = messages.filter((m) => m.role === 'user');
          const assistantMessages = messages.filter((m) => m.role === 'assistant');
          const totalTokens = messages.reduce((sum, m) => sum + (m.tokens_used || 0), 0);
          const avgResponseTime =
            assistantMessages.length > 0
              ? assistantMessages.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) /
                assistantMessages.length
              : 0;

          const firstMessage = messages[0];
          const lastMessage = messages[messages.length - 1];
          const duration =
            firstMessage && lastMessage
              ? Math.round(
                  (new Date(lastMessage.created_at).getTime() -
                    new Date(firstMessage.created_at).getTime()) /
                    (1000 * 60)
                )
              : 0;

          const toolsUsed = messages
            .flatMap((m) => (m.tool_calls as any[]) || [])
            .map((tool) => tool.function?.name || tool.type)
            .filter((name): name is string => typeof name === 'string') as string[];

          const modelsUsed = messages
            .map((m) => m.model_used)
            .filter((model): model is string => typeof model === 'string') as string[];

          return {
            id: conversation.id,
            title: conversation.title,
            messageCount: messages.length,
            totalTokens,
            averageResponseTime: avgResponseTime,
            createdAt: conversation.created_at,
            lastMessageAt: conversation.updated_at,
            duration,
            toolsUsed,
            modelsUsed,
            userMessageCount: userMessages.length,
            assistantMessageCount: assistantMessages.length,
          };
        }
      );

      setAnalytics(detailedAnalytics);
    } catch (err) {
      logger.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getConversationAnalytics = useCallback(
    async (conversationId: string): Promise<ConversationAnalytics | null> => {
      try {
        const { data: conversation } = await db.getConversation(conversationId);
        const { data: messages } = await db.getMessages(conversationId);

        if (!conversation || !messages) return null;

        const userMessages = messages.filter((m) => m.role === 'user');
        const assistantMessages = messages.filter((m) => m.role === 'assistant');
        const totalTokens = messages.reduce((sum, m) => sum + (m.tokens_used || 0), 0);
        const avgResponseTime =
          assistantMessages.length > 0
            ? assistantMessages.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) /
              assistantMessages.length
            : 0;

        const firstMessage = messages[0];
        const lastMessage = messages[messages.length - 1];
        const duration =
          firstMessage && lastMessage
            ? Math.round(
                (new Date(lastMessage.created_at).getTime() -
                  new Date(firstMessage.created_at).getTime()) /
                  (1000 * 60)
              )
            : 0;

        const toolsUsed = messages
          .flatMap((m) => (m.tool_calls as any[]) || [])
          .map((tool) => tool.function?.name || tool.type)
          .filter((name): name is string => typeof name === 'string') as string[];

        const modelsUsed = messages
          .map((m) => m.model_used)
          .filter((model): model is string => typeof model === 'string') as string[];

        return {
          id: conversation.id,
          title: conversation.title,
          messageCount: messages.length,
          totalTokens,
          averageResponseTime: avgResponseTime,
          createdAt: conversation.created_at,
          lastMessageAt: conversation.updated_at,
          duration,
          toolsUsed,
          modelsUsed,
          userMessageCount: userMessages.length,
          assistantMessageCount: assistantMessages.length,
        };
      } catch (err) {
        logger.error('Error fetching conversation analytics:', err);
        return null;
      }
    },
    []
  );

  const getDateRangeStats = useCallback(
    async (startDate: string, endDate: string): Promise<ConversationStats | null> => {
      // This would filter conversations and messages by date range
      // For now, return current stats as placeholder
      return stats;
    },
    [stats]
  );

  const exportData = useCallback(
    async (format: 'json' | 'csv'): Promise<string | null> => {
      if (!stats || analytics.length === 0) return null;

      try {
        if (format === 'json') {
          return JSON.stringify({ stats, analytics }, null, 2);
        } else {
          // Convert to CSV format
          const headers = [
            'Conversation ID',
            'Title',
            'Message Count',
            'Total Tokens',
            'Average Response Time',
            'Created At',
            'Duration (minutes)',
            'Tools Used',
            'Models Used',
          ];

          const rows = analytics.map((a) => [
            a.id,
            a.title,
            a.messageCount,
            a.totalTokens,
            a.averageResponseTime.toFixed(2),
            a.createdAt,
            a.duration,
            a.toolsUsed.join(';'),
            a.modelsUsed.join(';'),
          ]);

          const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(','))
            .join('\n');

          return csvContent;
        }
      } catch (err) {
        logger.error('Error exporting data:', err);
        return null;
      }
    },
    [stats, analytics]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    analytics,
    loading,
    error,
    refreshStats: fetchStats,
    getConversationAnalytics,
    getDateRangeStats,
    exportData,
  };
};

// Helper functions for analytics calculations

function getDataByDay(dates: string[]) {
  const dayMap = new Map<string, number>();
  dates.forEach((date) => {
    const day = new Date(date).toISOString().split('T')[0];
    dayMap.set(day, (dayMap.get(day) || 0) + 1);
  });

  return Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getMessagesByDay(messages: any[]) {
  const dayMap = new Map<string, { count: number; tokens: number }>();
  messages.forEach((message) => {
    const day = new Date(message.created_at).toISOString().split('T')[0];
    const existing = dayMap.get(day) || { count: 0, tokens: 0 };
    dayMap.set(day, {
      count: existing.count + 1,
      tokens: existing.tokens + (message.tokens_used || 0),
    });
  });

  return Array.from(dayMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getToolUsageStats(messages: any[]) {
  const toolMap = new Map<string, { total: number; successful: number }>();

  messages.forEach((message) => {
    if (message.tool_calls && Array.isArray(message.tool_calls)) {
      message.tool_calls.forEach((tool: any) => {
        const toolName = tool.function?.name || tool.type || 'unknown';
        const existing = toolMap.get(toolName) || { total: 0, successful: 0 };
        toolMap.set(toolName, {
          total: existing.total + 1,
          successful: existing.successful + (tool.error ? 0 : 1),
        });
      });
    }
  });

  return Array.from(toolMap.entries())
    .map(([tool, stats]) => ({
      tool,
      count: stats.total,
      successRate: stats.total > 0 ? (stats.successful / stats.total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function getConversationLengthDistribution(conversationData: any[]) {
  const ranges = [
    { min: 0, max: 5, label: '1-5 messages' },
    { min: 6, max: 10, label: '6-10 messages' },
    { min: 11, max: 25, label: '11-25 messages' },
    { min: 26, max: 50, label: '26-50 messages' },
    { min: 51, max: Infinity, label: '50+ messages' },
  ];

  return ranges.map((range) => ({
    range: range.label,
    count: conversationData.filter(
      ({ messages }) => messages.length >= range.min && messages.length <= range.max
    ).length,
  }));
}

function getResponseTimeDistribution(responseTimes: number[]) {
  const ranges = [
    { min: 0, max: 1000, label: '< 1s' },
    { min: 1000, max: 3000, label: '1-3s' },
    { min: 3000, max: 5000, label: '3-5s' },
    { min: 5000, max: 10000, label: '5-10s' },
    { min: 10000, max: Infinity, label: '10s+' },
  ];

  return ranges.map((range) => ({
    range: range.label,
    count: responseTimes.filter((time) => time >= range.min && time < range.max).length,
  }));
}
