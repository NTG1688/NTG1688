import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingCart, Truck, Zap, Layers, QrCode } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-5 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-black text-xl shadow-lg shadow-brand-500/30">
            NT
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight block">
              NAM TRUNG <span className="text-brand-400">LOGISTICS</span>
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-medium">
              Chuyên Tuyến Nhập Khẩu & Đặt Hàng Trung Quốc
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-brand-600/30 transition-all flex items-center gap-1.5"
          >
            <span>Vào Hệ Thống</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-brand-300 font-semibold mb-6 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Hệ thống phiên bản mới 2026 - Tự chủ 100% trên GitHub & Supabase</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight sm:leading-none">
          Quản Lý Đặt Hàng & <br />
          <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Hải Quan Chính Ngạch
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
          Nền tảng logistics tối ưu hoá quy trình từ đặt hàng Taobao/1688, đóng bao kho Trung Quốc, thông quan ủy thác nhập khẩu đến giao hàng tận tay tại Việt Nam.
        </p>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 w-full">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs text-left">
            <QrCode className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="font-bold text-xs">Nạp Tiền VietQR</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Tự động cộng tiền 24/7 sau 3 giây</p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs text-left">
            <Truck className="w-5 h-5 text-sky-400 mb-2" />
            <h4 className="font-bold text-xs">Kho Vận & BigPackage</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Quản lý đóng bao, lộ trình chuyến xe</p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs text-left">
            <ShieldCheck className="w-5 h-5 text-purple-400 mb-2" />
            <h4 className="font-bold text-xs">Tờ Khai Hải Quan</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Mã HS Code, thuế NK, VAT, ủy thác</p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs text-left">
            <Layers className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="font-bold text-xs">Cloudflare R2</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Lưu trữ ảnh, chứng từ tốc độ cao</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-10 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cổng Khách Hàng</span>
          </Link>

          <Link
            href="/admin/settings"
            className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl border border-white/15 transition-all flex items-center justify-center gap-2"
          >
            <span>Cấu Hình Admin & R2</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 text-center text-xs text-gray-500">
        © 2026 Nam Trung Logistics (NTG1688). Toàn quyền sở hữu và vận hành độc lập.
      </footer>
    </div>
  );
}
