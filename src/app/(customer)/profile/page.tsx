"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { formatVND } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  Wallet,
  Shield,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Settings,
  ShoppingCart,
  Package,
  FileText,
  Bell,
  MapPin,
  Loader2,
  Save,
  Check,
  Lock
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [editData, setEditData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editData.full_name,
          phone: editData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        setSavedMsg("Lỗi: " + error.message);
      } else {
        setSavedMsg("Đã lưu thông tin thành công!");
        await refreshProfile();
        setIsEditing(false);
      }
      setTimeout(() => setSavedMsg(null), 3000);
    } catch (err: any) {
      setSavedMsg("Lỗi lưu: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-4">
        <User className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">Bạn chưa đăng nhập</h2>
        <p className="text-xs text-gray-400">Đăng nhập để quản lý tài khoản và đơn hàng của bạn.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-md hover:bg-brand-700 transition-all"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const menuLinks = [
    { label: "Đơn Mua Hộ", href: "/orders", icon: ShoppingCart, desc: "Xem & quản lý đơn hàng" },
    { label: "Đơn Ký Gửi", href: "/deposit", icon: Package, desc: "Quản lý kiện hàng ký gửi" },
    { label: "Ví Tiền & Nạp VietQR", href: "/wallet", icon: Wallet, desc: "Số dư, lịch sử giao dịch" },
    { label: "Tra Cứu Vận Đơn", href: "/tracking", icon: MapPin, desc: "Kiểm tra lộ trình kiện hàng" },
    { label: "Tờ Khai Hải Quan (NKCN)", href: "/declarations", icon: FileText, desc: "Chứng từ nhập khẩu chính ngạch" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-brand-800 via-brand-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-2xl font-black backdrop-blur-sm">
            {(profile?.user_code || "NT").slice(0, 2)}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{profile?.full_name || "Khách hàng"}</h2>
            <p className="text-xs text-brand-200 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-mono font-bold">{profile?.user_code || "NT2820"}</span>
              <span>·</span>
              <span className="uppercase text-[10px] font-bold">{profile?.role || "customer"}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <span className="text-[10px] font-bold text-brand-200 uppercase block">Số dư ví</span>
            <span className="font-mono font-black text-lg">{formatVND(profile?.wallet_balance ?? 0)}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <span className="text-[10px] font-bold text-brand-200 uppercase block">Email</span>
            <span className="text-xs font-medium truncate block">{profile?.email || user.email}</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Section */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">Thông Tin Cá Nhân</h3>
          {!isEditing ? (
            <button
              onClick={() => {
                setEditData({
                  full_name: profile?.full_name || "",
                  phone: profile?.phone || "",
                });
                setIsEditing(true);
              }}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
            >
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                <span>Lưu</span>
              </button>
            </div>
          )}
        </div>

        {savedMsg && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{savedMsg}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <User className="w-4 h-4 text-gray-400" />
            {isEditing ? (
              <input
                type="text"
                value={editData.full_name}
                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                className="flex-1 text-xs font-bold text-gray-900 bg-transparent focus:outline-none"
              />
            ) : (
              <span className="text-xs font-bold text-gray-900">{profile?.full_name || "—"}</span>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Phone className="w-4 h-4 text-gray-400" />
            {isEditing ? (
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="flex-1 text-xs font-bold text-gray-900 bg-transparent focus:outline-none"
              />
            ) : (
              <span className="text-xs font-bold text-gray-900">{profile?.phone || "—"}</span>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">{profile?.email || user.email}</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation (for mobile) */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-sm text-gray-900">Truy Cập Nhanh</h3>
        </div>
        {menuLinks.map((link, idx) => (
          <Link
            key={idx}
            href={link.href}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <link.icon className="w-4 h-4 text-brand-600" />
              <div>
                <span className="text-xs font-bold text-gray-900 block">{link.label}</span>
                <span className="text-[10px] text-gray-400">{link.desc}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        ))}
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-2xl hover:bg-rose-100 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Đăng Xuất Tài Khoản</span>
      </button>
    </div>
  );
}
