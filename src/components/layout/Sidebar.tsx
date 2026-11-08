"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileText, 
  Wallet, 
  MapPin, 
  Sliders, 
  Settings, 
  HelpCircle,
  Truck,
  ExternalLink,
  ShieldAlert,
  CreditCard,
  AlertTriangle,
  Receipt,
  Boxes,
  Users,
  BarChart3,
  ScanLine
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<Props> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin" || profile?.role === "staff";

  const customerLinks = [
    { label: "Tổng Quan", href: "/dashboard", icon: LayoutDashboard },
    { label: "Giỏ Hàng 1688", href: "/cart", icon: ShoppingCart, badge: "Giỏ" },
    { label: "Đơn Mua Hộ", href: "/orders", icon: Package, badge: "155" },
    { label: "Đơn Ký Gửi", href: "/deposit", icon: Truck },
    { label: "Thanh Toán Hộ", href: "/payservice", icon: CreditCard },
    { label: "Tra Cứu Vận Đơn", href: "/tracking", icon: MapPin },
    { label: "Yêu Cầu Xuất Kho", href: "/receipt", icon: Receipt },
    { label: "Khiếu Nại & Hỗ Trợ", href: "/complain", icon: AlertTriangle },
    { label: "Ví Tiền & Nạp QR", href: "/wallet", icon: Wallet },
    { label: "Tờ Khai Hải Quan", href: "/declarations", icon: FileText, badge: "NKCN" },
  ];

  const adminLinks = [
    { label: "Bảng Điều Hành", href: "/admin/dashboard", icon: Sliders },
    { label: "Duyệt Đơn Toàn HT", href: "/admin/orders", icon: Package },
    { label: "Đóng Bao Lớn (BigPackage)", href: "/admin/big-packages", icon: Boxes },
    { label: "Quản Lý Kho & Quét Mã", href: "/admin/warehouses", icon: ScanLine },
    { label: "Phiếu Xuất Giao Hàng", href: "/admin/export-receipts", icon: Receipt },
    { label: "Quản Lý Khách Hàng", href: "/admin/customers", icon: Users },
    { label: "Xử Lý Khiếu Nại", href: "/admin/complaints", icon: AlertTriangle },
    { label: "Báo Cáo & Thống Kê", href: "/admin/reports", icon: BarChart3 },
    { label: "Cấu Hình R2 & Tỷ Giá", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Customer Group */}
          <div>
            <h5 className="px-3 mb-2 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              NGHIỆP VỤ KHÁCH HÀNG
            </h5>
            <div className="space-y-0.5">
              {customerLinks.map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-xs"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-brand-600" : "text-gray-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          item.badge === "NKCN"
                            ? "bg-purple-100 text-purple-700"
                            : item.badge === "Giỏ"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Admin Group (Luôn hiển thị nếu là admin hoặc trên màn hình điều hành) */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <h5 className="text-[11px] font-bold tracking-wider text-purple-700 uppercase">
                QUẢN TRỊ & ĐIỀU HÀNH
              </h5>
              {isAdmin && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded">
                  ADMIN
                </span>
              )}
            </div>
            <div className="space-y-0.5">
              {adminLinks.map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-purple-50 text-purple-700 font-bold border border-purple-200 shadow-xs"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Support Card */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <div className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-xs text-center">
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
              Nam Trung Logistics
            </span>
            <span className="text-[11px] font-bold text-gray-800 block mt-0.5">Hotline: 098.xxx.xxxx</span>
          </div>
        </div>
      </aside>
    </>
  );
};
