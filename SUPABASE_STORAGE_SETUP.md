# Supabase Storage Setup Guide

> Production-ready storage bucket configuration for WebCatalog Pro

---

## Executive Summary

After analyzing the entire codebase and all product flows, **3 buckets are required**:

| Bucket | Status | Purpose | Access |
|--------|--------|---------|--------|
| `submissions` | **REQUIRED** | Kit thumbnails, videos, screenshots | Public |
| `messages` | **REQUIRED** | Order communication attachments | Public |
| `source-files` | **RECOMMENDED** | Purchased kit deliverables | Private |

---

## Analysis Results by Feature

### ✅ Kit Submission Flow (`useSubmission.ts`)
**Status**: Storage actively used  
**Code Location**: `hooks/useSubmission.ts` lines 36-68

Currently uploads to bucket `submissions`:
- **Thumbnails**: `/thumbnails/{userId}/{timestamp}.{ext}` - Cover images
- **Videos**: `/videos/{userId}/{timestamp}.{ext}` - 60-second demos
- **Screenshots**: `/screenshots/{userId}/{timestamp}.{ext}` - Gallery images

**File Types**: Images (PNG, JPG, WebP), Videos (MP4, WebM)  
**Max Sizes**: Images ~5MB, Videos ~50MB (configurable)

---

### ✅ Order Messaging (`useMessages.ts`)
**Status**: Storage actively used  
**Code Location**: `hooks/useMessages.ts` lines 127-142

Currently uploads to bucket `messages`:
- **Path**: `/{orderId}/{timestamp}-{random}.{ext}`
- **Purpose**: File attachments in buyer-seller communication

**File Types**: Any (documents, images, zips)  
**Max Size**: ~10MB recommended

---

### ⚠️ Source Files Delivery (`order_access.source_files_url`)
**Status**: Currently uses external URLs  
**Code Location**: `pages/OrderDetails.tsx`, `supabase/functions/verify-payment/`

The `source_files_url` column stores direct download URLs. Currently:
- Sellers manually provide external URLs (Google Drive, Dropbox, etc.)
- No direct Supabase storage integration

**Recommendation**: Create `source-files` bucket for:
- Secure, time-limited signed URLs
- Download tracking
- Storage consistency

---

### ❌ Profile Avatars
**Status**: No storage needed  
**Reason**: `avatar_url` is populated from OAuth providers (Google, GitHub) or external URLs. No user upload flow exists in the codebase.

---

### ❌ Admin Verification Assets
**Status**: No storage needed  
**Reason**: No moderation workflow requires file uploads. All verification is based on existing submission files.

---

## Bucket Specifications

### 1. `submissions` (Required)

**Purpose**: Seller kit submission assets (thumbnails, demos, screenshots)

```
Type: PUBLIC
File Size Limit: 50 MB
Allowed MIME Types:
  - image/png
  - image/jpeg
  - image/webp
  - image/gif
  - video/mp4
  - video/webm
  - video/quicktime
```

**Folder Structure**:
```
submissions/
├── thumbnails/
│   └── {userId}/
│       └── {timestamp}.{ext}
├── videos/
│   └── {userId}/
│       └── {timestamp}.{ext}
└── screenshots/
    └── {userId}/
        └── {timestamp}.{ext}
```

**RLS Policies**:

| Policy | Operation | Rule |
|--------|-----------|------|
| Public read | SELECT | Anyone can view |
| Owner upload | INSERT | `auth.uid() = owner` (parsed from path) |
| Owner delete | DELETE | `auth.uid() = owner` |
| Admin full | ALL | `is_admin()` |

---

### 2. `messages` (Required)

**Purpose**: Order communication file attachments

```
Type: PUBLIC
File Size Limit: 10 MB
Allowed MIME Types:
  - image/*
  - application/pdf
  - application/zip
  - text/plain
```

**Folder Structure**:
```
messages/
└── {orderId}/
    └── {timestamp}-{random}.{ext}
```

**RLS Policies**:

| Policy | Operation | Rule |
|--------|-----------|------|
| Public read | SELECT | Anyone can view (URLs shared in messages) |
| Order participant upload | INSERT | User is buyer or seller of the order |
| Admin full | ALL | `is_admin()` |

---

### 3. `source-files` (Recommended)

**Purpose**: Protected kit source code delivery

```
Type: PRIVATE
File Size Limit: 500 MB
Allowed MIME Types:
  - application/zip
  - application/x-zip-compressed
  - application/x-tar
  - application/gzip
```

**Folder Structure**:
```
source-files/
└── {listingId}/
    └── {version}/
        └── source.zip
```

**RLS Policies**:

| Policy | Operation | Rule |
|--------|-----------|------|
| Seller upload | INSERT | `auth.uid() = listing.seller_id` |
| Buyer download | SELECT | User has valid `order_access` record |
| Admin full | ALL | `is_admin()` |

**Note**: Use signed URLs (1-hour expiry) for downloads, not public URLs.

---

## Step-by-Step Setup Instructions

### Step 1: Create Buckets in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**

