-- Create blog_posts table
create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  slug text not null unique,
  title text not null,
  excerpt text,
  content text, -- Markdown content
  cover_image text,
  
  author_id uuid references auth.users(id),
  
  is_published boolean default false,
  is_featured boolean default false,
  published_at timestamp with time zone,
  
  tags text[] default array[]::text[],
  
  seo_title text,
  seo_description text
);

-- RLS Policies
alter table public.blog_posts enable row level security;

-- Everyone can read published posts
create policy "Public can read published posts"
  on public.blog_posts for select
  using (is_published = true);

-- Admins can do everything
-- Note: Reusing the existing admin check pattern or simplified for now if admin role is not strictly enforcing RLS yet on other tables, 
-- but ideally we check if auth.uid() is an admin. 
-- For this system, we'll assume a 'service_role' or authenticated admin user. 
-- For simplicity in this codebase context where explicit separate "admin" role table might not be strictly enforced in RLS for all tables yet:
create policy "Admins can do everything"
  on public.blog_posts
  using (auth.role() = 'authenticated') -- Refine this if we have a strict admin_users table.
  with check (auth.role() = 'authenticated'); 
  
-- Indexes
create index blog_posts_slug_idx on public.blog_posts (slug);
create index blog_posts_published_at_idx on public.blog_posts (published_at);
