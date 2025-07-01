# 🚀 File Upload Setup Guide

This guide walks you through setting up file uploads in your Expo app from scratch.

## ⚡ Prerequisites

- Expo project with Supabase authentication configured
- OpenAI API key for GPT-4o vision processing
- Supabase project with database access

## 📦 Step 1: Install Dependencies

Install the required Expo packages:

```bash
npm install expo-document-picker expo-image-picker expo-image-manipulator expo-file-system
```

**Note:** These packages may require `expo install` if you encounter compatibility issues.

## 🔧 Step 2: Environment Configuration

Update your `.env.local` file:

```bash
# Enable file upload features
EXPO_PUBLIC_ENABLE_STORAGE=true
EXPO_PUBLIC_ENABLE_FILE_UPLOADS=true

# File upload settings (optional - these are defaults)
EXPO_PUBLIC_MAX_FILE_SIZE=10485760          # 10MB
EXPO_PUBLIC_MAX_IMAGE_SIZE=1024             # AI processing size  
EXPO_PUBLIC_THUMBNAIL_SIZE=150              # Thumbnail size
EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET=chat-files

# Ensure Supabase is configured
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Ensure OpenAI is configured for vision processing
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## 🗄️ Step 3: Database Setup

### A. Run Migration

1. Copy the migration file content from `supabase/migrations/002_create_file_attachments.sql`
2. Go to your Supabase Dashboard → SQL Editor
3. Paste and run the migration
4. Verify the `message_attachments` table was created

### B. Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "Create bucket"
3. Name: `chat-files`
4. Set as Public bucket
5. Click "Create bucket"

### C. Set Storage Policies

In Storage → chat-files → Policies, create these 3 policies:

**Policy 1: Upload Permission**
```sql
CREATE POLICY "Users can upload files to their own folder" 
ON storage.objects FOR INSERT 
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
```

**Policy 2: Read Permission**  
```sql
CREATE POLICY "Users can view their own files" 
ON storage.objects FOR SELECT 
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

**Policy 3: Delete Permission**
```sql
CREATE POLICY "Users can delete their own files" 
ON storage.objects FOR DELETE 
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## 🧪 Step 4: Test Setup

1. **Start your app:**
   ```bash
   npm run start
   ```

2. **Test file selection:**
   - Open the chat screen
   - Tap the plus (+) button
   - Verify the file selection modal appears
   - Try each option: "Take Photo", "Photo Library", "Browse Files"

3. **Test file upload:**
   - Select a small image (< 1MB)
   - Verify thumbnail appears
   - Check upload progress indicator
   - Confirm file uploads successfully

4. **Test AI integration:**
   - Send a message with an image attached
   - Verify GPT-4o responds with image analysis

## ✅ Verification Checklist

- [ ] Dependencies installed without errors
- [ ] Environment variables configured
- [ ] Database migration completed successfully
- [ ] Storage bucket created and configured
- [ ] Storage policies applied correctly
- [ ] File selection modal opens
- [ ] Image picker works (camera & library)
- [ ] Document picker works
- [ ] File upload progress shows
- [ ] Upload completes successfully
- [ ] AI processes image attachments
- [ ] Error handling works (try large file)

## 🚨 Common Issues

**Issue: Packages won't install**
```bash
# Solution: Use expo install instead
npx expo install expo-document-picker expo-image-picker expo-image-manipulator expo-file-system
```

**Issue: "Storage bucket not found"**
```bash
# Solution: Check bucket name matches environment variable
EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET=chat-files
```

**Issue: "Permission denied" on upload**
```bash
# Solution: Verify storage policies are set correctly
# Check that auth.uid() is working in Supabase
```

**Issue: File picker doesn't open**
```bash
# Solution: Check permissions and platform compatibility
# On iOS: Ensure proper Info.plist permissions
# On Android: Check AndroidManifest.xml permissions
```

## 🎯 Next Steps

Once file uploads are working:

1. **Customize file types:** Add support for additional formats in `src/lib/fileUpload.ts`
2. **Adjust limits:** Modify file size limits in environment variables
3. **Enhance UI:** Customize file preview components for your brand
4. **Add analytics:** Track file upload success rates and types
5. **Performance testing:** Test with larger files and multiple uploads

## 📚 Additional Resources

- [Complete Feature Documentation](./README.md)
- [Troubleshooting Guide](./README.md#troubleshooting)
- [Configuration Options](./README.md#configuration-options)
- [Component Architecture](./README.md#component-architecture)

**Need help?** Check the troubleshooting section in the main documentation or create an issue in the repository.