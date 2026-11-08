-- ==============================================================================
-- FIX RLS RECURSION & ADD PUBLIC READ POLICIES
-- ==============================================================================

-- 1. TẠO HÀM KIỂM TRA QUYỀN STAFF (SECURITY DEFINER ĐỂ TRÁNH RECURSION)
create or replace function public.is_staff(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role != 'customer'
  );
end;
$$ language plpgsql security definer set search_path = public;

-- 2. XÓA CÁC POLICY CŨ GÂY RECURSION
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Customers view own orders" on public.orders;
drop policy if exists "Customers view own packages" on public.packages;
drop policy if exists "Users view own wallet history" on public.wallet_transactions;

-- 3. TẠO LẠI POLICIES AN TOÀN CHO PROFILES
create policy "Users view own profile" on public.profiles
    for select using (auth.uid() = id or public.is_staff(auth.uid()));

-- 4. TẠO LẠI POLICIES CHO ORDERS
create policy "Users view orders" on public.orders
    for select using (auth.uid() = customer_id or public.is_staff(auth.uid()));

create policy "Staff update orders" on public.orders
    for update using (public.is_staff(auth.uid()));

-- 5. TẠO LẠI POLICIES CHO PACKAGES
create policy "Users view packages" on public.packages
    for select using (auth.uid() = customer_id or public.is_staff(auth.uid()));

-- 6. TẠO LẠI POLICIES CHO WALLET
create policy "Users view wallet" on public.wallet_transactions
    for select using (auth.uid() = user_id or public.is_staff(auth.uid()));

-- 7. CHO PHÉP ĐỌC CÔNG KHAI CÁC BẢNG DANH MỤC (WAREHOUSES, LEVELS, TỶ GIÁ)
alter table public.warehouses enable row level security;
drop policy if exists "Public read warehouses" on public.warehouses;
create policy "Public read warehouses" on public.warehouses
    for select using (true);

alter table public.customer_levels enable row level security;
drop policy if exists "Public read customer_levels" on public.customer_levels;
create policy "Public read customer_levels" on public.customer_levels
    for select using (true);

alter table public.system_settings enable row level security;
drop policy if exists "Public read system_settings" on public.system_settings;
create policy "Public read system_settings" on public.system_settings
    for select using (is_public = true or public.is_staff(auth.uid()));
