"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge";
import { formatVND, formatCNY, formatDate } from "@/lib/utils";
import { 
  ArrowLeft, 
  Package, 
  FileText, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Copy, 
  Download,
  AlertCircle,
  Loader2
} from "lucide-react";
import { OrderStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  // Dữ liệu chi tiết đơn hàng
  const [order, setOrder] = useState<any>({
    id: "2596",
    order_code: "MD2596",
    status: 0 as OrderStatus,
    created_at: "2026-10-21T04:42:40.000Z",
    exchange_rate: 4015,
    total_cny: 9520,
    total_vnd: 42520111,
    deposit_amount: 0,
    min_deposit_amount: 33098741,
    remaining_amount: 42520111,
    receive_place: "Kho Hà Nội",
    contract_type: "Chính ngạch Ủy Thác",
    supplier_name: "TNHH Cơ Khí Quảng Châu",
    items: [
      {
        id: "10964",
        title: "Lô hàng mẫu thiết bị cơ khí nhập khẩu chính ngạch tiêu chuẩn xuất khẩu",
        property: "Phân loại A - Size chuẩn",
        quantity: 99,
        price_cny: 80,
        total_cny: 7920,
        image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&q=80",
        note: "Ghi chú đóng gói cẩn thận, dán mã vận đơn chống nước",
      },
      {
        id: "10965",
        title: "Phụ kiện đi kèm lô hàng cơ khí chính ngạch",
        property: "Bộ linh kiện phụ",
        quantity: 20,
        price_cny: 80,
        total_cny: 1600,
        image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=150&q=80",
        note: "",
      },
    ],
    declaration: {
      ma_kb: "MD2596-1",
      hs_code: "8479.89.90",
      description: "Máy và thiết bị cơ khí phục vụ công nghiệp loại khác",
      unit: "PCE",
      quantity: 119,
      tax_vat_rate: 8,
      tax_nk_rate: 0,
      fee_utnk: 1200000,
    },
    timeline: [
      { step: "Tạo đơn hàng", time: "21/10/2026 04:42", done: true },
      { step: "Đặt cọc đơn hàng", time: "Chờ thanh toán cọc", done: false },
      { step: "Nhân viên mua hàng", time: "Đang chờ", done: false },
      { step: "Shop TQ phát hàng", time: "Đang chờ", done: false },
      { step: "Kho TQ nhận hàng", time: "Đang chờ", done: false },
      { step: "Kho VN nhận hàng", time: "Đang chờ", done: false },
      { step: "Giao hàng thành công", time: "Đang chờ", done: false },
    ],
  });

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      try {
        const { data: dbOrder } = await supabase
          .from("orders")
          .select("*, order_items(*), declarations(*)")
          .or(`id.eq.${orderId},order_code.eq.${orderId}`)
          .maybeSingle();

        if (dbOrder) {
          const items = (dbOrder.order_items || []).map((it: any) => ({
            id: it.id,
            title: it.title,
            property: it.property_desc || "Mặc định",
            quantity: it.quantity,
            price_cny: Number(it.price_cny),
            total_cny: Number(it.price_cny) * it.quantity,
            image_url: it.image_url || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&q=80",
            note: it.customer_note || "",
          }));

          const dec = dbOrder.declarations?.[0];

          setOrder({
            id: dbOrder.id,
            order_code: dbOrder.order_code,
            status: dbOrder.status as OrderStatus,
            created_at: dbOrder.created_at,
            exchange_rate: Number(dbOrder.exchange_rate || 4015),
            total_cny: Number(dbOrder.total_cny || 0),
            total_vnd: Number(dbOrder.total_vnd || 0),
            deposit_amount: Number(dbOrder.deposit_amount || 0),
            min_deposit_amount: Number(dbOrder.min_deposit_amount || 0),
            remaining_amount: Number(dbOrder.remaining_amount || 0),
            receive_place: "Kho Hà Nội",
            contract_type: dbOrder.contract_type || "Tiểu ngạch",
            supplier_name: "Nhà cung cấp Trung Quốc",
            items: items.length > 0 ? items : order.items,
            declaration: dec ? {
              ma_kb: dec.declaration_code,
              hs_code: dec.hs_code || "8479.89.90",
              description: dec.product_description,
              unit: dec.unit || "PCE",
              quantity: dec.quantity,
              tax_vat_rate: Number(dec.tax_vat_rate || 8),
              tax_nk_rate: Number(dec.tax_nk_rate || 0),
              fee_utnk: Number(dec.specialized_fee || 1200000),
            } : order.declaration,
            timeline: [
              { step: "Tạo đơn hàng", time: formatDate(dbOrder.created_at), done: true },
              { step: "Đặt cọc đơn hàng", time: dbOrder.status >= 1 ? "Đã cọc" : "Chờ cọc", done: dbOrder.status >= 1 },
              { step: "Nhân viên mua hàng", time: dbOrder.status >= 6 ? "Đã mua" : "Đang chờ", done: dbOrder.status >= 6 },
              { step: "Shop TQ phát hàng", time: dbOrder.status >= 7 ? "Đã phát" : "Đang chờ", done: dbOrder.status >= 7 },
              { step: "Kho TQ nhận hàng", time: dbOrder.status >= 9 ? "Đã nhận" : "Đang chờ", done: dbOrder.status >= 9 },
              { step: "Kho VN nhận hàng", time: dbOrder.status >= 11 ? "Đã về kho" : "Đang chờ", done: dbOrder.status >= 11 },
              { step: "Giao hàng thành công", time: dbOrder.status === 14 ? "Hoàn thành" : "Đang chờ", done: dbOrder.status === 14 },
            ],
          });
        }
      } catch (err) {
        console.warn("Could not fetch order detail:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-mono">
                {order.order_code}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Tạo lúc {formatDate(order.created_at)} · Loại HĐ: <span className="font-semibold text-gray-700">{order.contract_type}</span>
            </p>
          </div>
        </div>

        {order.status === 0 && (
          <button className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all self-start sm:self-auto cursor-pointer">
            Đặt Cọc Ngay ({formatVND(order.min_deposit_amount)})
          </button>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
        <h3 className="font-bold text-sm text-gray-900 mb-6">Tiến Độ Xử Lý Đơn Hàng (14 Trạng Thái)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          {order.timeline.map((item: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                  item.done
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-50"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {item.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-xs font-bold ${item.done ? "text-gray-900" : "text-gray-400"}`}>
                {item.step}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Products & Declaration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products List */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 pb-3 border-b border-gray-100">
              Danh Sách Sản Phẩm Trong Đơn ({order.items.length})
            </h3>

            <div className="divide-y divide-gray-100">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-2xl border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2">
                      {item.title}
                    </h4>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      {item.property}
                    </span>
                    {item.note && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl mt-2">
                        Ghi chú: {item.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-sm text-gray-900 block font-mono">
                      {formatCNY(item.price_cny)}
                    </span>
                    <span className="text-xs text-gray-400 block">x{item.quantity}</span>
                    <span className="font-black text-brand-700 text-sm block mt-1 font-mono">
                      {formatCNY(item.total_cny)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module Hải Quan Chính Ngạch (NKCN) */}
          {order.declaration && (
            <div className="bg-white rounded-3xl border border-purple-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-gray-900">
                      Tờ Khai Hải Quan & Thuế Nhập Khẩu Chính Ngạch (NKCN)
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Chứng từ thông quan hợp quy pháp lý đứng tên Nam Trung Logistics
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold font-mono">
                  {order.declaration.ma_kb}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block">Mã HS Code:</span>
                  <span className="font-mono font-bold text-purple-800 text-sm">
                    {order.declaration.hs_code}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Thuế Nhập Khẩu:</span>
                  <span className="font-bold text-gray-800">{order.declaration.tax_nk_rate}%</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Thuế VAT:</span>
                  <span className="font-bold text-gray-800">{order.declaration.tax_vat_rate}%</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 block">Mô tả hàng hóa hải quan:</span>
                  <span className="font-medium text-gray-800">{order.declaration.description}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Phí ủy thác nhập khẩu:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {formatVND(order.declaration.fee_utnk)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Financial Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 pb-3 border-b border-gray-100">
              Chi Tiết Tài Chính
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Tổng giá trị hàng (CNY):</span>
                <span className="font-mono font-bold text-gray-900">{formatCNY(order.total_cny)}</span>
              </div>

              <div className="flex justify-between text-gray-500">
                <span>Tỷ giá áp dụng:</span>
                <span className="font-mono font-bold text-gray-900">{order.exchange_rate.toLocaleString()} đ/CNY</span>
              </div>

              <div className="flex justify-between text-gray-500">
                <span>Tổng tiền hàng (VNĐ):</span>
                <span className="font-mono font-bold text-gray-900">
                  {formatVND(order.total_cny * order.exchange_rate)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <span className="font-bold text-gray-900 text-sm">Tổng Đơn Hàng:</span>
                <span className="font-mono font-black text-brand-700 text-lg">
                  {formatVND(order.total_vnd)}
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1.5">
                <div className="flex justify-between text-emerald-800">
                  <span>Đã thanh toán / cọc:</span>
                  <span className="font-mono font-bold">{formatVND(order.deposit_amount)}</span>
                </div>
                <div className="flex justify-between text-emerald-900 font-bold">
                  <span>Còn thiếu cần thanh toán:</span>
                  <span className="font-mono">{formatVND(order.remaining_amount)}</span>
                </div>
              </div>

              {order.status === 0 && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800">
                  <span className="font-bold block">Yêu cầu đặt cọc tối thiểu (70%):</span>
                  <span className="font-mono font-black text-base text-amber-900 block mt-0.5">
                    {formatVND(order.min_deposit_amount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
