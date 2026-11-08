"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge";
import { formatVND, formatCNY, formatDate } from "@/lib/utils";
import { Search, Filter, ShoppingBag, ArrowRight, Clock, Plus } from "lucide-react";
import { OrderStatus } from "@/types";

const STATUS_TABS: { label: string; status: OrderStatus | "all"; count: number }[] = [
  { label: "Tất cả", status: "all", count: 155 },
  { label: "Chờ đặt cọc", status: 0, count: 9 },
  { label: "Đã đặt cọc", status: 1, count: 1 },
  { label: "Chờ mua", status: 2, count: 2 },
  { label: "Đã mua", status: 6, count: 20 },
  { label: "Shop phát hàng", status: 7, count: 6 },
  { label: "Kho TQ nhận", status: 9, count: 7 },
  { label: "Đang về VN", status: 10, count: 88 },
  { label: "Kho VN nhận", status: 11, count: 14 },
  { label: "Hoàn thành", status: 14, count: 2 },
  { label: "Đã hủy", status: 16, count: 5 },
];

const MOCK_ALL_ORDERS = [
  {
    id: "2596",
    order_code: "MD2596",
    status: 0 as OrderStatus,
    total_cny: 9520,
    total_vnd: 42520111,
    deposit_amount: 0,
    min_deposit_amount: 33098741,
    created_at: "2026-10-21T04:42:40.000Z",
    shop_name: "TNHH ABC",
    item_title: "Lô hàng linh kiện & thiết bị cơ khí nhập khẩu chính ngạch",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&q=80",
    contract_type: "Chính ngạch Ủy Thác",
  },
  {
    id: "2588",
    order_code: "MD2588",
    status: 10 as OrderStatus,
    total_cny: 2840,
    total_vnd: 12450000,
    deposit_amount: 10000000,
    min_deposit_amount: 8715000,
    created_at: "2026-10-18T09:15:20.000Z",
    shop_name: "Taobao Flagship Store",
    item_title: "Quần áo thời trang thu đông mẫu mới nhất 2026",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&q=80",
    contract_type: "Tiểu ngạch",
  },
  {
    id: "2572",
    order_code: "MD2572",
    status: 11 as OrderStatus,
    total_cny: 5400,
    total_vnd: 23800000,
    deposit_amount: 20000000,
    min_deposit_amount: 16660000,
    created_at: "2026-10-15T14:30:00.000Z",
    shop_name: "1688 OEM Factory",
    item_title: "Đồ gia dụng thông minh cao cấp xuất khẩu",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150&q=80",
    contract_type: "Tiểu ngạch",
  },
];

export default function CustomerOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = MOCK_ALL_ORDERS.filter((order) => {
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
            Theo dõi tiến độ, thanh toán đặt cọc và lộ trình hàng về
          </p>
        </div>

        <Link
          href="/orders/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đơn Hàng Mới</span>
        </Link>
      </div>

      {/* Filter Tabs (Horizontal scroll on mobile, wrap on desktop) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200 no-scrollbar">
        {STATUS_TABS.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedStatus(tab.status)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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
              {tab.count}
            </span>
          </button>
        ))}
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

      {/* Order Cards List */}
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
                    <button className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm">
                      Đặt Cọc Ngay
                    </button>
                  )}
                  <Link
                    href={`/orders/${order.id}`}
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
    </div>
  );
}
