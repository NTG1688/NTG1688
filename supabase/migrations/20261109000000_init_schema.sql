-- ==============================================================================
-- NAM TRUNG LOGISTICS (NTG1688) - SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. ENUMS & DOMAINS
do $$ begin
    create type user_role as enum (
        'customer',
        'sale',
        'purchaser',
        'warehouse_cn',
        'warehouse_vn',
        'accountant',
        'admin'
    );
exception
    when duplicate_object then null;
end $$;

-- 3. BẢNG CẤU HÌNH HỆ THỐNG ĐỘNG (SYSTEM_SETTINGS)
-- Toàn bộ kết nối Cloudflare R2, Tỷ giá, Webhook, Ngân hàng lưu tại đây
create table if not exists public.system_settings (
    key varchar(100) primary key,
    value jsonb not null,
    description text,
    is_public boolean default false,
    updated_at timestamptz default now()
);

-- 4. BẢNG KHO HÀNG (WAREHOUSES)
create table if not exists public.warehouses (
    id uuid default uuid_generate_v4() primary key,
    code varchar(20) unique not null,
    name text not null,
    country varchar(10) not null, -- 'CN' hoặc 'VN'
    address text,
    color varchar(20) default '#2563eb',
    is_active boolean default true,
    created_at timestamptz default now()
);

-- 5. BẢNG CẤP BẬC KHÁCH HÀNG (CUSTOMER_LEVELS)
create table if not exists public.customer_levels (
    id serial primary key,
    vip_name text not null, -- 'Thân thiết', 'VIP 1', 'VIP 2', ...
    min_spend decimal(15,2) default 0.00,
    deposit_min_rate int default 70, -- % cọc tối thiểu (50%, 70%)
    buy_discount_rate decimal(5,2) default 0.00, -- % giảm giá phí mua
    weight_discount_rate decimal(5,2) default 0.00, -- % giảm giá phí cân nặng
    created_at timestamptz default now()
);

-- 6. BẢNG HỒ SƠ NGƯỜI DÙNG (PROFILES) - GẮN VỚI AUTH.USERS
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    user_code varchar(20) unique not null, -- VD: NT2820
    username varchar(50) unique not null,
    full_name text not null,
    phone varchar(20),
    email text,
    role user_role default 'customer' not null,
    level_id int references public.customer_levels(id) default 1,
    wallet_balance decimal(15,2) default 0.00 not null,
    default_warehouse_id uuid references public.warehouses(id),
    avatar_url text,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 7. BẢNG ĐƠN HÀNG (ORDERS)
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    order_code varchar(30) unique not null, -- NTG-ORD-202611-XXXX
    customer_id uuid references public.profiles(id) not null,
    sale_id uuid references public.profiles(id),
    buyer_id uuid references public.profiles(id),
    status int default 0 not null,
    -- 0: Chưa cọc, 1: Đã cọc, 2: Chờ mua, 3: Đang mua, 6: Đã mua, 7: Shop giao, 9: Kho TQ nhận, 10: Vận chuyển VN, 11: Kho VN nhận, 12: Chờ giao, 13: Đang giao, 14: Hoàn thành, 16: Hủy
    order_type varchar(30) default 'order' not null, -- 'order' (mua hộ), 'deposit' (ký gửi), 'chinh_ngach'
    
    -- Tỷ giá & Tiền tệ
    exchange_rate decimal(10,2) not null,
    total_cny decimal(12,2) default 0.00 not null,
    total_vnd decimal(15,2) default 0.00 not null,
    deposit_amount decimal(15,2) default 0.00 not null,
    min_deposit_amount decimal(15,2) default 0.00 not null,
    remaining_amount decimal(15,2) default 0.00 not null,
    
    -- Chi tiết biểu phí
    fee_buy decimal(12,2) default 0.00,
    fee_ship_cn_cny decimal(10,2) default 0.00,
    fee_ship_cn_vnd decimal(12,2) default 0.00,
    fee_weight decimal(12,2) default 0.00,
    fee_volume decimal(12,2) default 0.00,
    fee_check decimal(12,2) default 0.00,
    fee_wood decimal(12,2) default 0.00,
    fee_insurance decimal(12,2) default 0.00,
    fee_surcharge decimal(12,2) default 0.00,
    
    -- Thuế & Nhập khẩu chính ngạch (NKCN)
    contract_type text,
    tax_vat_rate decimal(5,2) default 0.00,
    tax_vat_amount decimal(15,2) default 0.00,
    tax_nk_rate decimal(5,2) default 0.00,
    tax_nk_amount decimal(15,2) default 0.00,
    fee_utnk decimal(15,2) default 0.00,
    tax_hdtq_amount decimal(15,2) default 0.00,
    
    shop_name text,
    shop_id text,
    site text, -- 'taobao', '1688', 'tmall'
    receive_warehouse_id uuid references public.warehouses(id),
    customer_note text,
    internal_note text,
    
    -- Mốc thời gian
    created_at timestamptz default now(),
    deposited_at timestamptz,
    bought_at timestamptz,
    shop_delivered_at timestamptz,
    cn_imported_at timestamptz,
    cn_exported_at timestamptz,
    vn_imported_at timestamptz,
    completed_at timestamptz
);

