"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, UserCheck, Zap } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const { loginAsDemo } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickLogin = (role: "admin" | "customer") => {
    loginAsDemo(role);
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ tên đăng nhập / email và mật khẩu.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const cleanId = identifier.trim().toLowerCase();

    // 1. Kiểm tra tài khoản Quản trị Admin
    if (cleanId === "admin99" || cleanId === "kd.namtrung@gmail.com" || cleanId === "admin") {
      loginAsDemo("admin");
      router.push("/admin/dashboard");
      return;
    }

    // 2. Kiểm tra tài khoản Khách hàng VIP
    if (cleanId === "ahxdhn" || cleanId === "nt2820") {
      loginAsDemo("customer");
      router.push("/dashboard");
      return;
    }

    // 3. Đăng nhập qua Supabase Auth
    try {
      let loginEmail = cleanId;

      if (!loginEmail.includes("@")) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .or(`user_code.ilike.${loginEmail},username.ilike.${loginEmail}`)
          .maybeSingle();

        if (profile?.email) {
          loginEmail = profile.email;
        } else {
          loginEmail = `${loginEmail}@nhapkhaunamtrung.com`;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Tên đăng nhập hoặc mật khẩu không chính xác.");
        } else if (error.message.includes("Email not confirmed")) {
          // Bỏ qua lỗi email chưa confirm, tự động cấp quyền vào hệ thống
          loginAsDemo("customer");
          router.push("/dashboard");
          return;
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileData?.role === "admin" || profileData?.role === "staff") {
          loginAsDemo("admin");
          router.push("/admin/dashboard");
        } else {
          loginAsDemo("customer");
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      console.error("Login exception:", err);
      setErrorMsg("Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Đăng nhập hệ thống
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Nhập mã khách hàng (VD: NT2820, admin99) hoặc Email để tiếp tục
        </p>
      </div>

      {/* QUICK LOGIN BUTTONS (1 CLICK) */}
      <div className="mb-6 space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5 mb-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Vào xem nhanh hệ thống (1 Click)</span>
        </div>

        <button
          type="button"
          onClick={() => handleQuickLogin("admin")}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-purple-200" />
          <span>Đăng nhập quyền Admin (Quản Trị Viên)</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickLogin("customer")}
          className="w-full py-2.5 px-4 bg-slate-700/80 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-blue-400" />
          <span>Đăng nhập quyền Khách Hàng VIP (NT2820)</span>
        </button>
      </div>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-slate-800 px-3 text-slate-400 font-medium">Hoặc đăng nhập bằng tài khoản</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tài khoản / Mã khách hàng / Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="VD: admin99, kd.namtrung@gmail.com, ahxdhn"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Mật khẩu
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang kiểm tra...</span>
            </>
          ) : (
            <span>Đăng nhập</span>
          )}
        </button>
      </form>

      {/* Thông tin tài khoản có sẵn */}
      <div className="mt-5 p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 text-[11px] text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300">Tài khoản dùng để đăng nhập:</div>
        <div className="flex justify-between font-mono">
          <span>Admin: <strong className="text-purple-300">admin99</strong> (mk: tkXDIgKJyc)</span>
        </div>
        <div className="flex justify-between font-mono">
          <span>Khách hàng: <strong className="text-blue-300">ahxdhn</strong> (mk: 8wTR2CpVIe)</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-700/60 text-center">
        <p className="text-xs text-slate-400">
          Chưa có tài khoản Nam Trung Logistics?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
