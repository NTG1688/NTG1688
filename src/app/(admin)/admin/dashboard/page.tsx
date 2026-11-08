"use client";

import React, { useState, useEffect } from "react";
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
  Settings,
  Loader2,
  RefreshCcw,
  ShoppingCart
} from "lucide-react";
import { formatVND, formatCNY } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AdminStats {
  total_revenue_vnd: number;
  total_weight_kg: number;
  orders_to_buy_today: number;
  orders_to_buy_value_cny: number;
  total_customers: number;
  new_customers_week: number;
}

interface WarehouseStatus {
  id: string;
  code: string;
  name: string;
  location: string;
  weight_kg: number;
  ready_orders: number;
  note: string;
}

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<AdminStats>({
    total_revenue_vnd: 0,
    total_weight_kg: 0,
    orders_to_buy_today: 0,
    orders_to_buy_value_cny: 0,
    total_customers: 0,
    new_customers_week: 0,
  });

  const [warehouses, setWarehouses] = useState<WarehouseStatus[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        // Lấy thống kê đơn hàng
        const { data: allOrders } = await supabase
          .from("orders")
          .select("id, order_code, status, total_cny, total_vnd, deposit_amount, created_at, contract_type, customer_id")
          .order("created_at", { ascending: false });

        if (allOrders && allOrders.length > 0) {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const monthOrders = allOrders.filter((o: any) => o.created_at >= monthStart);
          const toBuy = allOrders.filter((o: any) => [1, 2, 3].includes(o.status));

          setStats(prev => ({
            ...prev,
            total_revenue_vnd: monthOrders.reduce((s: number, o: any) => s + Number(o.total_vnd || 0), 0),
            orders_to_buy_today: toBuy.length,
            orders_to_buy_value_cny: toBuy.reduce((s: number, o: any) => s + Number(o.total_cny || 0), 0),
          }));

          setRecentOrders(allOrders.slice(0, 8));
        } else {
          // Demo fallback
          setStats({
            total_revenue_vnd: 1425800000,
            total_weight_kg: 18400,
            orders_to_buy_today: 24,
            orders_to_buy_value_cny: 45800,
            total_customers: 17314,
            new_customers_week: 142,
          });
        }

        // Lấy thống kê khách hàng
        const { count: customerCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "customer");

        if (customerCount !== null) {
          setStats(prev => ({ ...prev, total_customers: customerCount }));
        }

        // Lấy danh sách kho
        const { data: warehouseData } = await supabase
          .from("warehouses")
          .select("*")
          .order("created_at");

        if (warehouseData && warehouseData.length > 0) {
          // Lấy tổng trọng lượng packages đang ở mỗi kho
          const warehouseStatuses: WarehouseStatus[] = [];
          for (const wh of warehouseData) {
            const { count: readyCount } = await supabase
              .from("packages")
              .select("id", { count: "exact", head: true })
              .eq("current_warehouse_id", wh.id);

            warehouseStatuses.push({
              id: wh.id,
              code: wh.code,
              name: wh.name,
              location: wh.location || wh.country,
              weight_kg: 0,
              ready_orders: readyCount || 0,
              note: wh.is_active ? "Đang hoạt động" : "Tạm ngưng",
            });
          }
          setWarehouses(warehouseStatuses);
        } else {
          setWarehouses([
            { id: "1", code: "KHO-QUANGCHAU", name: "Kho Quảng Châu (CN)", location: "Trung Quốc", weight_kg: 1420, ready_orders: 8, note: "8 Bao hàng chuẩn bị niêm phong" },
            { id: "2", code: "KHO-BANGTUONG", name: "Kho Bằng Tường (CN)", location: "Trung Quốc", weight_kg: 3850, ready_orders: 0, note: "Chuyến xe đang làm thủ tục qua cửa khẩu" },
            { id: "3", code: "KHO-HN", name: "Kho Hà Nội (VN)", location: "Việt Nam", weight_kg: 6240, ready_orders: 142, note: "142 đơn sẵn sàng giao khách" },
            { id: "4", code: "KHO-HCM", name: "Kho TP. Hồ Chí Minh (VN)", location: "Việt Nam", weight_kg: 4120, ready_orders: 98, note: "98 đơn đang vận chuyển nội thành" },
          ]);
        }
      } catch (err) {
        console.error("Admin dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

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
            Dữ liệu thời gian thực giữa {warehouses.length > 0 ? warehouses.length : 4} tổng kho (Quảng Châu, Bằng Tường, Hà Nội, TP.HCM)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/settings"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            <span>Cấu Hình R2 & Tỷ Giá</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-28 mb-3"></div>
              <div className="h-8 bg-gray-100 rounded w-36 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-44"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Doanh Số Tháng</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 font-mono">
              {formatVND(stats.total_revenue_vnd)}
            </div>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Doanh số tháng hiện tại
            </span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Khối Lượng Về Kho</span>
              <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 font-mono">
              {(stats.total_weight_kg / 1000).toFixed(1)} <span className="text-sm font-bold text-gray-500">Tấn</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Thể tích tương đương: {(stats.total_weight_kg / 340).toFixed(1)} m³</p>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Đơn Cần Mua Hôm Nay</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono">
              {stats.orders_to_buy_today} <span className="text-sm font-bold text-gray-400">đơn</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Tổng giá trị: {formatCNY(stats.orders_to_buy_value_cny)}</p>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Tổng Khách Hàng</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 font-mono">
              {stats.total_customers.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-1">Hoạt động trên hệ thống</p>
          </div>
        </div>
      )}

      {/* Kho Hàng Phân Bổ */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
        <h3 className="font-bold text-base text-gray-900 mb-4">Hiện Trạng Các Tổng Kho</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {warehouses.map((wh) => {
            const isChina = wh.location?.includes("Trung Quốc") || wh.code.includes("QUANGCHAU") || wh.code.includes("BANGTUONG");
            return (
              <div key={wh.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold text-xs ${isChina ? "text-gray-800" : "text-purple-800"}`}>
                    {wh.name}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className={`text-lg font-black font-mono ${isChina ? "text-brand-700" : "text-purple-700"}`}>
                  {wh.weight_kg > 0 ? `${wh.weight_kg.toLocaleString()} kg` : `${wh.ready_orders} kiện`}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {wh.ready_orders > 0 ? `${wh.ready_orders} đơn sẵn sàng giao` : wh.note}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Đơn hàng gần đây trên toàn hệ thống */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-base text-gray-900">Đơn Hàng Mới Nhất Toàn Hệ Thống</h3>
              <p className="text-xs text-gray-400 mt-0.5">Đơn hàng từ tất cả khách hàng (realtime)</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Mã Đơn</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Loại HĐ</th>
                  <th className="py-3.5 px-4">Tổng VNĐ</th>
                  <th className="py-3.5 px-4">Tổng CNY</th>
                  <th className="py-3.5 px-4">Cọc</th>
                  <th className="py-3.5 px-4">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                      <Link href={`/orders/${o.id}`} className="hover:underline">{o.order_code}</Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-bold">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-semibold">{o.contract_type || "-"}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{formatVND(Number(o.total_vnd || 0))}</td>
                    <td className="py-3.5 px-4 text-gray-500">{formatCNY(Number(o.total_cny || 0))}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">{formatVND(Number(o.deposit_amount || 0))}</td>
                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">{new Date(o.created_at).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