-- 8. SẢN PHẨM TRONG ĐƠN (ORDER_ITEMS)
create table if not exists public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    title text not null,
    image_url text,
    product_link text not null,
    properties text, -- Phân loại (Màu, Size)
    quantity int default 1 not null,
    price_cny decimal(10,2) not null,
    total_cny decimal(12,2) not null,
    customer_note text,
    status int default 1
);

-- 9. BAO HÀNG LỚN (BIG_PACKAGES)
create table if not exists public.big_packages (
    id uuid default uuid_generate_v4() primary key,
    package_code varchar(50) unique not null,
    destination_warehouse_id uuid references public.warehouses(id),
    weight_kg decimal(8,2) default 0.00,
    volume_cbm decimal(8,4) default 0.00,
    status int default 1, -- 1: Đóng bao TQ, 2: Trên đường về, 3: Đã tới kho VN, 4: Đã dỡ bao
    sealed_at timestamptz default now(),
    received_vn_at timestamptz
);

-- 10. KIỆN HÀNG & MÃ VẬN ĐƠN (PACKAGES)
create table if not exists public.packages (
    id uuid default uuid_generate_v4() primary key,
    tracking_code varchar(100) not null, -- Mã vận đơn TQ
    order_id uuid references public.orders(id) on delete set null,
    big_package_id uuid references public.big_packages(id) on delete set null,
    customer_id uuid references public.profiles(id) not null,
    weight_kg decimal(8,2) default 0.00,
    volume_cbm decimal(8,4) default 0.00,
    length_cm decimal(8,2),
    width_cm decimal(8,2),
    height_cm decimal(8,2),
    status int default 1, -- 1: Kho TQ nhận, 2: Kho TQ xuất, 3: Kho VN nhận, 4: Đã giao
    cn_received_at timestamptz,
    vn_received_at timestamptz,
    created_at timestamptz default now()
);

-- 11. TỜ KHAI HẢI QUAN CHÍNH NGẠCH (DECLARATIONS)
create table if not exists public.declarations (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    declaration_code varchar(50) not null, -- Mã khai báo
    hs_code varchar(30),
    product_description text not null,
    consignee text,
    image_url text, -- Lưu trên Cloudflare R2
    unit varchar(20) default 'PCE',
    quantity int not null,
    min_customs_price decimal(12,2) default 0.00,
    tax_nk_rate decimal(5,2) default 0.00,
    tax_vat_rate decimal(5,2) default 8.00,
    special_tax_rate decimal(5,2) default 0.00,
    import_policy text,
    specialized_fee decimal(15,2) default 0.00,
    status int default 1,
    created_at timestamptz default now()
);

