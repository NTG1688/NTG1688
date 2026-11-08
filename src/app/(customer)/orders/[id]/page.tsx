"use client";

import React from "react";
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
  AlertCircle
} from "lucide-react";
import { OrderStatus } from "@/types";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  // Dữ liệu chi tiết đơn hàng mẫu MD2596 bóc tách từ API thực tế
  const orderData = {
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
    supplier_name: "TNHH ABC",
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
  };

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
                {orderData.order_code}
              </h1>
              <OrderStatusBadge status={orderData.status} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Ngày tạo: {formatDate(orderData.created_at)} · Tỷ giá: {orderData.exchange_rate.toLocaleString()} đ/¥
            </p>
          </div>
        </div>

        {orderData.status === 0 && (
          <button className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-600/20 transition-all">
            Đặt Cọc Ngay ({formatVND(orderData.min_deposit_amount)})
          </button>
        )}
      </div>

      {/* Tiến độ đơn hàng (Timeline) */}
      <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
        <h3 className="font-bold text-sm text-gray-900 mb-4">Lộ Trình Đơn Hàng</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          {orderData.timeline.map((step, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-xs ${
                step.done
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold"
                  : "bg-gray-50 border-gray-100 text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] mb-2 font-black ${
                  step.done ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {idx + 1}
              </div>
              <span className="block leading-tight">{step.step}</span>
              <span className="text-[10px] block opacity-75 mt-1 font-normal">{step.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: 2 columns (Danh sách sản phẩm & Thông tin tài chính + Hải quan) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Danh sách sản phẩm */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-gray-900 mb-4">Sản Phẩm Trong Đơn ({orderData.items.length})</h3>
            <div className="divide-y divide-gray-100">
              {orderData.items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-2xl border border-gray-100 shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">Phân loại: {item.property}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {item.quantity} x {formatCNY(item.price_cny)}
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        {formatCNY(item.total_cny)} ({formatVND(item.total_cny * orderData.exchange_rate)})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module Tờ Khai Hải Quan Chính Ngạch */}
          <div className="bg-white rounded-3xl border border-purple-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-gray-900">Tờ Khai Hải Quan & Phân Bổ Thuế (NKCN)</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full font-bold">
                {orderData.declaration.ma_kb}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block text-[11px]">Mã HS Code</span>
                <span className="font-mono font-bold text-gray-800">{orderData.declaration.hs_code}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block text-[11px]">Thuế VAT NK</span>
                <span className="font-bold text-gray-800">{orderData.declaration.tax_vat_rate}%</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block text-[11px]">Thuế Nhập Khẩu</span>
                <span className="font-bold text-gray-800">{orderData.declaration.tax_nk_rate}%</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 block text-[11px]">Phí Ủy Thác NK</span>
                <span className="font-bold text-gray-800">{formatVND(orderData.declaration.fee_utnk)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right (1 col): Bảng kê tài chính */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">Tổng Hợp Chi Phí</h3>

            <div className="flex justify-between text-gray-500">
              <span>Tiền hàng (CNY):</span>
              <span className="font-semibold text-gray-800">{formatCNY(orderData.total_cny)}</span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>Tiền hàng quy đổi (VNĐ):</span>
              <span className="font-semibold text-gray-800">{formatVND(orderData.total_cny * orderData.exchange_rate)}</span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>Phí mua hàng:</span>
              <span className="font-semibold text-gray-800">{formatVND(50000)}</span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>Phí ủy thác nhập khẩu:</span>
              <span className="font-semibold text-gray-800">{formatVND(orderData.declaration.fee_utnk)}</span>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-900 text-sm">Tổng thanh toán:</span>
              <span className="font-extrabold text-brand-700 text-base">{formatVND(orderData.total_vnd)}</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 mt-3">
              <div className="flex justify-between font-bold text-amber-900">
                <span>Cọc tối thiểu:</span>
                <span>{formatVND(orderData.min_deposit_amount)}</span>
              </div>
              <p className="text-[10px] text-amber-700 mt-0.5">Cần đặt cọc để nhân viên tiến hành mua hàng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
