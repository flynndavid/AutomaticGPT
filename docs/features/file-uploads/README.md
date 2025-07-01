# 📎 File Upload Feature

## 🎯 Overview

The File Upload feature enables users to attach images and documents to their chat messages, providing multimodal AI interactions with GPT-4o vision capabilities. Users can upload images for visual analysis, attach documents for content processing, and seamlessly integrate files into their conversations.

**Status:** ✅ Ready for Production

## ⚡ Quick Start

```bash
# 1. Enable file uploads in your environment
EXPO_PUBLIC_ENABLE_FILE_UPLOADS=true
EXPO_PUBLIC_ENABLE_STORAGE=true

# 2. Configure Supabase (required)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# 3. Run database migration
# Execute: supabase/migrations/002_create_file_attachments.sql

# 4. Install required packages
npm install expo-document-picker expo-image-picker expo-image-manipulator expo-file-system

# 5. Start the app
npm run start
```

## 🔧 Complete Setup Guide

### 1. Install Dependencies

The following Expo packages are required and should be automatically installed:

```json
{
  "expo-document-picker": "~12.1.5",
  "expo-file-system": "~18.1.3", 
  "expo-image-manipulator": "~12.2.0",
  "expo-image-picker": "~16.2.0"
}
```

### 2. Environment Configuration

Add these variables to your `.env.local` file:

```bash
# Enable file upload features
EXPO_PUBLIC_ENABLE_STORAGE=true
EXPO_PUBLIC_ENABLE_FILE_UPLOADS=true

# File upload limits and settings
EXPO_PUBLIC_MAX_FILE_SIZE=10485760          # 10MB in bytes
EXPO_PUBLIC_MAX_IMAGE_SIZE=1024             # Max width/height for AI processing
EXPO_PUBLIC_THUMBNAIL_SIZE=150              # Thumbnail size in pixels
EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET=chat-files

# Supported file types
EXPO_PUBLIC_SUPPORTED_IMAGE_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp
EXPO_PUBLIC_SUPPORTED_DOCUMENT_TYPES=application/pdf,text/plain,text/csv
```

### 3. Supabase Setup

#### A. Database Migration

Execute the migration file in your Supabase SQL editor:

```sql
-- Run the complete migration from:
-- supabase/migrations/002_create_file_attachments.sql
```

This creates:
- `message_attachments` table for file metadata
- RLS policies for secure file access
- Utility functions for attachment management
- Triggers for automatic attachment counting

#### B. Storage Bucket Setup

1. **Create Storage Bucket:**
   ```sql
   -- In Supabase Dashboard > Storage, create a new bucket
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('chat-files', 'chat-files', true);
   ```

2. **Set Storage Policies:**
   
   Go to Storage > chat-files > Policies and create these policies:

   **Policy 1: Users can upload files**
   ```sql
   CREATE POLICY "Users can upload files to their own folder" 
   ON storage.objects FOR INSERT 
   WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
   ```

   **Policy 2: Users can view their files**
   ```sql
   CREATE POLICY "Users can view their own files" 
   ON storage.objects FOR SELECT 
   USING (auth.uid()::text = (storage.foldername(name))[1]);
   ```

   **Policy 3: Users can delete their files**
   ```sql
   CREATE POLICY "Users can delete their own files" 
   ON storage.objects FOR DELETE 
   USING (auth.uid()::text = (storage.foldername(name))[1]);
   ```

### 4. Verify Setup

After setup, verify everything works:

1. **Test File Selection:**
   - Tap the plus (+) button in chat
   - Select "Take Photo", "Photo Library", or "Browse Files"
   - Verify file picker opens correctly

2. **Test File Upload:**
   - Select a small image file
   - Verify thumbnail appears
   - Check upload progress indicator
   - Confirm upload completes successfully

3. **Test AI Integration:**
   - Send a message with an attached image
   - Verify AI responds with image analysis
   - Test document attachment with text extraction

## ✨ Features

### Core Functionality
- ✅ **Image Uploads** - Photos from camera or library
- ✅ **Document Uploads** - PDFs and text files
- ✅ **File Validation** - Type and size checking
- ✅ **Progress Tracking** - Real-time upload progress
- ✅ **Thumbnail Generation** - Automatic image thumbnails
- ✅ **AI Integration** - GPT-4o vision and document processing
- ✅ **Error Handling** - Graceful error states and retry options
- ✅ **Security** - User-scoped file access with RLS

