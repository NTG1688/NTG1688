"use client";

import React from "react";
import Link from "next/link";
import { 
  DollarSign, 
  Package, 
  Truck, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  AlertCircle,
  FileText,
  Boxes,
  MapPin,
  Settings
} from "lucide-react";
import { formatVND, formatCNY } from "@/lib/utils";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-0.5">
            Bảng Điều Hành Trung Tâm
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Tổng Quan Hoạt Động Doanh Nghiệp
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Dữ liệu thời gian thực giữa 4 tổng kho (Quảng Châu, Bằng Tường, Hà Nội, TP.HCM)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/settings"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            <span>Cấu Hình R2 & Tỷ Giá</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards (Spacious on 24" monitors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu tháng */}
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Doanh Số Tháng</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 font-mono">
            {formatVND(1425800000)}
          </div>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% so với tháng trước
          </span>
        </div>

        {/* Cân Nặng Vận Chuyển */}
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Khối Lượng Về Kho</span>
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 font-mono">
            18.4 <span className="text-sm font-bold text-gray-500">Tấn</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Thể tích tương đương: 54.2 m³</p>
        </div>

        {/* Đơn hàng cần xử lý */}
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Đơn Cần Mua Hôm Nay</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            24 <span className="text-sm font-bold text-gray-400">đơn</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Tổng giá trị: {formatCNY(45800)}</p>
        </div>

        {/* Khách hàng hoạt động */}
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Tổng Khách Hàng</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 font-mono">
            17,314
          </div>
          <p className="text-xs text-gray-400 mt-1">+142 khách hàng mới tuần này</p>
        </div>
      </div>

      {/* Kho Hàng Phân Bổ (Warehouse Matrix) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
        <h3 className="font-bold text-base text-gray-900 mb-4">Hiện Trạng Các Tổng Kho</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-gray-800">Kho Quảng Châu (CN)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-lg font-black text-brand-700 font-mono">1,420 kg</div>
            <p className="text-[11px] text-gray-400 mt-0.5">8 Bao hàng chuẩn bị niêm phong</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-gray-800">Kho Bằng Tường (CN)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-lg font-black text-brand-700 font-mono">3,850 kg</div>
            <p className="text-[11px] text-gray-400 mt-0.5">Chuyến xe đang làm thủ tục qua cửa khẩu</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-purple-800">Kho Hà Nội (VN)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-lg font-black text-purple-700 font-mono">6,240 kg</div>
            <p className="text-[11px] text-gray-400 mt-0.5">142 đơn sẵn sàng giao khách</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-blue-800">Kho TP. Hồ Chí Minh (VN)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-lg font-black text-blue-700 font-mono">4,120 kg</div>
            <p className="text-[11px] text-gray-400 mt-0.5">98 đơn đang vận chuyển nội thành</p>
          </div>
        </div>
      </div>
    </div>
  );
}