#### Create `submissions` bucket:
- **Name**: `submissions`
- **Public bucket**: ✅ Yes
- **File size limit**: `52428800` (50 MB)
- **Allowed MIME types**: `image/png, image/jpeg, image/webp, image/gif, video/mp4, video/webm, video/quicktime`
- Click **Create bucket**

#### Create `messages` bucket:
- **Name**: `messages`
- **Public bucket**: ✅ Yes
- **File size limit**: `10485760` (10 MB)
- **Allowed MIME types**: Leave empty (allow all) or specify as needed
- Click **Create bucket**

#### Create `source-files` bucket (Optional but recommended):
- **Name**: `source-files`
- **Public bucket**: ❌ No (Private)
- **File size limit**: `524288000` (500 MB)
- **Allowed MIME types**: `application/zip, application/x-zip-compressed, application/gzip`
- Click **Create bucket**

---

### Step 2: Configure Storage Policies

For **PUBLIC** buckets (`submissions`, `messages`), policies are needed for write access.

Go to **Storage** → **Policies** → Select bucket → **New Policy**

#### `submissions` bucket policies:

**Policy 1: Public Read**
```sql
-- Allow anyone to view files
CREATE POLICY "Public read for submissions"
ON storage.objects FOR SELECT
USING (bucket_id = 'submissions');
```

**Policy 2: Authenticated Upload**
```sql
-- Allow authenticated users to upload to their folder
CREATE POLICY "Users can upload submissions"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'submissions' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[2] = auth.uid()::text
);
```

**Policy 3: Owner Delete**
```sql
-- Allow users to delete their own files
CREATE POLICY "Users can delete own submissions"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'submissions' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[2] = auth.uid()::text
);
```

#### `messages` bucket policies:

**Policy 1: Public Read**
```sql
CREATE POLICY "Public read for messages"
ON storage.objects FOR SELECT
USING (bucket_id = 'messages');
```

**Policy 2: Order Participant Upload**
```sql
-- Only order participants can upload
CREATE POLICY "Order participants can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'messages'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id::text = (storage.foldername(name))[1]
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    AND orders.status IN ('paid', 'delivered', 'completed')
  )
);
```

#### `source-files` bucket policies (if created):

**Policy 1: Seller Upload**
```sql
CREATE POLICY "Sellers can upload source files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'source-files'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM listings
    WHERE listings.id::text = (storage.foldername(name))[1]
    AND listings.seller_id = auth.uid()
  )
);
```

**Policy 2: Buyer Download** (via signed URL in code, not direct policy)
```
Note: Private buckets should use signed URLs generated server-side.
Do not create a SELECT policy. Use supabase.storage.createSignedUrl() instead.
```

---

### Step 3: Verify Setup

1. **Test submissions upload**:
   - Submit a kit with thumbnail/video
   - Check if files appear in Storage → submissions

2. **Test messages upload**:
   - Send a message with attachment in an active order
   - Check if files appear in Storage → messages

3. **Verify public URLs work**:
   - Copy a file's public URL from Storage
   - Open in browser (should load without auth)

---

## Best Practices

### Security
- ✅ Always validate file types client AND server-side
- ✅ Generate unique filenames with timestamps to prevent overwrites
- ✅ Use private buckets for sensitive content (source files)
- ✅ Set appropriate file size limits per bucket
- ❌ Never store credentials or secrets in storage

### Performance
- ✅ Use CDN URLs for frequently accessed files
- ✅ Consider image optimization (WebP, compression)
- ✅ Use thumbnails for video preview instead of loading full video
- ✅ Implement lazy loading for gallery images

### Limits (Supabase Free Tier)
| Resource | Limit |
|----------|-------|
| Storage | 1 GB |
| Bandwidth | 2 GB/month |
| File uploads | 50 MB max |

### File Naming
```
✅ Good: {userId}/{folder}/{timestamp}.{ext}
✅ Good: {orderId}/{uuid}.{ext}
❌ Bad:  original-filename.png (collisions)
❌ Bad:  ../../../etc/passwd (security risk)
```

---

## Rollback Plan

If storage causes issues:

1. The code in `useSubmission.ts` already handles missing buckets gracefully:
   ```typescript
   if (error) {
     console.warn('Storage upload skipped:', error.message);
     return null;
   }
   ```

2. Submissions will save without media URLs (still functional)

3. To disable storage temporarily:
   - Don't delete buckets
   - Just revoke INSERT policies to block new uploads

---

## Files That Use Storage

| File | Bucket | Purpose |
|------|--------|---------|
| `hooks/useSubmission.ts` | `submissions` | Kit assets upload |
| `hooks/useMessages.ts` | `messages` | Chat attachments |
| `pages/OrderDetails.tsx` | (external) | Source file download |

---

## Checklist

- [ ] Create `submissions` bucket (public)
- [ ] Create `messages` bucket (public)
- [ ] Create `source-files` bucket (private, optional)
- [ ] Add RLS policies for each bucket
- [ ] Test upload flow on Submit page
- [ ] Test attachment flow in Messages
- [ ] Verify public URL access
- [ ] Monitor storage usage in dashboard
