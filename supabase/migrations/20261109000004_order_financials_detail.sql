-- ==============================================================================
-- NAM TRUNG LOGISTICS (NTG1688) - MIGRATION: ORDER FINANCIALS & SETUP DETAILS
-- Added: Detailed cost vs customer pricing, purchaser/sales assignment, 
-- multiple tracking codes, order hashtags, profit margin calculations
-- ==============================================================================

-- 1. BỔ SUNG CÁC CỘT TÀI CHÍNH & THIẾT LẬP VÀO BẢNG ORDERS
alter table public.orders 
    add column if not exists real_exchange_rate decimal(10,2) default 3955.00,
    add column if not exists total_cost_cny decimal(12,2) default 0.00,
    add column if not exists total_cost_vnd decimal(15,2) default 0.00,
    add column if not exists gross_profit_vnd decimal(15,2) default 0.00,
    add column if not exists profit_rate_percent decimal(5,2) default 0.00,
    add column if not exists real_ship_cn_cny decimal(10,2) default 0.00,
    add column if not exists real_ship_cn_vnd decimal(12,2) default 0.00,
    add column if not exists real_weight_fee_vnd decimal(12,2) default 0.00,
    add column if not exists purchaser_id uuid references public.profiles(id),
    add column if not exists sales_id uuid references public.profiles(id),
    add column if not exists cskh_id uuid references public.profiles(id),
    add column if not exists china_order_id text,
    add column if not exists alipay_transaction_id text,
    add column if not exists bargain_discount_cny decimal(10,2) default 0.00,
    add column if not exists total_weight_kg decimal(10,2) default 0.00,
    add column if not exists total_cbm decimal(10,3) default 0.00,
    add column if not exists chargeable_weight_kg decimal(10,2) default 0.00,
    add column if not exists hashtags text[] default array[]::text[],
    add column if not exists paid_amount_vnd decimal(15,2) default 0.00,
    add column if not exists is_second_payment_confirmed boolean default false,
    add column if not exists second_payment_amount decimal(15,2) default 0.00;

-- 2. BẢNG QUẢN LÝ MÃ VẬN ĐƠN CON THEO ĐƠN HÀNG (ORDER TRACKING CODES)
create table if not exists public.order_tracking_codes (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    tracking_code text not null,
    carrier_name text default 'Chuyển phát nhanh Trung Quốc',
    weight_kg decimal(10,2) default 0.00,
    cbm decimal(10,3) default 0.00,
    dimensions text default '0x0x0', -- DxRxC cm
    status varchar(50) default 'shop_dispatched', 
    -- 'shop_dispatched', 'cn_received', 'cn_exported', 'vn_received', 'vn_exported', 'delivered'
    package_code text, -- Mã bao hàng gom (VD: xachtay1708)
    vehicle_code text, -- Mã xe vận tải
    china_received_at timestamptz,
    china_exported_at timestamptz,
    vn_received_at timestamptz,
    vn_exported_at timestamptz,
    note text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. BẢNG CHI TIẾT TÀI CHÍNH & ĐỐI SOÁT GIÁ VỐN VS GIÁ THU KHÁCH
create table if not exists public.order_financial_details (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade unique not null,
    
    -- Tỷ giá
    exchange_rate_selling decimal(10,2) default 4015.00 not null,
    exchange_rate_cost decimal(10,2) default 3955.00 not null,
    
    -- Tiền hàng
    price_web_cny decimal(12,2) default 0.00 not null,
    price_real_cny decimal(12,2) default 0.00 not null,
    profit_bargain_cny decimal(12,2) default 0.00,
    
    -- Phí ship nội địa TQ
    ship_cn_selling_cny decimal(10,2) default 0.00,
    ship_cn_cost_cny decimal(10,2) default 0.00,
    profit_shipping_cn_vnd decimal(15,2) default 0.00,
    
    -- Cước vận chuyển quốc tế
    weight_kg_selling decimal(10,2) default 0.00,
    weight_price_per_kg_selling decimal(12,2) default 28000.00,
    weight_cost_per_kg decimal(12,2) default 21000.00,
    profit_international_shipping_vnd decimal(15,2) default 0.00,
    
    -- Các khoản phí dịch vụ thu khách
    buying_fee_selling_vnd decimal(12,2) default 0.00,
    check_fee_selling_vnd decimal(12,2) default 0.00,
    wood_fee_selling_vnd decimal(12,2) default 0.00,
    insurance_fee_selling_vnd decimal(12,2) default 0.00,
    utnk_fee_selling_vnd decimal(12,2) default 0.00,
    customs_tax_selling_vnd decimal(15,2) default 0.00,
    additional_fee_selling_vnd decimal(12,2) default 0.00,
    
    -- Các khoản chi phí vốn dịch vụ
    wood_fee_cost_vnd decimal(12,2) default 0.00,
    check_fee_cost_vnd decimal(12,2) default 0.00,
    customs_tax_cost_vnd decimal(15,2) default 0.00,
    
    -- Tổng hợp tài chính
    total_revenue_vnd decimal(15,2) default 0.00 not null,
    total_cost_vnd decimal(15,2) default 0.00 not null,
    gross_profit_vnd decimal(15,2) default 0.00 not null,
    profit_rate_percent decimal(5,2) default 0.00,
    profit_exchange_rate_vnd decimal(15,2) default 0.00,
    
    -- Dòng tiền
    deposit_amount_vnd decimal(15,2) default 0.00,
    second_payment_amount_vnd decimal(15,2) default 0.00,
    total_paid_vnd decimal(15,2) default 0.00,
    remaining_balance_vnd decimal(15,2) default 0.00,
    
    updated_at timestamptz default now()
);

-- RLS
alter table public.order_tracking_codes enable row level security;
alter table public.order_financial_details enable row level security;

-- POLICIES
create policy "Allow all users to view order tracking codes" on public.order_tracking_codes
    for select using (true);
create policy "Allow staff to manage order tracking codes" on public.order_tracking_codes
    for all using (true);

create policy "Allow all users to view order financials" on public.order_financial_details
    for select using (true);
create policy "Allow staff to manage order financials" on public.order_financial_details
    for all using (true);
