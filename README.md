# Nam Trung Logistics (NTG1688) - Nền Tảng Quản Lý Đặt Hàng & Hải Quan Chính Ngạch

[![CI & Build](https://github.com/NTG1688/NTG1688/actions/workflows/ci.yml/badge.svg)](https://github.com/NTG1688/NTG1688/actions/workflows/ci.yml)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2_Storage-F38020?style=flat-square&logo=cloudflare)](https://cloudflare.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

Hệ thống quản lý chuỗi cung ứng logistics, đặt hàng Taobao/1688/Tmall, vận chuyển đa phương thức và khai báo hải quan chính ngạch (NKCN) tự chủ 100% của **Công ty TNHH Dịch vụ & Thương mại Quốc tế Nam Trung**.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Cổng Khách Hàng (Customer Web App)
- **Bảng điều khiển trực quan:** Tối ưu hiển thị cho cả màn hình 24-inch và giao diện điện thoại (PWA).
- **Quản lý đơn hàng:** Theo dõi đầy đủ 14 trạng thái vòng đời (Chờ cọc, Đang mua, Shop phát hàng, Kho TQ nhận, Đang về VN, Kho VN nhận, Hoàn thành).
- **Tra cứu lộ trình tức thì:** Kiểm tra vị trí mã vận đơn Trung Quốc, bao hàng lớn (`BigPackage`) và xe vận chuyển theo thời gian thực.
- **Nạp tiền ví tự động (VietQR 24/7):** Quét mã QR tự động điền số tài khoản VietinBank và mã khách hàng (`NTG NT2820`), tiền vào ví sau 3 giây qua Webhook SePay/PayOS.
- **Tờ khai Hải quan chính ngạch (NKCN):** Quản lý mã HS Code, tính thuế VAT, thuế NK, phí ủy thác nhập khẩu và tải file Excel/PDF.
- **Thông báo đa kênh:** Hỗ trợ Web Push Notification trên cả máy tính và điện thoại khi đơn đổi trạng thái.

### 2. Cổng Quản Trị & Kho Vận (Admin & Operations)
- **Bảng điều hành trung tâm:** Giám sát khối lượng hàng hóa (Tấn / m³), doanh số và phân bổ tại 4 tổng kho (Quảng Châu, Bằng Tường, Hà Nội, TP.HCM).
- **Cấu hình hệ thống linh hoạt:** Thay đổi thông số kết nối **Cloudflare R2**, Tỷ giá Tệ (CNY), Tài khoản ngân hàng VietinBank và Webhook trực tiếp từ giao diện Admin mà không cần sửa code.
- **Lưu trữ Cloudflare R2:** Tích hợp S3-compatible client upload ảnh chứng từ, hóa đơn, tờ khai trực tiếp lên R2 không tốn chi phí băng thông.

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

```
NTG1688/
├── .github/workflows/ci.yml       # GitHub Actions CI tự động kiểm tra build
├── src/
│   ├── app/
│   │   ├── (customer)/            # Các phân hệ khách hàng (Dashboard, Đơn hàng, Ví tiền, Tra cứu)
│   │   ├── (admin)/               # Các phân hệ quản trị (Dashboard, Cấu hình linh hoạt)
│   │   └── api/                   # API Webhook SePay và Cloudflare R2 Presigned Upload
│   ├── components/                # UI components (Navbar, Sidebar, BottomNav, VietQR Modal)
│   ├── lib/                       # Cloudflare R2 Client, Supabase Client, VietQR Helper, Utils
│   └── types/                     # TypeScript Interfaces chuẩn hóa
└── supabase/
    ├── migrations/                # Schema PostgreSQL (RLS, Enums, Tables, Triggers)
    └── seed.sql                   # Dữ liệu ban đầu (Tỷ giá 4015, Kho hàng, Cấp bậc VIP)
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Cài đặt phụ thuộc
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env.local` từ mẫu `.env.example`:
```bash
cp .env.example .env.local
```
Điền các thông số:
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` từ dự án Supabase `namtrung-logistics-platform`.
- Thông tin **Cloudflare R2** (Account ID, Access Key, Secret Key).

### 3. Thiết lập Cơ sở dữ liệu Supabase
1. Vào dự án **Supabase** của anh (`namtrung-logistics-platform`).
2. Mở mục **SQL Editor**.
3. Dán và chạy nội dung file `supabase/migrations/20261109000000_init_schema.sql` để tạo toàn bộ bảng và phân quyền RLS.
4. Dán và chạy nội dung file `supabase/seed.sql` để nạp dữ liệu ban đầu (Tỷ giá 4015, kho bãi, VietinBank).

### 4. Khởi chạy môi trường phát triển
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

### 5. Build kiểm tra sản phẩm
```bash
npm run build
```

---

## 🛡️ BẢN QUYỀN
© 2026 Công ty TNHH Dịch vụ & Thương mại Quốc tế Nam Trung. Toàn quyền sở hữu.
