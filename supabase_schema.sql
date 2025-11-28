-- Create user_settings table
create table if not exists public.user_settings (
    user_id uuid references auth.users not null primary key,
    settings jsonb not null default '{}'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for user_settings
alter table public.user_settings enable row level security;

create policy "Users can view their own settings"
    on public.user_settings for select
    using (auth.uid() = user_id);

create policy "Users can insert their own settings"
    on public.user_settings for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own settings"
    on public.user_settings for update
    using (auth.uid() = user_id);

-- Create user_custom_lists table
create table if not exists public.user_custom_lists (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    name text not null,
    description text,
    items jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for user_custom_lists
alter table public.user_custom_lists enable row level security;

create policy "Users can view their own custom lists"
    on public.user_custom_lists for select
    using (auth.uid() = user_id);

create policy "Users can insert their own custom lists"
    on public.user_custom_lists for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own custom lists"
    on public.user_custom_lists for update
    using (auth.uid() = user_id);

create policy "Users can delete their own custom lists"
    on public.user_custom_lists for delete
    using (auth.uid() = user_id);

-- Create function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_user_settings_updated_at
    before update on public.user_settings
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_user_custom_lists_updated_at
    before update on public.user_custom_lists
    for each row
    execute procedure public.handle_updated_at();
