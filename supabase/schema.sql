-- Bean Scene external Supabase schema
-- Run in Supabase SQL Editor. This schema deliberately stores no payment card data.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  blend text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  image_path text not null,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (position('@' in email) > 1),
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null check (position('@' in email) > 1),
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.demo_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  email text not null check (position('@' in email) > 1),
  delivery_note text,
  items jsonb not null,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  status text not null default 'demo-confirmed',
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.demo_orders enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products" on public.products for select using (true);

insert into public.products (slug, name, blend, description, price, image_path, featured) values
  ('cappuccino', 'Cappuccino', 'Coffee 50% | Milk 50%', 'A softly foamed cappuccino with a balanced roast and a comforting milk finish.', 8.50, '/assets/figma/I105-9941;105-8158.webp', true),
  ('chai-latte', 'Chai Latte', 'Coffee 50% | Milk 50%', 'A spiced, creamy chai latte made for a slow morning and a generous pause.', 8.50, '/assets/figma/I105-9952;105-8158.webp', true),
  ('macchiato', 'Macchiato', 'Coffee 50% | Milk 50%', 'A short, expressive macchiato with a little milk and a lot of character.', 8.50, '/assets/figma/I105-9963;105-8158.webp', true),
  ('expresso', 'Expresso', 'Coffee 50% | Milk 50%', 'A bright, concise espresso-style cup with a deeply roasted aroma.', 8.50, '/assets/figma/I105-9974;105-8158.webp', true)
on conflict (slug) do nothing;
