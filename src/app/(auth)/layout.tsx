import React from "react";
import Link from "next/link";
import { Truck, ShieldCheck, Zap, Globe, PackageCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Truck className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black tracking-tight text-white block">
              NTG<span className="text-blue-500">1688</span>
            </span>
            <span className="text-xs text-slate-400 font-medium tracking-wide block uppercase">
              Nam Trung Logistics Platform
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 border border-slate-700/80 shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
          {children}
        </div>

        {/* Value Propositions */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs text-slate-400">
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Chính ngạch 100%</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Nạp tiền tự động 3s</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
            <PackageCheck className="w-4 h-4 text-blue-400" />
            <span>Quản lý 4 kho TQ - VN</span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Nam Trung Logistics. Bảo mật & sở hữu độc quyền 100%.
        </p>
      </div>
    </div>
  );
}
