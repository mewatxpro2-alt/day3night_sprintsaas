# 🪣 Supabase Storage Setup - Simple Guide

> A step-by-step guide for non-technical users

---

## What You'll Do

You need to create **2 storage buckets** and add **permissions** to each.

| Bucket Name | What It Stores |
|-------------|----------------|
| `submissions` | Kit images & videos from sellers |
| `messages` | File attachments in chat |

---

## Part 1: Create the Buckets

### Step 1: Open Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Click **Sign In** (top right)
3. Select your project

---

### Step 2: Go to Storage

1. Look at the **left sidebar**
2. Click **Storage** (looks like a folder icon)

![Storage location](https://i.imgur.com/placeholder.png)

---

### Step 3: Create "submissions" Bucket

1. Click the green **"New bucket"** button
2. Fill in:
   - **Name**: `submissions`
   - **Public bucket**: Toggle **ON** ✅
   - Leave other settings as default
3. Click **Create bucket**

✅ You should now see `submissions` in your bucket list

---

### Step 4: Create "messages" Bucket

1. Click **"New bucket"** again
2. Fill in:
   - **Name**: `messages`
   - **Public bucket**: Toggle **ON** ✅
3. Click **Create bucket**

✅ You should now see both `submissions` and `messages`

---

## Part 2: Add Permissions (Policies)

Without policies, users can't upload files. Let's add them.

---

### Step 5: Open Policy Editor

1. In Storage, click on **`submissions`** bucket
2. Click the **"Policies"** tab (near the top)
3. You'll see a section for different operations

---

### Step 6: Add Policies for "submissions" Bucket

You need to add **3 policies**. For each one:

1. Click **"New Policy"**
2. Choose **"For full customization"**
3. Copy the settings below exactly

---

#### Policy 1: Allow Anyone to View Files

1. Click **"New Policy"**
2. Click **"Get started quickly"** (the first option with templates)
3. Find and click: **"Allow public access to all files"** or **"Give users access to a folder matching their user id"**
4. If you don't see templates, use this method:
   - Click **"Create policy from scratch"**
   - **Policy name**: `Allow public read`
   - **Allowed operation**: Select `SELECT`
   - **USING expression**: Delete what's there and type: `bucket_id = 'submissions'`
5. Click **Save**

---

#### Policy 2: Allow Users to Upload Files

1. Click **"New Policy"**
2. Click **"Get started quickly"**
3. Look for: **"Allow authenticated users to upload"** and click it
4. If you don't see templates, use this method:
   - Click **"Create policy from scratch"**
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: Select `INSERT`
   - **Target roles**: Select `authenticated`
   - **WITH CHECK expression**: Delete what's there and type: `bucket_id = 'submissions'`
5. Click **Save**

---

#### Policy 3: Allow Users to Delete Their Files

1. Click **"New Policy"**  
2. Click **"Get started quickly"**
3. Look for: **"Allow authenticated users to delete"** and click it
4. If you don't see templates, use this method:
   - Click **"Create policy from scratch"**
   - **Policy name**: `Allow authenticated delete`
   - **Allowed operation**: Select `DELETE`
   - **Target roles**: Select `authenticated`
   - **USING expression**: Delete what's there and type: `bucket_id = 'submissions'`
5. Click **Save**

---

### 🚀 EASIEST METHOD (Recommended)

If the above is confusing, do this instead:

1. Go to **Storage** → Click your bucket (`submissions`)
2. Click **"Policies"** tab
3. Look for a toggle or button that says **"Enable public access"** or similar
4. Turn it **ON**

OR use the **SQL Editor** method (foolproof):

1. Go to **SQL Editor** in left sidebar
2. Paste this and click **Run**:

```sql
-- For submissions bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'submissions');
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'submissions');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'submissions');

-- For messages bucket  
CREATE POLICY "Public Access Messages" ON storage.objects FOR SELECT USING (bucket_id = 'messages');
CREATE POLICY "Auth Upload Messages" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'messages');
CREATE POLICY "Auth Delete Messages" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'messages');
```

3. You should see "Success" message
4. Done! ✅

✅ Your `submissions` bucket should now have 3 policies

---

### Step 7: Add Policies for "messages" Bucket

1. Go back to **Storage** (left sidebar)
2. Click on **`messages`** bucket
3. Click **"Policies"** tab
4. Add the **same 3 policies** as above:
   - `Public read` (SELECT, true)
   - `Users can upload` (INSERT, authenticated, true)
   - `Users can delete` (DELETE, authenticated, true)

---

## Part 3: Verify It Works

### Step 8: Test Upload

1. Go to your website
2. Try **submitting a kit** with an image
3. Go back to Supabase → Storage → `submissions`
4. You should see a folder with your uploaded file!

---

## Quick Reference

### What Each Policy Does

| Policy | What It Allows |
|--------|----------------|
| SELECT + `true` | Anyone can view/download files |
| INSERT + `authenticated` + `true` | Logged-in users can upload |
| DELETE + `authenticated` + `true` | Logged-in users can delete |

---

### If Something Goes Wrong

**"Bucket not found" error:**
- Check the bucket name is exactly `submissions` or `messages`
- No capital letters, no spaces

**"Permission denied" error:**
- Make sure you added the INSERT policy
- Make sure user is logged in on the website

**Files not showing:**
- Refresh the Storage page
- Check you're looking in the right bucket

---

## Summary Checklist

- [ ] Created `submissions` bucket (public)
- [ ] Created `messages` bucket (public)
- [ ] Added 3 policies to `submissions`:
  - [ ] Public read (SELECT)
  - [ ] Users can upload (INSERT)
  - [ ] Users can delete (DELETE)
- [ ] Added 3 policies to `messages`:
  - [ ] Public read (SELECT)
  - [ ] Users can upload (INSERT)
  - [ ] Users can delete (DELETE)
- [ ] Tested by uploading a file

---

## Need Help?

If you get stuck:
1. Take a screenshot of the error
2. Note which step you're on
3. Ask for help with the screenshot

That's it! Your storage is now ready. 🎉
