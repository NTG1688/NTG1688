"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  FileCheck2,
  Search,
  ExternalLink
} from "lucide-react";
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge";
import { PushNotificationManager } from "@/components/notifications/PushNotificationManager";
import { VietQRTopupModal } from "@/components/dashboard/VietQRTopupModal";
import { formatVND, formatCNY, formatDate } from "@/lib/utils";
import { Order } from "@/types";

// Dữ liệu mẫu bóc tách từ tài khoản khách hàng thực tế (ahxdhn - NT2820)
const MOCK_ORDERS: Partial<Order>[] = [
  {
    id: "2596",
    order_code: "MD2596",
    status: 0,
    order_type: "order",
    total_cny: 9520,
    total_vnd: 42520111,
    deposit_amount: 0,
    min_deposit_amount: 33098741,
    exchange_rate: 4015,
    created_at: "2026-10-21T04:42:40.000Z",
    shop_name: "TNHH ABC",
    contract_type: "Chính ngạch Ủy Thác",
  },
  {
    id: "2588",
    order_code: "MD2588",
    status: 10,
    order_type: "order",
    total_cny: 2840,
    total_vnd: 12450000,
    deposit_amount: 10000000,
    min_deposit_amount: 8715000,
    exchange_rate: 4015,
    created_at: "2026-10-18T09:15:20.000Z",
    shop_name: "Taobao Flagship Store",
    contract_type: "Chính ngạch",
  },
  {
    id: "2572",
    order_code: "MD2572",
    status: 11,
    order_type: "order",
    total_cny: 5400,
    total_vnd: 23800000,
    deposit_amount: 20000000,
    min_deposit_amount: 16660000,
    exchange_rate: 4015,
    created_at: "2026-10-15T14:30:00.000Z",
    shop_name: "1688 OEM Factory",
    contract_type: "Tiểu ngạch",
  },
  {
    id: "2540",
    order_code: "MD2540",
    status: 14,
    order_type: "order",
    total_cny: 1200,
    total_vnd: 5200000,
    deposit_amount: 5200000,
    min_deposit_amount: 3640000,
    exchange_rate: 4015,
    created_at: "2026-10-10T08:20:00.000Z",
    shop_name: "Guangzhou Shoes",
    contract_type: "Tiểu ngạch",
  },
];

export default function CustomerDashboardPage() {
  const [isTopupOpen, setIsTopupOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Push Notification Banner */}
      <PushNotificationManager />

      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Bảng Điều Khiển Khách Hàng
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Mã Khách Hàng: <span className="font-extrabold text-brand-700 font-mono">NT2820</span> · Cấp bậc: <span className="font-bold text-amber-600">Thân thiết (VIP 1)</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/orders/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đơn Mua Hộ</span>
          </Link>
          <button
            onClick={() => setIsTopupOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Nạp Ví VietQR</span>
          </button>
        </div>
      </div>

      {/* 4 Thống kê chính (Responsive 24-inch grid: 4 cols) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Chờ đặt cọc */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Chờ Đặt Cọc</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">9</div>
          <p className="text-xs text-gray-500 mt-1">Cần cọc: <span className="font-bold text-amber-700">{formatVND(62992599)}</span></p>
        </div>

        {/* Card 2: Đang về Việt Nam */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-blue-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Đang Về VN</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">88</div>
          <p className="text-xs text-gray-500 mt-1">Giá trị lô: <span className="font-bold text-blue-700">{formatVND(12049015)}</span></p>
        </div>

        {/* Card 3: Đã Về Kho VN */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Có Thể Lấy Hàng</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">14</div>
          <p className="text-xs text-gray-500 mt-1">Còn thiếu: <span className="font-bold text-emerald-700">{formatVND(51251730)}</span></p>
        </div>

        {/* Card 4: Tổng Đơn Hàng */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-purple-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Tổng Đơn Hàng</span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">155</div>
          <p className="text-xs text-gray-500 mt-1">Hoàn thành: <span className="font-bold text-purple-700">20 đơn</span></p>
        </div>
      </div>

      {/* Tra cứu nhanh mã vận đơn */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-950 rounded-3xl text-white shadow-lg">
        <div className="max-w-2xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-300 block mb-1">
            Tra Cứu Lộ Trình Tức Thì
          </span>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            Kiểm tra vị trí kiện hàng Trung Quốc & Việt Nam
          </h2>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Nhập mã vận đơn Trung Quốc (VD: 7732918842...)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white/15 transition-all"
              />
              <Search className="w-5 h-5 text-white/50 absolute right-3.5 top-3" />
            </div>
            <button className="px-5 py-3 bg-brand-500 hover:bg-brand-400 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md">
              Tra Cứu
            </button>
          </div>
        </div>
      </div>

      {/* Bảng Đơn Hàng Gần Đây (Data Table tối ưu màn hình lớn) */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-gray-900">Đơn Hàng Gần Đây</h3>
            <p className="text-xs text-gray-400 mt-0.5">Cập nhật realtime từ hệ thống kho vận</p>
          </div>
          <Link
            href="/orders"
            className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
          >
            <span>Xem tất cả (155)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="py-3.5 px-4">Mã Đơn</th>
                <th className="py-3.5 px-4">Loại Đơn / Hợp Đồng</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Tổng Tiền (CNY / VNĐ)</th>
                <th className="py-3.5 px-4">Tiền Cọc / Đã Trả</th>
                <th className="py-3.5 px-4">Ngày Tạo</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-brand-700">
                    <Link href={`/orders/${order.id}`} className="hover:underline">
                      {order.order_code}
                    </Link>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-800 block">{order.contract_type}</span>
                    <span className="text-[10px] text-gray-400">{order.shop_name}</span>
                  </td>
                  <td className="py-4 px-4">
                    <OrderStatusBadge status={order.status as any} />
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-gray-900 block">{formatVND(order.total_vnd)}</span>
                    <span className="text-[10px] text-gray-400">{formatCNY(order.total_cny)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-emerald-700 block">{formatVND(order.deposit_amount)}</span>
                    <span className="text-[10px] text-gray-400">Tối thiểu: {formatVND(order.min_deposit_amount)}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-700 rounded-xl font-bold transition-colors"
                    >
                      <span>Chi tiết</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal VietQR */}
      <VietQRTopupModal
        isOpen={isTopupOpen}
        onClose={() => setIsTopupOpen(false)}
        userCode="NT2820"
      />
    </div>
  );
}
