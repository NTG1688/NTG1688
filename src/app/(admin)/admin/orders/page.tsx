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
  ChevronDown,
  DollarSign,
  Tag,
  Settings,
  Layers,
  Percent,
  Plus
} from "lucide-react";
import { formatVND, formatCNY, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge";
import { OrderStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { orderStore } from "@/lib/order-store";

interface AdminOrderRow {
  id: string;
  order_code: string;
  customer_name: string;
  customer_code: string;
  status: OrderStatus;
  total_cny: number;
  total_vnd: number;
  total_cost_vnd: number;
  gross_profit_vnd: number;
  deposit_amount: number;
  min_deposit_amount: number;
  contract_type: string;
  purchaser_name: string;
  hashtags: string[];
  tracking_count: number;
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
  const [selectedPurchaser, setSelectedPurchaser] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    function loadAllOrders() {
      setLoading(true);
      const stored = orderStore.getOrders();
      setOrders(stored.map((o) => ({
        id: o.id,
        order_code: o.order_code,
        customer_name: o.customer_name,
        customer_code: o.customer_code,
        status: o.status as OrderStatus,
        total_cny: Number(o.total_cny || 0),
        total_vnd: Number(o.total_vnd || 0),
        total_cost_vnd: Number(o.total_cost_vnd || 0),
        gross_profit_vnd: Number(o.gross_profit_vnd || 0),
        deposit_amount: Number(o.deposit_amount || 0),
        min_deposit_amount: Number(o.min_deposit_amount || 0),
        contract_type: o.contract_type || "Chính ngạch",
        purchaser_name: o.purchaser_name || "Lê Hoàng Thu",
        hashtags: o.hashtags || [],
        tracking_count: o.tracking_codes?.length || 0,
        created_at: o.created_at,
        item_count: o.items?.length || 0,
      })));
      setLoading(false);
    }

    loadAllOrders();

    window.addEventListener("NTG_ORDERS_UPDATED", loadAllOrders);
    return () => window.removeEventListener("NTG_ORDERS_UPDATED", loadAllOrders);
  }, []);

  const handleChangeOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    orderStore.updateOrderStatus(orderId, newStatus);
    setUpdatingId(null);
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== "all" && o.status !== selectedStatus) return false;
    if (selectedPurchaser !== "all" && o.purchaser_name !== selectedPurchaser) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.order_code.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_code.toLowerCase().includes(q) ||
        o.purchaser_name.toLowerCase().includes(q) ||
        o.hashtags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Tính tổng chỉ số tài chính của danh sách lọc
  const totalStats = filteredOrders.reduce(
    (acc, cur) => {
      acc.revenue += cur.total_vnd;
      acc.cost += cur.total_cost_vnd;
      acc.profit += cur.gross_profit_vnd;
      return acc;
    },
    { revenue: 0, cost: 0, profit: 0 }
  );

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
            Phân Hệ Điều Hành Đơn Hàng & Tài Chính ERP
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý Đơn Hàng, Giá Vốn & Lợi Nhuận Gộp
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Đối soát song song Giá Thu Khách vs Giá Vốn, phân công Purchaser/Sale, quản lý đa mã vận đơn & khai báo hải quan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/orders/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Lên Đơn Mới
          </Link>
        </div>
      </div>

      {/* KPI TỔNG HỢP NHANH CỦA DANH SÁCH */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-medium">Tổng Doanh Thu Thu Khách ({filteredOrders.length} đơn):</span>
          <div className="text-xl font-black text-gray-900 mt-1">
            {formatVND(totalStats.revenue)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-medium">Tổng Chi Phí Giá Vốn:</span>
          <div className="text-xl font-bold text-slate-700 mt-1">
            {formatVND(totalStats.cost)}
          </div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-xs text-emerald-800 font-semibold flex items-center justify-between">
            Lợi Nhuận Gộp Dự Kiến:
            <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
              {totalStats.revenue > 0 ? ((totalStats.profit / totalStats.revenue) * 100).toFixed(1) : 0}%
            </span>
          </span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            +{formatVND(totalStats.profit)}
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mã đơn (MD2596), tên khách, mã KH (NT2820), tag (#HangDeVo)..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        {/* Lọc theo Purchaser */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">Purchaser:</span>
          <select
            value={selectedPurchaser}
            onChange={(e) => setSelectedPurchaser(e.target.value)}
            className="text-xs p-2 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="all">Tất cả nhân viên mua hàng</option>
            <option value="Lê Hoàng Thu">Lê Hoàng Thu</option>
            <option value="Nguyễn Văn Hùng">Nguyễn Văn Hùng</option>
            <option value="Trần Quốc Đạt">Trần Quốc Đạt</option>
          </select>
        </div>

        {/* Filter status tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedStatus === "all" ? "bg-purple-700 text-white shadow-xs" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Tất cả ({orders.length})
          </button>
          {[0, 1, 2, 3, 6, 10, 11, 14, 16].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st as OrderStatus)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === st ? "bg-purple-700 text-white shadow-xs" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {st === 0 ? "Chờ cọc" : st === 1 ? "Đã cọc" : st === 3 ? "Đang mua" : st === 6 ? "Đã mua" : st === 10 ? "Về VN" : st === 11 ? "Kho VN" : st === 14 ? "Hoàn thành" : st === 16 ? "Hủy" : `TT ${st}`}
            </button>
          ))}
        </div>
      </div>

      {/* ORDER DATA TABLE */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-xs">Đang tải toàn bộ dữ liệu đơn hàng...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Mã Đơn / Tags</th>
                  <th className="py-3.5 px-4">Khách Hàng</th>
                  <th className="py-3.5 px-4">Purchaser</th>
                  <th className="py-3.5 px-4">Trạng Thái Đơn</th>
                  <th className="py-3.5 px-4">Chuyển Bước</th>
                  <th className="py-3.5 px-4 text-right">Thu Khách (VNĐ)</th>
                  <th className="py-3.5 px-4 text-right">Giá Vốn</th>
                  <th className="py-3.5 px-4 text-right text-emerald-700">Lợi Nhuận Gộp</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Mã đơn & Tags */}
                    <td className="py-3.5 px-4">
                      <Link 
                        href={`/admin/orders/${order.order_code || order.id}`} 
                        className="font-mono font-black text-blue-700 text-sm hover:underline flex items-center gap-1.5"
                      >
                        {order.order_code}
                      </Link>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {order.hashtags?.map((t: string) => (
                          <span key={t} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.2 rounded font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="block text-[10px] text-gray-400 mt-0.5">
                        {order.contract_type} · {order.item_count} SP · {order.tracking_count} kiện
                      </span>
                    </td>

                    {/* Khách hàng */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 block">{order.customer_name}</span>
                      <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded inline-block">
                        {order.customer_code}
                      </span>
                    </td>

                    {/* Purchaser phụ trách */}
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {order.purchaser_name}
                    </td>

                    {/* Trạng thái hiện tại */}
                    <td className="py-3.5 px-4">
                      <OrderStatusBadge status={order.status} />
                    </td>

                    {/* Quick status selector */}
                    <td className="py-3.5 px-4">
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

                    {/* Thu khách */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                      {formatVND(order.total_vnd)}
                      <span className="block text-[10px] text-gray-400 font-normal">{formatCNY(order.total_cny)}</span>
                    </td>

                    {/* Giá vốn */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                      {formatVND(order.total_cost_vnd)}
                    </td>

                    {/* Lợi nhuận gộp */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                      +{formatVND(order.gross_profit_vnd)}
                      <span className="block text-[10px] text-emerald-700 font-normal">
                        {order.total_vnd > 0 ? ((order.gross_profit_vnd / order.total_vnd) * 100).toFixed(1) : 0}%
                      </span>
                    </td>

                    {/* Thao tác chi tiết */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${order.order_code || order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Đối soát & Setup</span>
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
