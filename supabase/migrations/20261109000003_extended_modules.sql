-- ==============================================================================
-- NAM TRUNG LOGISTICS (NTG1688) - MIGRATION: EXTENDED BUSINESS MODULES
-- Added: cart_items, complaints, pay_services, pricing_tiers
-- ==============================================================================

-- 1. BẢNG GIỎ HÀNG (CART ITEMS)
create table if not exists public.cart_items (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    shop_id varchar(100),
    shop_name text default 'Shop Trung Quốc',
    item_title text not null,
    item_image text,
    item_url text not null,
    properties text, -- Màu sắc, kích thước (VD: Đen - Size XL)
    price_cny decimal(10,2) not null,
    quantity int default 1 not null,
    note text,
    is_check boolean default false,
    is_wood boolean default false,
    is_insurance boolean default false,
    selected boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. BẢNG DỊCH VỤ THANH TOÁN HỘ (PAY SERVICES - ALIPAY / WECHAT)
create table if not exists public.pay_services (
    id uuid default uuid_generate_v4() primary key,
    pay_code varchar(50) unique not null, -- VD: NTG-PAY-202611-001
    user_id uuid references public.profiles(id) not null,
    alipay_account varchar(100) not null,
    total_cny decimal(12,2) not null,
    exchange_rate decimal(10,2) not null,
    fee_cny decimal(10,2) default 0.00,
    total_vnd decimal(15,2) not null,
    qr_image_url text,
    note text,
    status varchar(30) default 'pending', -- 'pending' (chờ thanh toán), 'processing' (đang xử lý), 'completed' (đã TT), 'cancelled' (đã hủy)
    payment_transaction_id text, -- Mã ủy thác thanh toán TQ
    assigned_staff_id uuid references public.profiles(id),
    created_at timestamptz default now(),
    completed_at timestamptz
);

-- 3. BẢNG KHIẾU NẠI ĐƠN HÀNG (COMPLAINTS)
create table if not exists public.complaints (
    id uuid default uuid_generate_v4() primary key,
    complaint_code varchar(50) unique not null, -- VD: KN-202611-001
    user_id uuid references public.profiles(id) not null,
    order_id uuid references public.orders(id) on delete cascade,
    package_id uuid references public.packages(id) on delete set null,
    type varchar(50) not null, -- 'broken' (vỡ hỏng), 'wrong_item' (sai hàng), 'missing' (thiếu số lượng), 'slow' (chậm hàng), 'other'
    title text not null,
    content text not null,
    images jsonb default '[]'::jsonb, -- Danh sách link ảnh/video trên Cloudflare R2
    refund_requested_cny decimal(10,2) default 0.00,
    refund_requested_vnd decimal(15,2) default 0.00,
    refund_approved_vnd decimal(15,2) default 0.00,
    status varchar(30) default 'pending', -- 'pending', 'investigating', 'accepted', 'rejected', 'completed'
    admin_response text,
    handled_by uuid references public.profiles(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4. BẢNG BIỂU PHÍ BẬC THANG (PRICING TIERS)
create table if not exists public.pricing_tiers (
    id uuid default uuid_generate_v4() primary key,
    type varchar(30) not null, -- 'weight' (cân nặng), 'volume' (thể tích), 'buy_fee' (phí mua)
    min_value decimal(10,2) not null, -- Min kg hoặc m3 hoặc VNĐ
    max_value decimal(10,2), -- Max kg hoặc m3 hoặc VNĐ (null nếu không giới hạn)
    price_vnd decimal(15,2) not null, -- Giá tiền VND áp dụng
    destination_warehouse varchar(50), -- 'KHO-HN', 'KHO-HCM', etc.
    note text,
    created_at timestamptz default now()
);

-- BẬT RLS CHO CÁC BẢNG MỚI
alter table public.cart_items enable row level security;
alter table public.pay_services enable row level security;
alter table public.complaints enable row level security;
alter table public.pricing_tiers enable row level security;

-- POLICIES CHO CART
create policy "Users view own cart" on public.cart_items
    for select using (auth.uid() = user_id);
create policy "Users manage own cart" on public.cart_items
    for all using (auth.uid() = user_id);

-- POLICIES CHO PAY SERVICES
create policy "Users view own pay_services" on public.pay_services
    for select using (auth.uid() = user_id or exists (
        select 1 from public.profiles where id = auth.uid() and role != 'customer'
    ));
create policy "Users insert pay_services" on public.pay_services
    for insert with check (auth.uid() = user_id);

-- POLICIES CHO COMPLAINTS
create policy "Users view own complaints" on public.complaints
    for select using (auth.uid() = user_id or exists (
        select 1 from public.profiles where id = auth.uid() and role != 'customer'
    ));
create policy "Users insert complaints" on public.complaints
    for insert with check (auth.uid() = user_id);

-- POLICIES CHO PRICING TIERS
create policy "Public read pricing" on public.pricing_tiers
    for select using (true);
create policy "Admin manage pricing" on public.pricing_tiers
    for all using (exists (
        select 1 from public.profiles where id = auth.uid() and role in ('admin', 'staff')
    ));

-- CẤP QUYỀN
grant usage on schema public to anon, authenticated;
grant all on public.cart_items to anon, authenticated;
grant all on public.pay_services to anon, authenticated;
grant all on public.complaints to anon, authenticated;
grant select on public.pricing_tiers to anon, authenticated;
