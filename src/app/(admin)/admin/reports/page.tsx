"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Package, 
  Users, 
  Calendar, 
  Download,
  Loader2,
  Building,
  ArrowUpRight
} from "lucide-react";
import { formatVND, formatCNY } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function AdminReportsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "thisMonth" | "thisYear">("thisMonth");

  // Số liệu tổng hợp
  const reportData = {
    revenueGoodsVnd: 1245000000,
    feeBuyVnd: 37350000,
    feeShipVnd: 74200000,
    feeUtnkVnd: 28500000,
    grossProfitVnd: 140050000,
    totalWeightKg: 18450,
    totalVolumeCbm: 54.2,
    totalOrdersCount: 284,
    warehouseStats: [
      { name: "Kho Hà Nội (VN)", weightKg: 10240, ordersCount: 162, cbm: 30.1 },
      { name: "Kho TP. Hồ Chí Minh (VN)", weightKg: 8210, ordersCount: 122, cbm: 24.1 },
      { name: "Kho Quảng Châu (CN)", weightKg: 1450, ordersCount: 28, cbm: 4.5 },
      { name: "Kho Bằng Tường (CN)", weightKg: 3820, ordersCount: 65, cbm: 11.2 },
    ],
    dailyTrends: [
      { day: "Thứ 2", orders: 38, revenue: 185000000, weight: 2400 },
      { day: "Thứ 3", orders: 45, revenue: 215000000, weight: 2850 },
      { day: "Thứ 4", orders: 52, revenue: 248000000, weight: 3200 },
      { day: "Thứ 5", orders: 48, revenue: 230000000, weight: 2950 },
      { day: "Thứ 6", orders: 58, revenue: 285000000, weight: 3750 },
      { day: "Thứ 7", orders: 32, revenue: 155000000, weight: 2100 },
      { day: "Chủ Nhật", orders: 24, revenue: 112000000, weight: 1450 },
    ],
  };

  useEffect(() => {
    // Giả lập tải dữ liệu báo cáo
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [timeRange]);

  const handleExportReport = () => {
    const csvContent = [
      "Kho Hàng\tSản Lượng (kg)\tThể Tích (m3)\tSố Đơn Hàng",
      ...reportData.warehouseStats.map((w) => `${w.name}\t${w.weightKg}\t${w.cbm}\t${w.ordersCount}`),
      "",
      `Tổng Doanh Thu Hàng:\t${reportData.revenueGoodsVnd}`,
      `Lợi Nhuận Gộp:\t${reportData.grossProfitVnd}`,
      `Tổng Cân Nặng (kg):\t${reportData.totalWeightKg}`,
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bao-cao-doanh-thu-namtrung-${timeRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
            Phân Tích Kinh Doanh & Vận Hành
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <span>Báo Cáo Doanh Thu & Sản Lượng Kho</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tổng hợp doanh thu tiền hàng, lợi nhuận gộp, cước vận chuyển và sản lượng cân nặng 4 kho
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-xs focus:outline-none"
          >
            <option value="7days">7 Ngày qua</option>
            <option value="30days">30 Ngày qua</option>
            <option value="thisMonth">Tháng này ({new Date().getMonth() + 1}/{new Date().getFullYear()})</option>
            <option value="thisYear">Năm nay ({new Date().getFullYear()})</option>
          </select>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-xs">Đang tổng hợp số liệu báo cáo...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 4 Cards Tài Chính Lớn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Doanh Số Tiền Hàng
              </span>
              <div className="text-2xl font-black text-gray-900 font-mono">
                {formatVND(reportData.revenueGoodsVnd)}
              </div>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> +16.2% so với kỳ trước
              </span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1">
                Lợi Nhuận Gộp Dịch Vụ
              </span>
              <div className="text-2xl font-black text-purple-700 font-mono">
                {formatVND(reportData.grossProfitVnd)}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Gồm phí mua hàng, phí UTNK, chênh cước</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 block mb-1">
                Tổng Sản Lượng Về Kho
              </span>
              <div className="text-2xl font-black text-brand-700 font-mono">
                {(reportData.totalWeightKg / 1000).toFixed(2)} <span className="text-sm font-bold text-gray-400">Tấn</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Thể tích tương đương: {reportData.totalVolumeCbm} m³</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                Số Lượng Đơn Hoàn Thành
              </span>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                {reportData.totalOrdersCount} <span className="text-sm font-bold text-gray-400">đơn</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Tỷ lệ giao đúng hạn: 98.4%</p>
            </div>
          </div>

          {/* Biểu Đồ Doanh Thu & Cân Nặng Hàng Ngày */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900">Biến Động Doanh Số & Cân Nặng Trong Kỳ</h3>

            <div className="grid grid-cols-7 gap-2 pt-4 items-end h-48 border-b border-gray-100 pb-4">
              {reportData.dailyTrends.map((d, idx) => {
                const heightPercent = Math.round((d.revenue / 300000000) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-mono font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.weight} kg
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-purple-700 to-indigo-500 rounded-xl group-hover:from-purple-600 group-hover:to-indigo-400 transition-all shadow-sm"
                    />
                    <span className="text-[11px] font-bold text-gray-600 mt-1">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bảng Chi Tiết Sản Lượng Từng Kho */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">Sản Lượng & Đơn Hàng Theo Từng Tổng Kho</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="py-3.5 px-4">Tên Kho</th>
                    <th className="py-3.5 px-4">Sản Lượng Cân Nặng (kg)</th>
                    <th className="py-3.5 px-4">Thể Tích Tương Đương (m³)</th>
                    <th className="py-3.5 px-4">Số Lượng Đơn Xử Lý</th>
                    <th className="py-3.5 px-4 text-right">Tỷ Trọng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportData.warehouseStats.map((wh, idx) => {
                    const percent = Math.round((wh.weightKg / reportData.totalWeightKg) * 100);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-4 px-4 font-bold text-gray-900 flex items-center gap-2">
                          <Building className="w-4 h-4 text-purple-600" />
                          <span>{wh.name}</span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-brand-700 text-sm">
                          {wh.weightKg.toLocaleString()} kg
                        </td>
                        <td className="py-4 px-4 font-mono text-gray-700">{wh.cbm} m³</td>
                        <td className="py-4 px-4 font-bold text-gray-900">{wh.ordersCount} đơn</td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-mono font-black text-purple-700">{percent}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
