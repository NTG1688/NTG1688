"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Package, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  UserCheck, 
  Edit3, 
  Loader2,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { formatVND, formatCNY, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge";
import { OrderStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface AdminOrderRow {
  id: string;
  order_code: string;
  customer_name: string;
  customer_code: string;
  status: OrderStatus;
  total_cny: number;
  total_vnd: number;
  deposit_amount: number;
  min_deposit_amount: number;
  contract_type: string;
  created_at: string;
  item_count: number;
}

const ALL_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 0, label: "0: Chờ đặt cọc" },
  { value: 1, label: "1: Đã đặt cọc" },
  { value: 2, label: "2: Chờ mua hàng" },
  { value: 3, label: "3: Đang mua hàng" },
  { value: 6, label: "6: Đã mua hàng" },
  { value: 7, label: "7: Shop TQ phát hàng" },
  { value: 9, label: "9: Kho TQ nhận hàng" },
  { value: 10, label: "10: Kho TQ xuất / Vận chuyển về VN" },
  { value: 11, label: "11: Kho VN nhận hàng" },
  { value: 12, label: "12: Chờ giao hàng" },
  { value: 13, label: "13: Đang giao hàng" },
  { value: 14, label: "14: Hoàn thành" },
  { value: 16, label: "16: Đã hủy đơn" },
];

export default function AdminOrdersManagementPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAllOrders() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*, profiles:customer_id(full_name, user_code), order_items(id)")
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Admin orders query error:", error.message);
        }

        if (data && data.length > 0) {
          setOrders(data.map((o: any) => ({
            id: o.id,
            order_code: o.order_code,
            customer_name: o.profiles?.full_name || "Khách Hàng",
            customer_code: o.profiles?.user_code || "NT2820",
            status: o.status as OrderStatus,
            total_cny: Number(o.total_cny || 0),
            total_vnd: Number(o.total_vnd || 0),
            deposit_amount: Number(o.deposit_amount || 0),
            min_deposit_amount: Number(o.min_deposit_amount || 0),
            contract_type: o.contract_type || "Tiểu ngạch",
            created_at: o.created_at,
            item_count: o.order_items?.length || 1,
          })));
        } else {
          // Demo fallback
          setOrders([
            {
              id: "2596",
              order_code: "MD2596",
              customer_name: "Nguyễn Văn Trung",
              customer_code: "NT2820",
              status: 0,
              total_cny: 9520,
              total_vnd: 42520111,
              deposit_amount: 0,
              min_deposit_amount: 33098741,
              contract_type: "Chính ngạch Ủy Thác",
              created_at: "2026-10-21T04:42:40.000Z",
              item_count: 3,
            },
            {
              id: "2588",
              order_code: "MD2588",
              customer_name: "Nguyễn Văn Trung",
              customer_code: "NT2820",
              status: 10,
              total_cny: 2840,
              total_vnd: 12450000,
              deposit_amount: 10000000,
              min_deposit_amount: 8715000,
              contract_type: "Chính ngạch",
              created_at: "2026-10-18T09:15:20.000Z",
              item_count: 5,
            },
            {
              id: "2572",
              order_code: "MD2572",
              customer_name: "Nguyễn Văn Trung",
              customer_code: "NT2820",
              status: 11,
              total_cny: 5400,
              total_vnd: 23800000,
              deposit_amount: 20000000,
              min_deposit_amount: 16660000,
              contract_type: "Tiểu ngạch",
              created_at: "2026-10-15T14:30:00.000Z",
              item_count: 2,
            },
            {
              id: "2540",
              order_code: "MD2540",
              customer_name: "Trần Đức Nam",
              customer_code: "NT1042",
              status: 6,
              total_cny: 15400,
              total_vnd: 62450000,
              deposit_amount: 45000000,
              min_deposit_amount: 43715000,
              contract_type: "Chính ngạch",
              created_at: "2026-10-12T08:00:00.000Z",
              item_count: 8,
            },
          ]);
        }
      } catch (err) {
        console.error("Load admin orders error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllOrders();
  }, []);

  const handleChangeOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      setOrders(orders.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error("Update status error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== "all" && o.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.order_code.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
            Phân Hệ Điều Hành Đơn Hàng
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý & Duyệt Đơn Toàn Hệ Thống
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Xem toàn bộ đơn mua hộ từ tất cả khách hàng, cập nhật trạng thái 14 bước, gán mã giao dịch TQ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/orders/new"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            + Lên Đơn Thủ Công
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn (MD2596), tên khách, mã KH (NT2820)..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedStatus === "all" ? "bg-purple-700 text-white shadow-xs" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Tất cả ({orders.length})
          </button>
          {[0, 1, 2, 6, 7, 9, 10, 11, 14].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st as OrderStatus)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === st ? "bg-purple-700 text-white shadow-xs" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {st === 0 ? "Chờ cọc" : st === 1 ? "Đã cọc" : st === 2 ? "Chờ mua" : st === 6 ? "Đã mua" : st === 10 ? "Về VN" : st === 11 ? "Kho VN" : `Trạng thái ${st}`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-xs">Đang tải toàn bộ đơn hàng...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Mã Đơn</th>
                  <th className="py-3.5 px-4">Khách Hàng</th>
                  <th className="py-3.5 px-4">Trạng Thái Hiện Tại</th>
                  <th className="py-3.5 px-4">Chuyển Trạng Thái (14 bước)</th>
                  <th className="py-3.5 px-4">Tổng Tiền VNĐ</th>
                  <th className="py-3.5 px-4">Cọc / Cần Cọc</th>
                  <th className="py-3.5 px-4">Ngày Tạo</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <Link href={`/orders/${order.id}`} className="font-mono font-black text-brand-700 text-sm hover:underline">
                        {order.order_code}
                      </Link>
                      <span className="block text-[10px] text-gray-400">{order.contract_type} · {order.item_count} SP</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-900 block">{order.customer_name}</span>
                      <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded inline-block">
                        {order.customer_code}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <OrderStatusBadge status={order.status} />
                    </td>

                    {/* Quick status selector */}
                    <td className="py-4 px-4">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleChangeOrderStatus(order.id, parseInt(e.target.value) as OrderStatus)}
                        className="p-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {ALL_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-gray-900 block">{formatVND(order.total_vnd)}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{formatCNY(order.total_cny)}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono font-semibold text-emerald-700 block">{formatVND(order.deposit_amount)}</span>
                      {order.status === 0 && (
                        <span className="text-[10px] text-amber-700 font-mono">Cần: {formatVND(order.min_deposit_amount)}</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-gray-400 text-[11px]">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-purple-50 hover:text-purple-700 text-gray-700 rounded-xl font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
