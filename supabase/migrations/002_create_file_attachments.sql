-- Migration: Add file attachment support to chat system
-- This migration adds file attachment functionality to the existing conversation system

-- =====================================================
-- CREATE STORAGE BUCKET
-- =====================================================

-- Create storage bucket for chat files (run this in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', true);

-- Set up storage policies (run these in Supabase Dashboard > Storage > chat-files > Policies)
-- Policy: "Users can upload files to their own folder"
-- create policy "Users can upload files to their own folder" on storage.objects
--   for insert with check (auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: "Users can view their own files"
-- create policy "Users can view their own files" on storage.objects
--   for select using (auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: "Users can delete their own files"
-- create policy "Users can delete their own files" on storage.objects
--   for delete using (auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- CREATE MESSAGE ATTACHMENTS TABLE
-- =====================================================

-- Create message_attachments table
CREATE TABLE public.message_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    
    -- File metadata
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    
    -- Storage information
    storage_path TEXT NOT NULL,
    storage_bucket TEXT NOT NULL DEFAULT 'chat-files',
    public_url TEXT,
    
    -- Processing metadata
    thumbnail_url TEXT,
    processed_url TEXT, -- For optimized versions
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- AI processing metadata
    extracted_text TEXT, -- For documents
    ai_description TEXT, -- For images processed by AI
    
    -- Upload metadata
    upload_status TEXT DEFAULT 'uploaded' CHECK (upload_status IN ('pending', 'uploading', 'uploaded', 'error')),
    upload_progress INTEGER DEFAULT 100 CHECK (upload_progress >= 0 AND upload_progress <= 100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Index for finding attachments by message
CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);

-- Index for finding attachments by type
CREATE INDEX idx_message_attachments_file_type ON public.message_attachments(file_type);

-- Index for finding attachments by upload status
CREATE INDEX idx_message_attachments_upload_status ON public.message_attachments(upload_status);

-- Index for finding attachments by processing status
CREATE INDEX idx_message_attachments_processing_status ON public.message_attachments(processing_status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view attachments for their own messages
CREATE POLICY "Users can view their own message attachments" ON public.message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversations c ON m.conversation_id = c.id
            WHERE m.id = message_id AND c.user_id = auth.uid()
        )
    );

-- Policy: Users can insert attachments for their own messages
CREATE POLICY "Users can insert attachments for their own messages" ON public.message_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversations c ON m.conversation_id = c.id
            WHERE m.id = message_id AND c.user_id = auth.uid()
        )
    );

-- Policy: Users can update attachments for their own messages
CREATE POLICY "Users can update their own message attachments" ON public.message_attachments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversations c ON m.conversation_id = c.id
            WHERE m.id = message_id AND c.user_id = auth.uid()
        )
    );

-- Policy: Users can delete attachments for their own messages
CREATE POLICY "Users can delete their own message attachments" ON public.message_attachments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversations c ON m.conversation_id = c.id
            WHERE m.id = message_id AND c.user_id = auth.uid()
        )
    );

-- =====================================================
-- UPDATE MESSAGES TABLE
-- =====================================================

-- Add attachment count column to messages table for quick reference
ALTER TABLE public.messages 
ADD COLUMN attachment_count INTEGER DEFAULT 0;

-- Create function to update attachment count
CREATE OR REPLACE FUNCTION update_message_attachment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.messages 
        SET attachment_count = (
            SELECT COUNT(*) 
            FROM public.message_attachments 
            WHERE message_id = NEW.message_id
        )
        WHERE id = NEW.message_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.messages 
        SET attachment_count = (
            SELECT COUNT(*) 
            FROM public.message_attachments 
            WHERE message_id = OLD.message_id
        )
        WHERE id = OLD.message_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update attachment count
CREATE TRIGGER trigger_update_message_attachment_count
    AFTER INSERT OR DELETE ON public.message_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_message_attachment_count();

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get message attachments with metadata
CREATE OR REPLACE FUNCTION get_message_attachments(message_uuid UUID)
RETURNS TABLE (
    id UUID,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    public_url TEXT,
    thumbnail_url TEXT,
    upload_status TEXT,
    processing_status TEXT,
    created_at TIMESTAMPTZ
) 
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT 
        ma.id,
        ma.file_name,
        ma.file_type,
        ma.file_size,
        ma.public_url,
        ma.thumbnail_url,
        ma.upload_status,
        ma.processing_status,
        ma.created_at
    FROM public.message_attachments ma
    WHERE ma.message_id = message_uuid
    ORDER BY ma.created_at ASC;
$$;

-- Function to clean up orphaned attachments (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_orphaned_attachments()
RETURNS INTEGER 
LANGUAGE sql SECURITY DEFINER
AS $$
    WITH deleted AS (
        DELETE FROM public.message_attachments 
        WHERE message_id NOT IN (SELECT id FROM public.messages)
        RETURNING id
    )
    SELECT COUNT(*) FROM deleted;
$$;

-- =====================================================
-- INITIAL DATA & CLEANUP
-- =====================================================

-- Update existing messages to have correct attachment count
UPDATE public.messages 
SET attachment_count = 0 
WHERE attachment_count IS NULL;

-- Add index for the new attachment_count column
CREATE INDEX idx_messages_attachment_count ON public.messages(attachment_count) 
WHERE attachment_count > 0;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.message_attachments IS 'Stores file attachments for chat messages';
COMMENT ON COLUMN public.message_attachments.file_name IS 'Original filename as uploaded by user';
COMMENT ON COLUMN public.message_attachments.file_type IS 'MIME type of the file';
COMMENT ON COLUMN public.message_attachments.storage_path IS 'Path to file in Supabase storage';
COMMENT ON COLUMN public.message_attachments.extracted_text IS 'Text content extracted from documents for AI processing';
COMMENT ON COLUMN public.message_attachments.ai_description IS 'AI-generated description of image content';
COMMENT ON FUNCTION get_message_attachments(UUID) IS 'Retrieves all attachments for a specific message';
COMMENT ON FUNCTION cleanup_orphaned_attachments() IS 'Removes attachment records that no longer have corresponding messages';