### Supported File Types

**Images (Vision Processing):**
- JPEG/JPG - Full AI vision analysis
- PNG - Full AI vision analysis  
- GIF - Static frame analysis
- WebP - Full AI vision analysis

**Documents (Text Extraction):**
- PDF - Text content extraction
- TXT - Plain text reading
- CSV - Structured data processing

### File Size Limits
- **Maximum file size:** 10MB (configurable)
- **Image optimization:** Auto-resize to 1024px max dimension
- **Thumbnail size:** 150px (configurable)

## 📱 User Experience

### File Selection Flow

1. **Tap Plus Button** → File selection modal opens
2. **Choose Source:**
   - **Take Photo** - Camera capture with permissions
   - **Photo Library** - Multi-select from gallery
   - **Browse Files** - Document picker for PDFs/text files

3. **File Processing:**
   - Automatic validation (type, size)
   - Image optimization and thumbnail generation
   - Background upload to Supabase storage

4. **Upload Feedback:**
   - Visual progress indicators
   - Status badges (pending, uploading, uploaded, error)
   - Remove/retry options for failed uploads

5. **Message Sending:**
   - Send button enabled only when uploads complete
   - Files and text sent together as single message
   - AI processes both content types

### Visual Design

**File Previews:**
- 80x80px thumbnail containers
- File type icons for non-images
- Upload progress overlays
- Status indicators (green checkmark, red error, etc.)
- Remove buttons for easy management

**Upload States:**
- **Pending** - Gray clock icon
- **Uploading** - Blue progress indicator
- **Uploaded** - Green checkmark
- **Error** - Red alert icon with retry option

## 🔌 API Integration

### Chat API Enhancement

The chat API automatically processes file attachments:

**For Images:**
```typescript
// Images are converted to base64 for GPT-4o vision
{
  type: 'image',
  image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...'
}
```

**For Documents:**
```typescript
// Text content is extracted and included
{
  type: 'text', 
  text: 'File: document.pdf\n\nExtracted content here...'
}
```

### Message Format

Messages with attachments follow this structure:

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
  attachments?: FileAttachment[];
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uri: string;
  supabaseUrl?: string;
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'error';
  uploadProgress?: number;
  thumbnailUri?: string;
  error?: string;
}
```

## 🎛️ Configuration Options

### File Upload Settings

```typescript
// src/config/index.ts
export const config = {
  fileUpload: {
    maxFileSize: 10485760,        // 10MB
    maxImageSize: 1024,           // AI processing size
    supportedImageTypes: [...],    // Allowed image formats
    supportedDocumentTypes: [...], // Allowed document formats
    storageBucket: 'chat-files',   // Supabase bucket
    thumbnailSize: 150,            // Thumbnail dimensions
  }
};
```

### Feature Flags

```bash
# Enable/disable entire feature
EXPO_PUBLIC_ENABLE_FILE_UPLOADS=true

# Enable/disable storage (required for file uploads)
EXPO_PUBLIC_ENABLE_STORAGE=true

