-- Migration: Create Conversations System
-- Description: Creates tables for AI chat conversations with sharing, archival, and advanced metadata support

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for message roles
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system', 'tool');

-- Create enum for conversation status
CREATE TYPE conversation_status AS ENUM ('active', 'archived', 'shared');

-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status conversation_status NOT NULL DEFAULT 'active',
    is_shared BOOLEAN NOT NULL DEFAULT false,
    share_token UUID UNIQUE DEFAULT uuid_generate_v4(),
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT title_length CHECK (char_length(title) BETWEEN 1 AND 200),
    CONSTRAINT archived_status_check CHECK (
        (status = 'archived' AND archived_at IS NOT NULL) OR 
        (status != 'archived' AND archived_at IS NULL)
    )
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role message_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Message metadata for tracking AI responses and tool usage
    metadata JSONB DEFAULT '{}',
    
    -- AI-specific fields
    model_used TEXT,
    tokens_used INTEGER,
    response_time_ms INTEGER,
    
    -- Tool call tracking
    tool_calls JSONB DEFAULT '[]',
    tool_results JSONB DEFAULT '[]',
    
    -- Content versioning and editing
    version INTEGER NOT NULL DEFAULT 1,
    parent_message_id UUID REFERENCES messages(id),
    
    -- Constraints
    CONSTRAINT content_length CHECK (char_length(content) BETWEEN 1 AND 50000),
    CONSTRAINT tokens_positive CHECK (tokens_used IS NULL OR tokens_used >= 0),
    CONSTRAINT response_time_positive CHECK (response_time_ms IS NULL OR response_time_ms >= 0),
    CONSTRAINT version_positive CHECK (version > 0)
);

-- Create conversation_shares table for managing shared conversations
CREATE TABLE conversation_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means public share
    permissions TEXT[] NOT NULL DEFAULT ARRAY['read'], -- read, write, admin
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(conversation_id, shared_with),
    CONSTRAINT valid_permissions CHECK (
        permissions <@ ARRAY['read', 'write', 'admin'] AND 
        array_length(permissions, 1) > 0
    )
);

-- Create indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_shared ON conversations(is_shared) WHERE is_shared = true;
CREATE INDEX idx_conversations_archived_cleanup ON conversations(archived_at) WHERE status = 'archived';
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_model ON messages(model_used) WHERE model_used IS NOT NULL;

CREATE INDEX idx_conversation_shares_conversation_id ON conversation_shares(conversation_id);
CREATE INDEX idx_conversation_shares_shared_with ON conversation_shares(shared_with);
CREATE INDEX idx_conversation_shares_expires ON conversation_shares(expires_at) WHERE expires_at IS NOT NULL;

-- Create function to update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET updated_at = NOW() 
    WHERE id = COALESCE(NEW.conversation_id, OLD.conversation_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp when messages are added/updated
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT OR UPDATE OR DELETE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_updated_at();

-- Create function to auto-generate conversation titles
CREATE OR REPLACE FUNCTION generate_conversation_title(conversation_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    first_user_message TEXT;
    title TEXT;
BEGIN
    -- Get the first user message content
    SELECT content INTO first_user_message
    FROM messages 
    WHERE conversation_id = conversation_id_param 
    AND role = 'user' 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    IF first_user_message IS NULL THEN
        RETURN 'New Conversation';
    END IF;
    
    -- Create title from first 50 characters, clean it up
    title := trim(substring(first_user_message from 1 for 50));
    
    -- Remove newlines and extra spaces
    title := regexp_replace(title, '\s+', ' ', 'g');
    
    -- Add ellipsis if truncated
    IF length(first_user_message) > 50 THEN
        title := title || '...';
    END IF;
    
    RETURN title;
END;
$$ LANGUAGE plpgsql;

-- Create function to cleanup archived conversations
CREATE OR REPLACE FUNCTION cleanup_archived_conversations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete conversations that have been archived for more than 7 days
    DELETE FROM conversations 
    WHERE status = 'archived' 
    AND archived_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_shares ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (
        user_id = auth.uid() OR 
        id IN (
            SELECT conversation_id FROM conversation_shares 
            WHERE shared_with = auth.uid() OR (shared_with IS NULL AND expires_at > NOW())
        )
    );

CREATE POLICY "Users can create their own conversations" ON conversations
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own conversations" ON conversations
    FOR DELETE USING (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages from accessible conversations" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE user_id = auth.uid() OR 
            id IN (
                SELECT conversation_id FROM conversation_shares 
                WHERE shared_with = auth.uid() OR (shared_with IS NULL AND expires_at > NOW())
            )
        )
    );

CREATE POLICY "Users can create messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in their conversations" ON messages
    FOR UPDATE USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages from their conversations" ON messages
    FOR DELETE USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE user_id = auth.uid()
        )
    );

-- Conversation shares policies
CREATE POLICY "Users can view shares for their conversations" ON conversation_shares
    FOR SELECT USING (
        shared_by = auth.uid() OR 
        shared_with = auth.uid() OR
        conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create shares for their conversations" ON conversation_shares
    FOR INSERT WITH CHECK (
        shared_by = auth.uid() AND 
        conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own shares" ON conversation_shares
    FOR UPDATE USING (shared_by = auth.uid());

CREATE POLICY "Users can delete their own shares" ON conversation_shares
    FOR DELETE USING (shared_by = auth.uid());

-- Create views for easier querying

-- View for conversation with message counts and last message
CREATE VIEW conversation_summaries AS
SELECT 
    c.*,
    COUNT(m.id) as message_count,
    MAX(m.created_at) as last_message_at,
    (
        SELECT content 
        FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) as last_message_preview
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id;

-- View for shared conversations with permission details
CREATE VIEW shared_conversations AS
SELECT 
    c.*,
    cs.shared_by,
    cs.shared_with,
    cs.permissions,
    cs.expires_at,
    u.email as shared_by_email
FROM conversations c
JOIN conversation_shares cs ON c.id = cs.conversation_id
LEFT JOIN auth.users u ON cs.shared_by = u.id
WHERE c.is_shared = true;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Insert sample data for testing (optional - can be removed in production)
-- This will be skipped if there are existing conversations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM conversations LIMIT 1) THEN
        -- Create a sample conversation (only if user exists)
        IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
            INSERT INTO conversations (id, user_id, title, metadata) 
            SELECT 
                uuid_generate_v4(),
                (SELECT id FROM auth.users LIMIT 1),
                'Welcome to your AI Assistant',
                '{"sample": true, "created_by": "migration"}'::jsonb;
        END IF;
    END IF;
END $$;