-- 12. VÍ ĐIỆN TỬ & LỊCH SỬ GIAO DỊCH (WALLET_TRANSACTIONS)
create table if not exists public.wallet_transactions (
    id uuid default uuid_generate_v4() primary key,
    transaction_code varchar(50) unique not null,
    user_id uuid references public.profiles(id) not null,
    amount decimal(15,2) not null, -- Số dương: Nạp tiền / Hoàn cọc; Số âm: Thanh toán đơn
    balance_after decimal(15,2) not null,
    type varchar(30) not null, -- 'deposit', 'withdrawal', 'order_payment', 'refund'
    order_id uuid references public.orders(id) on delete set null,
    note text,
    created_at timestamptz default now()
);

-- 13. LOG NẠP TIỀN TỰ ĐỘNG (AUTO_TOPUP_LOGS)
create table if not exists public.auto_topup_logs (
    id uuid default uuid_generate_v4() primary key,
    bank_brand varchar(50) not null, -- 'VietinBank', 'MBBank', ...
    account_number varchar(50) not null,
    transaction_date timestamptz not null,
    amount decimal(15,2) not null,
    content text not null, -- Nội dung chuyển khoản (chứa NT2820)
    customer_id uuid references public.profiles(id),
    status varchar(20) default 'pending', -- 'success', 'pending', 'cancelled'
    raw_payload jsonb,
    created_at timestamptz default now()
);

-- 14. PHIẾU XUẤT KHO GIAO HÀNG (EXPORT_RECEIPTS)
create table if not exists public.export_receipts (
    id uuid default uuid_generate_v4() primary key,
    receipt_code varchar(50) unique not null,
    customer_id uuid references public.profiles(id) not null,
    receiver_name text not null,
    receiver_phone varchar(20) not null,
    shipping_address text not null,
    shipping_method text default 'Tự đến lấy',
    total_packages int default 0,
    total_weight decimal(8,2) default 0.00,
    total_amount decimal(15,2) default 0.00,
    status varchar(20) default 'draft', -- 'draft', 'paid', 'delivering', 'completed'
    created_at timestamptz default now()
);

-- 15. THÔNG BÁO REALTIME (NOTIFICATIONS)
create table if not exists public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) not null,
    title text not null,
    message text not null,
    link text,
    type varchar(30) default 'info',
    is_read boolean default false,
    created_at timestamptz default now()
);

-- ==============================================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ==============================================================================
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_packages_tracking on public.packages(tracking_code);
create index if not exists idx_packages_order on public.packages(order_id);
create index if not exists idx_wallet_user on public.wallet_transactions(user_id);
create index if not exists idx_declarations_order on public.declarations(order_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.packages enable row level security;
alter table public.declarations enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.notifications enable row level security;

-- Profiles: Người dùng đọc hồ sơ của mình; Admin/Nhân viên đọc tất cả
create policy "Users can view own profile" on public.profiles
    for select using (auth.uid() = id or exists (
        select 1 from public.profiles where id = auth.uid() and role != 'customer'
    ));

create policy "Users can update own profile" on public.profiles
    for update using (auth.uid() = id);

-- Orders: Khách xem đơn của mình; Staff xem đơn toàn hệ thống
create policy "Customers view own orders" on public.orders
    for select using (auth.uid() = customer_id or exists (
        select 1 from public.profiles where id = auth.uid() and role != 'customer'
    ));

create policy "Customers create orders" on public.orders
    for insert with check (auth.uid() = customer_id);

-- Packages: Khách xem kiện hàng của mình
create policy "Customers view own packages" on public.packages
    for select using (auth.uid() = customer_id or exists (
        select 1 from public.profiles where id = auth.uid() and role != 'customer'
    ));

-- Wallet: Khách xem lịch sử ví của mình
create policy "Users view own wallet history" on public.wallet_transactions
    for select using (auth.uid() = user_id or exists (
        select 1 from public.profiles where id = auth.uid() and role in ('admin', 'accountant')
    ));

-- Notifications: Khách xem thông báo của mình
create policy "Users view own notifications" on public.notifications
    for all using (auth.uid() = user_id);
