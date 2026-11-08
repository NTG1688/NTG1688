"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, MapPin, Wallet, User } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
    { label: "Đơn hàng", href: "/orders", icon: ShoppingCart },
    { label: "Tra cứu", href: "/tracking", icon: MapPin },
    { label: "Ví tiền", href: "/wallet", icon: Wallet },
    { label: "Tài khoản", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 lg:hidden flex items-center justify-around h-16 px-2">
      {links.map((link, idx) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={idx}
            href={link.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-semibold transition-colors ${
              isActive ? "text-brand-600 font-bold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-brand-600" : "text-gray-400"}`} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
