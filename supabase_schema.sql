-- Create the subscribers table if it doesn't exist
create table if not exists public.subscribers (
  id uuid not null default gen_random_uuid (),
  email text not null,
  created_at timestamp with time zone not null default now(),
  constraint subscribers_pkey primary key (id),
  constraint subscribers_email_key unique (email)
);

-- Enable Row Level Security (RLS) on subscribers
alter table public.subscribers enable row level security;

-- Policies for subscribers (Drop existing to avoid conflicts if re-running)
drop policy if exists "Enable insert for all users" on public.subscribers;
create policy "Enable insert for all users" on public.subscribers
  for insert
  with check (true);

drop policy if exists "Enable read access for admin only" on public.subscribers;
create policy "Enable read access for admin only" on public.subscribers
  for select
  using (auth.role() = 'service_role');


-- Create the contact_messages table if it doesn't exist
create table if not exists public.contact_messages (
  id uuid not null default gen_random_uuid (),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone not null default now(),
  constraint contact_messages_pkey primary key (id)
);

-- Enable Row Level Security (RLS) on contact_messages
alter table public.contact_messages enable row level security;

-- Policies for contact_messages
drop policy if exists "Enable insert for all users" on public.contact_messages;
create policy "Enable insert for all users" on public.contact_messages
  for insert
  with check (true);

drop policy if exists "Enable read access for admin only" on public.contact_messages;
create policy "Enable read access for admin only" on public.contact_messages
  for select
  using (auth.role() = 'service_role');


-- Create the comments table if it doesn't exist
create table if not exists public.comments (
  id uuid not null default gen_random_uuid (),
  article_slug text not null,
  user_id uuid not null references auth.users(id),
  user_email text not null,
  user_name text,
  avatar_url text,
  content text not null,
  created_at timestamp with time zone not null default now(),
  constraint comments_pkey primary key (id)
);

-- Enable Row Level Security (RLS) on comments
alter table public.comments enable row level security;

-- Policies for comments
drop policy if exists "Enable read access for all users" on public.comments;
create policy "Enable read access for all users" on public.comments
  for select
  using (true);

drop policy if exists "Enable insert for authenticated users only" on public.comments;
create policy "Enable insert for authenticated users only" on public.comments
  for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Enable delete for users based on user_id" on public.comments;
create policy "Enable delete for users based on user_id" on public.comments
  for delete
  using (auth.uid() = user_id);
