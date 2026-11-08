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
  ShieldAlert
} from "lucide-react";

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<Props> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();

  const navLinks = [
    {
      group: "NGHIỆP VỤ KHÁCH HÀNG",
      items: [
        { label: "Tổng Quan", href: "/dashboard", icon: LayoutDashboard },
        { label: "Đơn Mua Hộ", href: "/orders", icon: ShoppingCart, badge: "155" },
        { label: "Đơn Ký Gửi", href: "/deposit", icon: Package },
        { label: "Tra Cứu Vận Đơn", href: "/tracking", icon: MapPin },
        { label: "Ví Tiền & Nạp QR", href: "/wallet", icon: Wallet },
        { label: "Tờ Khai Hải Quan", href: "/declarations", icon: FileText, badge: "NKCN" },
      ],
    },
    {
      group: "QUẢN TRỊ & ĐIỀU HÀNH",
      items: [
        { label: "Admin Dashboard", href: "/admin/dashboard", icon: Sliders },
        { label: "Quản Lý Kho Hàng", href: "/admin/warehouses", icon: Truck },
        { label: "Cấu Hình Hệ Thống", href: "/admin/settings", icon: Settings },
      ],
    },
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
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {navLinks.map((group, idx) => (
            <div key={idx}>
              <h5 className="px-3 mb-2 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                {group.group}
              </h5>
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
          ))}
        </div>

        {/* Footer Support Card */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
              Hỗ Trợ Kỹ Thuật & Vận Đơn
            </span>
            <span className="text-xs font-bold text-gray-800 block mt-0.5">Hotline: 098.xxx.xxxx</span>
            <p className="text-[10px] text-gray-400 mt-0.5">8:00 - 22:00 Tất cả các ngày</p>
          </div>
        </div>
      </aside>
    </>
  );
};
