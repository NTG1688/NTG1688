"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QuickCurrencyCalc } from "@/components/dashboard/QuickCurrencyCalc";
import { VietQRTopupModal } from "@/components/dashboard/VietQRTopupModal";
import { formatVND } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { 
  Bell, 
  Wallet, 
  PlusCircle, 
  Search, 
  Menu, 
  User, 
  ShieldCheck,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  Settings,
  LayoutDashboard
} from "lucide-react";

interface Props {
  userCode?: string;
  walletBalance?: number;
  userName?: string;
  role?: string;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<Props> = ({
  userCode: propUserCode,
  walletBalance: propWalletBalance,
  userName: propUserName,
  role: propRole,
  onToggleSidebar,
}) => {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Lấy dữ liệu thực từ Auth Context nếu có, nếu chưa thì dùng props dự phòng
  const activeUserCode = profile?.user_code || propUserCode || "NT2820";
  const activeBalance = profile?.wallet_balance ?? propWalletBalance ?? 0;
  const activeUserName = profile?.full_name || propUserName || "Khách hàng";
  const activeRole = profile?.role || propRole || "customer";

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    router.push("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/95 backdrop-blur-md border-b border-gray-200">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-brand-500/20">
              NT
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base tracking-tight text-gray-900 block leading-tight">
                NAM TRUNG <span className="text-brand-600">LOGISTICS</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                Hệ Thống Đặt Hàng & NKCN
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Tìm mã vận đơn, mã đơn hàng (VD: MD2596)..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Right: Quick Currency + Wallet + Topup + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tỷ giá Tệ nhanh */}
          <QuickCurrencyCalc defaultRate={4015} />

          {/* Ví Tiền & Nạp QR */}
          {user ? (
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 pl-2.5 gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <Wallet className="w-3.5 h-3.5 text-brand-600" />
                <span className="hidden xl:inline text-gray-500 font-medium">Ví:</span>
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  {formatVND(activeBalance)}
                </span>
              </div>
              <button
                onClick={() => setIsTopupOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nạp QR</span>
              </button>
            </div>
          ) : null}

          {/* Thông Báo */}
          {user && (
            <Link
              href="/notifications"
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            </Link>
          )}

          {/* User Profile Badge or Login/Register Links */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 border-l border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs">
                  {activeUserCode.slice(0, 2)}
                </div>
                <div className="hidden lg:block text-left">
                  <span className="font-bold text-xs text-gray-800 block leading-tight">
                    {activeUserName}
                  </span>
                  <span className="text-[10px] font-semibold text-brand-600 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> {activeUserCode}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2.5 border-b border-gray-100">
                    <div className="font-bold text-gray-900">{activeUserName}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{profile?.email || user.email}</div>
                    <div className="inline-block mt-1 px-1.5 py-0.5 bg-blue-50 text-brand-600 rounded text-[10px] font-semibold uppercase">
                      Mã KH: {activeUserCode}
                    </div>
                  </div>

                  {activeRole === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      <span>Trang Quản trị Admin</span>
                    </Link>
                  )}

                  <Link
                    href="/wallet"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>Lịch sử ví & Nạp tiền</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer border-t border-gray-100 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất tài khoản</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng ký</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Modal Nạp QR */}
      <VietQRTopupModal
        isOpen={isTopupOpen}
        onClose={() => setIsTopupOpen(false)}
        userCode={activeUserCode}
      />
    </>
  );
};