# Customize limits
EXPO_PUBLIC_MAX_FILE_SIZE=10485760
EXPO_PUBLIC_MAX_IMAGE_SIZE=1024
EXPO_PUBLIC_THUMBNAIL_SIZE=150
```

## 🧩 Component Architecture

### Hook: `useFileUpload`

Manages all file upload state and operations:

```typescript
const {
  attachments,           // Current file list
  isUploading,          // Upload in progress
  uploadProgress,       // Progress per file
  selectFiles,          // Document picker
  selectImages,         // Image library
  captureImage,         // Camera capture
  removeAttachment,     // Remove file
  clearAttachments,     // Clear all files
  uploadPendingFiles,   // Upload to storage
} = useFileUpload();
```

### Components

**`<FileSelectionModal />`** - Native action sheet for file source selection

**`<FilePreview />`** - Individual file thumbnail with progress and controls

**`<InputBar />`** - Enhanced with file preview scroll area

**`<Chat />`** - Integrated file upload workflow

## 🚨 Troubleshooting

### Common Issues

**Issue: "File upload failed"**
```bash
# Solution: Check Supabase configuration
1. Verify EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
2. Ensure storage bucket 'chat-files' exists
3. Check storage policies are correctly set
4. Verify RLS policies on message_attachments table
```

**Issue: "Permission denied for camera/photos"**
```bash
# Solution: Handle permissions properly
1. Permissions are requested automatically
2. Guide user to Settings if permissions denied
3. Check platform-specific permission handling
```

**Issue: "File too large"**
```bash
# Solution: Adjust file size limits
EXPO_PUBLIC_MAX_FILE_SIZE=20971520  # Increase to 20MB
# Or guide users to compress files before upload
```

**Issue: "Unsupported file type"**
```bash
# Solution: Check supported types
1. Verify file MIME type matches supported list
2. Add new types to supportedImageTypes/supportedDocumentTypes
3. Update file validation logic if needed
```

### Debug Steps

1. **Check Environment Variables:**
   ```bash
   # Verify in app
   console.log('File uploads enabled:', config.features.enableFileUploads);
   console.log('Storage enabled:', config.features.enableStorage);
   ```

2. **Test Supabase Connection:**
   ```bash
   # In browser console or app
   console.log('Supabase configured:', supabase !== null);
   ```

3. **Check Storage Policies:**
   ```sql
   -- In Supabase SQL editor
   SELECT * FROM storage.objects WHERE bucket_id = 'chat-files';
   ```

4. **Verify Database Migration:**
   ```sql
   -- Check if table exists
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'message_attachments';
   ```

### Error Messages

| Error                 | Cause                 | Solution                                          |
| --------------------- | --------------------- | ------------------------------------------------- |
| "Supabase not configured" | Missing environment variables | Add SUPABASE_URL and SUPABASE_ANON_KEY |
| "File size too large" | File exceeds limit | Reduce file size or increase limit |
| "Upload failed" | Network/permission issue | Check connection and storage policies |
| "Invalid file type" | Unsupported format | Use supported formats or extend validation |

## 📈 Performance Considerations

### Optimization Strategies

**Image Processing:**
- Auto-resize images to 1024px max for AI processing
- Generate 150px thumbnails for UI display
- Use JPEG compression (0.8 quality) for optimized files
- Process images sequentially to avoid memory issues

**Upload Management:**
- Queue uploads to prevent overwhelming server
- Show progress feedback to user
- Implement retry mechanism for failed uploads
- Clear processed files from memory after upload

**Memory Management:**
- Clean up temporary files after successful upload
- Use thumbnail URIs instead of full images in UI
- Implement proper file cleanup on component unmount
- Monitor memory usage in large file operations

### File Size Recommendations

- **Images:** Keep under 5MB for best performance
- **Documents:** PDF files should be under 10MB
- **Thumbnails:** 150px thumbnails balance quality and performance
- **Processing:** 1024px max dimension optimal for AI analysis

## 🔐 Security Features

### Access Control

**Row Level Security (RLS):**
- Users can only access their own file attachments
- Files are isolated by user ID in storage
- Automatic cleanup of orphaned attachments

**Storage Security:**
- Files organized by user ID in folder structure
- Public URLs are secured by Supabase policies
- File paths include random identifiers

**Validation:**
- Server-side file type validation
- File size limits enforced
- MIME type verification
- Malicious file prevention

### Privacy Protection

- User files are completely isolated
- No cross-user file access possible
- Automatic file cleanup on account deletion
- Secure URL generation with expiration

## 📚 Related Documentation

- [Setup Guide](../../SETUP.md) - Initial project configuration
- [Chat Feature](../chat/README.md) - Core chat functionality  
- [Authentication](../auth/README.md) - User authentication system
- [Supabase Integration](../../supabase/README.md) - Database and storage setup
- [Environment Variables](../../ENV_SETUP.md) - Configuration reference

## 🤝 Contributing

To improve the file upload feature:

1. 📖 Review the implementation in [`src/features/chat/`](../../../src/features/chat/)
2. 🔧 Test file upload flows on iOS, Android, and Web
3. 📝 Update this documentation for any changes
4. ✅ Ensure all file types and limits work correctly
5. 📤 Submit a pull request with test results

### Development Guidelines

- Test with various file sizes and types
- Verify upload progress indicators work smoothly  
- Ensure error states provide helpful user guidance
- Test offline/online scenarios
- Validate AI integration with different content types
- Check memory usage with large files

**File upload is a core feature that enhances the AI chat experience. Always prioritize user experience, security, and performance when making improvements.**