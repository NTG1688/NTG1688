"use client";

import React, { useState, useEffect } from "react";
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
  ExternalLink,
  Loader2
} from "lucide-react";
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge";
import { PushNotificationManager } from "@/components/notifications/PushNotificationManager";
import { VietQRTopupModal } from "@/components/dashboard/VietQRTopupModal";
import { formatVND, formatCNY, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { OrderStatus } from "@/types";
import { orderStore, OrderRecord } from "@/lib/order-store";

interface DashboardStats {
  pending_deposit: number;
  pending_deposit_amount: number;
  in_transit: number;
  in_transit_amount: number;
  ready_pickup: number;
  ready_pickup_amount: number;
  total_orders: number;
  completed_orders: number;
}

interface RecentOrder {
  id: string;
  order_code: string;
  status: OrderStatus;
  total_cny: number;
  total_vnd: number;
  deposit_amount: number;
  min_deposit_amount: number;
  contract_type: string;
  shop_name: string;
  created_at: string;
}

export default function CustomerDashboardPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trackingSearch, setTrackingSearch] = useState("");

  const [stats, setStats] = useState<DashboardStats>({
    pending_deposit: 0,
    pending_deposit_amount: 0,
    in_transit: 0,
    in_transit_amount: 0,
    ready_pickup: 0,
    ready_pickup_amount: 0,
    total_orders: 0,
    completed_orders: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    function computeStatsFromOrders(orders: OrderRecord[]) {
      const pendingDeposit = orders.filter((o) => o.status === 0);
      const inTransit = orders.filter((o) => [7, 8, 9, 10].includes(o.status));
      const readyPickup = orders.filter((o) => [11, 12].includes(o.status));
      const completed = orders.filter((o) => o.status === 14);

      setStats({
        pending_deposit: pendingDeposit.length,
        pending_deposit_amount: pendingDeposit.reduce((s, o) => s + Number(o.min_deposit_amount || 0), 0),
        in_transit: inTransit.length,
        in_transit_amount: inTransit.reduce((s, o) => s + Number(o.total_vnd || 0), 0),
        ready_pickup: readyPickup.length,
        ready_pickup_amount: readyPickup.reduce((s, o) => s + Math.max(0, Number(o.total_vnd || 0) - Number(o.deposit_amount || o.paid_amount_vnd || 0)), 0),
        total_orders: orders.length,
        completed_orders: completed.length,
      });

      setRecentOrders(
        orders.slice(0, 6).map((o) => ({
          id: o.id,
          order_code: o.order_code,
          status: o.status,
          total_cny: Number(o.total_cny || 0),
          total_vnd: Number(o.total_vnd || 0),
          deposit_amount: Number(o.deposit_amount || o.paid_amount_vnd || 0),
          min_deposit_amount: Number(o.min_deposit_amount || 0),
          contract_type: o.contract_type || "Tiểu ngạch",
          shop_name: o.items?.[0]?.shop_name || "Taobao/1688",
          created_at: o.created_at,
        }))
      );
    }

    // 1. Lấy dữ liệu ngay từ orderStore
    const initialOrders = orderStore.getOrders();
    computeStatsFromOrders(initialOrders);
    setLoading(false);

    // 2. Lắng nghe thay đổi thời gian thực
    const unsubscribe = orderStore.subscribe((updatedOrders) => {
      computeStatsFromOrders(updatedOrders);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const activeUserCode = profile?.user_code || "NT2820";

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
            Mã Khách Hàng: <span className="font-extrabold text-brand-700 font-mono">{activeUserCode}</span> · Cấp bậc: <span className="font-bold text-amber-600">Thân thiết (VIP 1)</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/orders/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đơn Mua Hộ</span>
          </Link>
          <button
            onClick={() => setIsTopupOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Nạp Ví VietQR</span>
          </button>
        </div>
      </div>

      {/* 4 Thống kê chính */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-200 shadow-xs animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-100 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Chờ Đặt Cọc</span>
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">{stats.pending_deposit}</div>
            <p className="text-xs text-gray-500 mt-1">Cần cọc: <span className="font-bold text-amber-700">{formatVND(stats.pending_deposit_amount)}</span></p>
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-blue-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Đang Về VN</span>
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">{stats.in_transit}</div>
            <p className="text-xs text-gray-500 mt-1">Giá trị lô: <span className="font-bold text-blue-700">{formatVND(stats.in_transit_amount)}</span></p>
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Có Thể Lấy Hàng</span>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">{stats.ready_pickup}</div>
            <p className="text-xs text-gray-500 mt-1">Còn thiếu: <span className="font-bold text-emerald-700">{formatVND(stats.ready_pickup_amount)}</span></p>
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-purple-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Tổng Đơn Hàng</span>
              <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">{stats.total_orders}</div>
            <p className="text-xs text-gray-500 mt-1">Hoàn thành: <span className="font-bold text-purple-700">{stats.completed_orders} đơn</span></p>
          </div>
        </div>
      )}

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
                value={trackingSearch}
                onChange={(e) => setTrackingSearch(e.target.value)}
                placeholder="Nhập mã vận đơn Trung Quốc (VD: 7732918842...)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white/15 transition-all"
              />
              <Search className="w-5 h-5 text-white/50 absolute right-3.5 top-3" />
            </div>
            <Link
              href={`/tracking${trackingSearch ? `?q=${encodeURIComponent(trackingSearch)}` : ""}`}
              className="px-5 py-3 bg-brand-500 hover:bg-brand-400 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md cursor-pointer"
            >
              Tra Cứu
            </Link>
          </div>
        </div>
      </div>

      {/* Bảng Đơn Hàng Gần Đây */}
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
            <span>Xem tất cả ({stats.total_orders})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
            <span className="text-xs">Đang tải đơn hàng...</span>
          </div>
        ) : (
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
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-brand-700">
                      <Link href={`/orders/${order.id}`} className="hover:underline">
                        {order.order_code}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-800 block">{order.contract_type}</span>
                      {order.shop_name && <span className="text-[10px] text-gray-400">{order.shop_name}</span>}
                    </td>
                    <td className="py-4 px-4">
                      <OrderStatusBadge status={order.status} />
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
        )}
      </div>

      {/* Modal VietQR */}
      <VietQRTopupModal
        isOpen={isTopupOpen}
        onClose={() => setIsTopupOpen(false)}
        userCode={activeUserCode}
      />
    </div>
  );
}
