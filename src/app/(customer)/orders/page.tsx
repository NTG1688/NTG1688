"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge";
import { formatVND, formatCNY, formatDate } from "@/lib/utils";
import { Search, Filter, ShoppingBag, ArrowRight, Clock, Plus, Loader2, PackageX } from "lucide-react";
import { OrderStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { orderStore } from "@/lib/order-store";

interface OrderItem {
  id: string;
  order_code: string;
  status: OrderStatus;
  total_cny: number;
  total_vnd: number;
  deposit_amount: number;
  min_deposit_amount: number;
  created_at: string;
  shop_name: string;
  item_title: string;
  image: string;
  contract_type: string;
}

const STATUS_TABS: { label: string; status: OrderStatus | "all" }[] = [
  { label: "Tất cả", status: "all" },
  { label: "Chờ đặt cọc", status: 0 },
  { label: "Đã đặt cọc", status: 1 },
  { label: "Chờ mua", status: 2 },
  { label: "Đang mua", status: 3 },
  { label: "Đã mua", status: 6 },
  { label: "Shop phát hàng", status: 7 },
  { label: "Kho TQ nhận", status: 9 },
  { label: "Đang về VN", status: 10 },
  { label: "Kho VN nhận", status: 11 },
  { label: "Chờ giao", status: 12 },
  { label: "Đang giao", status: 13 },
  { label: "Hoàn thành", status: 14 },
  { label: "Đã hủy", status: 16 },
];

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    function loadOrders() {
      setLoading(true);
      const stored = orderStore.getOrders();
      const mapped: OrderItem[] = stored.map((o) => {
        const firstItem = o.items?.[0];
        return {
          id: o.id,
          order_code: o.order_code,
          status: o.status,
          total_cny: o.total_cny,
          total_vnd: o.total_vnd,
          deposit_amount: o.deposit_amount,
          min_deposit_amount: o.min_deposit_amount,
          created_at: o.created_at,
          shop_name: o.shop_name || "Nhà cung cấp 1688 / Taobao",
          item_title: firstItem?.title || "Sản phẩm nhập khẩu chính ngạch",
          image: firstItem?.image_url || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&q=80",
          contract_type: o.contract_type || "Chính ngạch Ủy Thác",
        };
      });
      setOrders(mapped);
      setLoading(false);
    }

    loadOrders();

    window.addEventListener("NTG_ORDERS_UPDATED", loadOrders);
    return () => window.removeEventListener("NTG_ORDERS_UPDATED", loadOrders);
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== "all" && order.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        order.order_code.toLowerCase().includes(q) ||
        order.item_title.toLowerCase().includes(q) ||
        order.shop_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý Đơn Mua Hộ
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Theo dõi tiến độ theo 14 trạng thái, thanh toán đặt cọc và lộ trình hàng về
          </p>
        </div>

        <Link
          href="/orders/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đơn Hàng Mới</span>
        </Link>
      </div>

      {/* Filter Tabs (Horizontal scroll on mobile, wrap on desktop) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200 no-scrollbar">
        {STATUS_TABS.map((tab, idx) => {
          const count = orders.filter(
            (o) => tab.status === "all" || o.status === tab.status
          ).length;

          return (
            <button
              key={idx}
              onClick={() => setSelectedStatus(tab.status)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === tab.status
                  ? "bg-brand-600 text-white shadow-sm font-bold"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedStatus === tab.status
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn (MD2596), tên sản phẩm, tên shop..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Orders Content */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          <span className="text-xs">Đang tải danh sách đơn hàng...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8">
          <PackageX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Không tìm thấy đơn hàng nào</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Không có đơn hàng nào khớp với bộ lọc hoặc tìm kiếm hiện tại của bạn.
          </p>
          <Link
            href="/orders/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo đơn hàng ngay</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-black text-brand-700 text-base">
                    {order.order_code}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-semibold">
                    {order.contract_type}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">· {order.shop_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3.5 flex-1">
                  <img
                    src={order.image}
                    alt={order.item_title}
                    className="w-16 h-16 object-cover rounded-2xl border border-gray-100 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2">
                      {order.item_title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Giá trị: <span className="font-bold text-gray-800">{formatCNY(order.total_cny)}</span> ({formatVND(order.total_vnd)})
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-gray-500 block">Đã thanh toán / Cọc</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {formatVND(order.deposit_amount)}
                    </span>
                    {order.status === 0 && (
                      <span className="text-[11px] text-amber-700 block font-semibold">
                        Cần cọc: {formatVND(order.min_deposit_amount)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 0 && (
                      <Link 
                        href={`/orders/${order.order_code || order.id}`}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer inline-block"
                      >
                        Đặt Cọc Ngay
                      </Link>
                    )}
                    <Link
                      href={`/orders/${order.order_code || order.id}`}
                      className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-brand-600 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
