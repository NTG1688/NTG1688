-- ==============================================================================
-- NAM TRUNG LOGISTICS (NTG1688) - DEFAULT SEED DATA
-- ==============================================================================

-- 1. KHO HÀNG MẪU (WAREHOUSES)
insert into public.warehouses (id, code, name, country, address, color) values
    ('a0000000-0000-0000-0000-000000000001', 'KHO-HN', 'Kho Hà Nội', 'VN', 'Hà Nội, Việt Nam', '#9333ea'),
    ('a0000000-0000-0000-0000-000000000002', 'KHO-HCM', 'Kho Hồ Chí Minh', 'VN', 'TP. Hồ Chí Minh, Việt Nam', '#2563eb'),
    ('a0000000-0000-0000-0000-000000000003', 'KHO-BANGTUONG', 'Kho Bằng Tường', 'CN', 'Bằng Tường, Quảng Tây, Trung Quốc', '#f59e0b'),
    ('a0000000-0000-0000-0000-000000000004', 'KHO-QUANGCHAU', 'Kho Quảng Châu', 'CN', 'Quảng Châu, Quảng Đông, Trung Quốc', '#ef4444')
on conflict (code) do nothing;

-- 2. CẤP BẬC KHÁCH HÀNG (CUSTOMER LEVELS)
insert into public.customer_levels (id, vip_name, min_spend, deposit_min_rate, buy_discount_rate, weight_discount_rate) values
    (1, 'Thân thiết', 0, 70, 0.0, 0.0),
    (2, 'VIP 1', 50000000, 60, 5.0, 3.0),
    (3, 'VIP 2', 200000000, 50, 10.0, 5.0),
    (4, 'VIP 3', 500000000, 40, 15.0, 8.0)
on conflict (id) do nothing;

-- 3. CẤU HÌNH HỆ THỐNG ĐỘNG (SYSTEM SETTINGS)
insert into public.system_settings (key, value, description, is_public) values
    (
        'exchange_rate',
        '{"rate": 4015, "min_buy_fee": 50000, "updated_by": "System Auto Sync"}',
        'Tỷ giá Tệ (CNY) sang VNĐ và Phí mua hàng tối thiểu',
        true
    ),
    (
        'bank_info',
        '{
            "bank_name": "VIETINBANK",
            "account_number": "117634318888",
            "account_name": "CONG TY TNHH DICH VU VA THUONG MAI QUOC TE NAM TRUNG",
            "branch": "Hà Nội",
            "bin": "970415"
        }',
        'Thông tin tài khoản nhận chuyển khoản nạp ví',
        true
    ),
    (
        'cloudflare_r2',
        '{
            "endpoint": "https://<account-id>.r2.cloudflarestorage.com",
            "bucket": "namtrung-media",
            "public_domain": "https://media.nhapkhaunamtrung.com",
            "access_key_id": "",
            "secret_access_key": ""
        }',
        'Cấu hình kết nối lưu trữ ảnh & file trên Cloudflare R2',
        false
    ),
    (
        'fee_policy',
        '{
            "fee_buy_tiers": [
                {"min": 0, "max": 2000000, "rate": 3.0},
                {"min": 2000000, "max": 10000000, "rate": 2.5},
                {"min": 10000000, "max": 50000000, "rate": 2.0},
                {"min": 50000000, "max": 999999999, "rate": 1.5}
            ],
            "fee_weight_tiers_hn": [
                {"min_kg": 0, "max_kg": 20, "price_per_kg": 25000},
                {"min_kg": 20, "max_kg": 100, "price_per_kg": 22000},
                {"min_kg": 100, "max_kg": 500, "price_per_kg": 19000},
                {"min_kg": 500, "max_kg": 99999, "price_per_kg": 16000}
            ]
        }',
        'Biểu phí mua hộ và cước cân nặng vận chuyển',
        true
    )
on conflict (key) do update set value = excluded.value;
