-- 1. Create a table for products
create table products (
  id bigint primary key generated always as identity,
  name text not null,
  category text not null,
  price numeric not null,
  description text,
  image text,
  vendor_id text,
  vendor_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Set up minimum security to allow anonymous read/write (since admin auth is currently client-side)
alter table products enable row level security;
create policy "Public products are viewable by everyone." on products for select using (true);
create policy "Anon can insert products" on products for insert with check (true);
create policy "Anon can update products" on products for update using (true);
create policy "Anon can delete products" on products for delete using (true);

-- 3. Insert some initial mock data with diverse images
insert into products (name, category, price, description, image, vendor_id, vendor_name)
values 
  ('Jollof Rice & Chicken', 'meals', 4500, 'Fragrant West African jollof rice served with perfectly grilled chicken.', 'https://images.unsplash.com/photo-1564671165093-20688ff1fbfa?w=400&h=300&fit=crop', 'vendor_001', 'FoodieExpress Kitchen'),
  ('Classic Cheeseburger', 'fast-food', 2500, 'Juicy beef patty with melted cheddar, lettuce, tomato, and secret sauce.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', 'vendor_001', 'FoodieExpress Kitchen'),
  ('Mango Smoothie', 'drinks', 1500, 'Fresh mango blended with yogurt, honey, and a splash of orange juice.', 'https://images.unsplash.com/photo-1621269355486-57dfbfbd7eab?w=400&h=300&fit=crop', 'vendor_001', 'FoodieExpress Kitchen'),
  ('Chocolate Lava Cake', 'desserts', 2500, 'Warm chocolate cake with a molten center, served with vanilla ice cream.', 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop', 'vendor_001', 'FoodieExpress Kitchen');

-- 4. Create a storage bucket for images so you can upload from your phone
insert into storage.buckets (id, name, public) values ('images', 'images', true);

-- 5. Enable public access and uploads for the images bucket
create policy "Public Access" on storage.objects for select using ( bucket_id = 'images' );
create policy "Anon Insert" on storage.objects for insert with check ( bucket_id = 'images' );
create policy "Anon Update" on storage.objects for update using ( bucket_id = 'images' );
create policy "Anon Delete" on storage.objects for delete using ( bucket_id = 'images' );
