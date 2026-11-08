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
  Loader2,
  Receipt,
  ShieldCheck,
  CreditCard,
  QrCode,
  Tag,
  ExternalLink,
  Printer,
  ChevronRight
} from "lucide-react";
import { OrderStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "MD2596";
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [payingWallet, setPayingWallet] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

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
    paid_amount_vnd: 0,
    remaining_amount: 42520111,
    
    // Phí chi tiết thu khách
    fee_buy: 850402,
    fee_ship_cn_cny: 120,
    fee_ship_cn_vnd: 481800,
    fee_weight: 4564000,
    fee_check: 200000,
    fee_wood: 350000,
    fee_insurance: 1145000,
    fee_utnk: 1200000,
    tax_vat_amount: 3057398,
    tax_nk_amount: 0,
    tax_hdtq_amount: 1146711,
    
    total_weight_kg: 163.0,
    total_cbm: 0.85,
    chargeable_weight_kg: 163.0,
    weight_unit_price: 28000,
    
    receive_place: "Kho Hà Nội (Việt Nam)",
    origin_warehouse: "Kho Bằng Tường (Trung Quốc)",
    contract_type: "Chính ngạch Ủy Thác",
    supplier_name: "TNHH Thiết Bị Cơ Khí Quảng Châu Huada",
    hashtags: ["#HangDeVo", "#ChotTTLan2", "#GiaTriCao"],
    customer_note: "Ghi chú đóng gói cẩn thận, dán mã vận đơn chống nước",
    
    items: [
      {
        id: "10964",
        title: "Lô hàng mẫu thiết bị cơ khí nhập khẩu chính ngạch tiêu chuẩn xuất khẩu",
        property: "Phân loại A - Size chuẩn",
        quantity: 99,
        price_cny: 80,
        total_cny: 7920,
        image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&q=80",
        product_link: "https://detail.1688.com/offer/712398401.html",
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
        product_link: "https://detail.1688.com/offer/712398402.html",
        note: "",
      },
    ],
    
    tracking_codes: [
      {
        id: "tr_01",
        tracking_code: "YT7283921832101",
        carrier_name: "Yuantong Express (Viên Thông)",
        weight_kg: 82.5,
        status: "cn_received",
        status_label: "Đã nhập kho TQ",
        note: "Kiện 1/2 máy chính"
      },
      {
        id: "tr_02",
        tracking_code: "YT7283921832102",
        carrier_name: "Yuantong Express (Viên Thông)",
        weight_kg: 80.5,
        status: "cn_received",
        status_label: "Đã nhập kho TQ",
        note: "Kiện 2/2 phụ kiện và máy phụ"
      }
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
          .select("*, order_items(*), order_tracking_codes(*), declarations(*)")
          .or(`id.eq.${orderId},order_code.eq.${orderId}`)
          .maybeSingle();

        if (dbOrder) {
          const items = (dbOrder.order_items || []).map((it: any) => ({
            id: it.id,
            title: it.title,
            property: it.properties || "Mặc định",
            quantity: it.quantity,
            price_cny: Number(it.price_cny),
            total_cny: Number(it.price_cny) * it.quantity,
            image_url: it.image_url || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&q=80",
            product_link: it.product_link,
            note: it.customer_note || "",
          }));

          const dec = dbOrder.declarations?.[0];

          setOrder((prev: any) => ({
            ...prev,
            id: dbOrder.id,
            order_code: dbOrder.order_code,
            status: dbOrder.status as OrderStatus,
            created_at: dbOrder.created_at,
            exchange_rate: Number(dbOrder.exchange_rate || 4015),
            total_cny: Number(dbOrder.total_cny || prev.total_cny),
            total_vnd: Number(dbOrder.total_vnd || prev.total_vnd),
            deposit_amount: Number(dbOrder.deposit_amount || prev.deposit_amount),
            min_deposit_amount: Number(dbOrder.min_deposit_amount || prev.min_deposit_amount),
            paid_amount_vnd: Number(dbOrder.paid_amount_vnd || prev.paid_amount_vnd),
            remaining_amount: Number(dbOrder.remaining_amount || prev.remaining_amount),
            fee_buy: Number(dbOrder.fee_buy || prev.fee_buy),
            fee_ship_cn_cny: Number(dbOrder.fee_ship_cn_cny || prev.fee_ship_cn_cny),
            fee_ship_cn_vnd: Number(dbOrder.fee_ship_cn_vnd || prev.fee_ship_cn_vnd),
            fee_weight: Number(dbOrder.fee_weight || prev.fee_weight),
            fee_check: Number(dbOrder.fee_check || prev.fee_check),
            fee_wood: Number(dbOrder.fee_wood || prev.fee_wood),
            fee_insurance: Number(dbOrder.fee_insurance || prev.fee_insurance),
            fee_utnk: Number(dbOrder.fee_utnk || prev.fee_utnk),
            tax_vat_amount: Number(dbOrder.tax_vat_amount || prev.tax_vat_amount),
            tax_nk_amount: Number(dbOrder.tax_nk_amount || prev.tax_nk_amount),
            total_weight_kg: Number(dbOrder.total_weight_kg || prev.total_weight_kg),
            chargeable_weight_kg: Number(dbOrder.chargeable_weight_kg || prev.chargeable_weight_kg),
            contract_type: dbOrder.contract_type || prev.contract_type,
            hashtags: dbOrder.hashtags && dbOrder.hashtags.length > 0 ? dbOrder.hashtags : prev.hashtags,
            items: items.length > 0 ? items : prev.items,
            tracking_codes: dbOrder.order_tracking_codes?.length > 0 ? dbOrder.order_tracking_codes.map((t: any) => ({
              id: t.id,
              tracking_code: t.tracking_code,
              carrier_name: t.carrier_name,
              weight_kg: t.weight_kg,
              status: t.status,
              status_label: t.status === "cn_received" ? "Đã nhập kho TQ" : t.status,
              note: t.note
            })) : prev.tracking_codes,
            declaration: dec ? {
              ma_kb: dec.declaration_code,
              hs_code: dec.hs_code || "8479.89.90",
              description: dec.product_description,
              unit: dec.unit || "PCE",
              quantity: dec.quantity,
              tax_vat_rate: Number(dec.tax_vat_rate || 8),
              tax_nk_rate: Number(dec.tax_nk_rate || 0),
              fee_utnk: Number(dec.specialized_fee || 1200000),
            } : prev.declaration,
            timeline: [
              { step: "Tạo đơn hàng", time: formatDate(dbOrder.created_at), done: true },
              { step: "Đặt cọc đơn hàng", time: dbOrder.status >= 1 ? "Đã cọc" : "Chờ cọc", done: dbOrder.status >= 1 },
              { step: "Nhân viên mua hàng", time: dbOrder.status >= 6 ? "Đã mua" : "Đang chờ", done: dbOrder.status >= 6 },
              { step: "Shop TQ phát hàng", time: dbOrder.status >= 7 ? "Đã phát" : "Đang chờ", done: dbOrder.status >= 7 },
              { step: "Kho TQ nhận hàng", time: dbOrder.status >= 9 ? "Đã nhận" : "Đang chờ", done: dbOrder.status >= 9 },
              { step: "Kho VN nhận hàng", time: dbOrder.status >= 11 ? "Đã về kho" : "Đang chờ", done: dbOrder.status >= 11 },
              { step: "Giao hàng thành công", time: dbOrder.status === 14 ? "Hoàn thành" : "Đang chờ", done: dbOrder.status === 14 },
            ],
          }));
        }
      } catch (err) {
        console.warn("Could not fetch customer order:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, supabase]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.order_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePayFromWallet = async () => {
    setPayingWallet(true);
    try {
      // Giả lập thanh toán trừ ví thành công
      await new Promise((res) => setTimeout(res, 800));
      setOrder({
        ...order,
        status: 1,
        deposit_amount: order.min_deposit_amount,
        remaining_amount: Math.max(0, order.total_vnd - order.min_deposit_amount)
      });
      setPaySuccess(true);
      setTimeout(() => setPaySuccess(false), 4000);
    } finally {
      setPayingWallet(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER & ACTION BUTTONS */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/orders"
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  ĐƠN HÀNG {order.order_code}
                  <button
                    onClick={handleCopyCode}
                    className="p-1 text-gray-400 hover:text-gray-600 transition"
                    title="Sao chép mã đơn"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </h1>
                <OrderStatusBadge status={order.status} />
                <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {order.contract_type}
                </span>
                {copiedCode && <span className="text-xs text-emerald-600 font-medium">Đã chép mã!</span>}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ngày tạo đơn: {formatDate(order.created_at)} | Tỷ giá áp dụng: <strong className="text-gray-800">{order.exchange_rate} đ/¥</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 shadow-sm transition"
            >
              <Printer className="w-4 h-4 text-gray-500" /> In đơn hàng
            </button>
            <Link
              href={`/complain?order_code=${order.order_code}`}
              className="px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-1.5 transition"
            >
              <AlertCircle className="w-4 h-4" /> Khiếu nại đơn này
            </Link>
          </div>
        </div>

        {/* Thông báo thanh toán thành công */}
        {paySuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Thanh toán tiền đặt cọc đơn hàng thành công từ ví số dư Nam Trung!
          </div>
        )}

        {/* TIMELINE TRACKER 7 BƯỚC */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            TIẾN TRÌNH VẬN HÀNH ĐƠN HÀNG
          </h3>
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 relative z-10">
              {order.timeline?.map((step: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      step.done
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "bg-white border-2 border-gray-300 text-gray-400"
                    }`}
                  >
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-semibold mt-2 ${step.done ? "text-gray-900" : "text-gray-400"}`}>
                    {step.step}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">{step.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2 CỘT CHÍNH: CHI TIẾT SẢN PHẨM & TÀI CHÍNH THANH TOÁN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (8 COLS): SẢN PHẨM & MÃ VẬN ĐƠN & KHAI BÁO */}
        <div className="lg:col-span-8 space-y-6">
          {/* BẢNG SẢN PHẨM */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                DANH SÁCH SẢN PHẨM ({order.items?.length || 0})
              </h3>
              <span className="text-xs text-gray-500">
                Xưởng: <strong className="text-gray-800">{order.supplier_name}</strong>
              </span>
            </div>

            <div className="divide-y divide-gray-200">
              {order.items?.map((item: any, idx: number) => {
                const itemVND = item.quantity * item.price_cny * order.exchange_rate;
                return (
                  <div key={item.id || idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                      <div>
                        <a
                          href={item.product_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                        >
                          {item.title}
                        </a>
                        <div className="text-[11px] text-gray-500 mt-1">
                          Phân loại: <span className="font-medium text-gray-700">{item.property}</span>
                        </div>
                        {item.note && (
                          <div className="text-[10px] text-rose-600 italic mt-0.5">
                            * Ghi chú: {item.note}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-0 pt-2 sm:pt-0">
                      <div className="text-xs font-bold text-gray-900">
                        {formatVND(itemVND)}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        ¥{item.price_cny} × {item.quantity} cái
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BẢNG MÃ VẬN ĐƠN CON ĐANG VẬN CHUYỂN */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                LỘ TRÌNH KIỆN HÀNG & MÃ VẬN ĐƠN TRUNG QUỐC
              </h3>
              <span className="text-xs text-gray-500">
                Tổng trọng lượng: <strong className="text-gray-900">{order.total_weight_kg} kg</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">Mã Vận Đơn (Tracking)</th>
                    <th className="p-3">Hãng CPN TQ</th>
                    <th className="p-3 text-center">Cân Nặng</th>
                    <th className="p-3">Trạng Thái Kiện Hàng</th>
                    <th className="p-3">Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.tracking_codes?.map((trk: any) => (
                    <tr key={trk.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold text-blue-600">
                        {trk.tracking_code}
                      </td>
                      <td className="p-3 text-gray-700">{trk.carrier_name}</td>
                      <td className="p-3 text-center font-semibold text-gray-900">{trk.weight_kg} kg</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-medium">
                          {trk.status_label || "Đã nhập kho TQ"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{trk.note || "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KHAI BÁO HẢI QUAN & ỦY THÁC NHẬP KHẨU */}
          {order.declaration && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
                <FileText className="w-4 h-4 text-purple-600" />
                THÔNG TIN KHAI BÁO HẢI QUAN CHÍNH NGẠCH
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                  <span className="text-gray-500 block">Mã Tờ Khai:</span>
                  <span className="font-bold text-purple-700">{order.declaration.ma_kb}</span>
                </div>
                <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                  <span className="text-gray-500 block">Mã HS Code:</span>
                  <span className="font-bold text-gray-800">{order.declaration.hs_code}</span>
                </div>
                <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                  <span className="text-gray-500 block">Thuế Suất NK:</span>
                  <span className="font-bold text-emerald-600">{order.declaration.tax_nk_rate}%</span>
                </div>
                <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                  <span className="text-gray-500 block">Thuế VAT Hải Quan:</span>
                  <span className="font-bold text-blue-600">{order.declaration.tax_vat_rate}%</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 italic">
                * Tên hàng khai hải quan: <strong>{order.declaration.description}</strong>. Hàng hóa được thông quan chính ngạch qua cửa khẩu Hữu Nghị / Tân Thanh.
              </p>
            </div>
          )}
        </div>

        {/* CỘT PHẢI (4 COLS): MINH BẠCH BIỂU PHÍ & THANH TOÁN */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card Bảng kê chi phí minh bạch */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <Receipt className="w-4 h-4 text-blue-600" />
              CHI TIẾT CÁC KHOẢN PHÍ ĐƠN HÀNG
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">1. Tiền hàng sản phẩm (web):</span>
                <span className="font-semibold text-gray-900">
                  {formatVND(order.total_cny * order.exchange_rate)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">2. Phí ship nội địa TQ (¥{order.fee_ship_cn_cny}):</span>
                <span className="font-semibold text-gray-900">
                  {formatVND(order.fee_ship_cn_vnd)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">3. Cước vận chuyển QT ({order.chargeable_weight_kg} kg):</span>
                <span className="font-semibold text-gray-900">
                  {formatVND(order.fee_weight)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">4. Phí dịch vụ mua hộ (2%):</span>
                <span className="font-semibold text-gray-900">
                  {formatVND(order.fee_buy)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">5. Phí kiểm đếm sản phẩm:</span>
                <span className="font-semibold text-gray-900">
                  {formatVND(order.fee_check)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">6. Phí đóng kiện gỗ chống vỡ:</span>
                <span className="font-semibold text-gray-900">
                  {formatVND(order.fee_wood)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">7. Phí bảo hiểm hàng hóa (3%):</span>
                <span className="font-semibold text-gray-900">
                  {formatVND(order.fee_insurance)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">8. Phí Ủy thác nhập khẩu (UTNK):</span>
                <span className="font-semibold text-gray-900">
                  {formatVND(order.fee_utnk)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">9. Thuế VAT hải quan:</span>
                <span className="font-semibold text-gray-900">
                  {formatVND(order.tax_vat_amount)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 bg-blue-50 px-3 rounded-lg border border-blue-200">
                <span className="text-blue-900 font-bold">TỔNG GIÁ TRỊ ĐƠN HÀNG:</span>
                <span className="text-base font-extrabold text-blue-700">
                  {formatVND(order.total_vnd)}
                </span>
              </div>
            </div>
          </div>

          {/* Card Trạng thái Thanh toán & Thao tác nạp cọc */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              THANH TOÁN ĐƠN HÀNG
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Mức cọc yêu cầu tối thiểu (70%):</span>
                <span className="font-bold text-amber-700">{formatVND(order.min_deposit_amount)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Đã thanh toán:</span>
                <span className="font-bold text-emerald-600">{formatVND(order.deposit_amount + order.paid_amount_vnd)}</span>
              </div>

              <div className="flex justify-between py-2 bg-rose-50 px-3 rounded-lg border border-rose-200">
                <span className="text-rose-800 font-bold">CÒN LẠI CẦN THANH TOÁN:</span>
                <span className="text-base font-extrabold text-rose-600">
                  {formatVND(order.remaining_amount)}
                </span>
              </div>
            </div>

            {/* Nút hành động thanh toán */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handlePayFromWallet}
                disabled={payingWallet || order.status >= 1}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm transition ${
                  order.status >= 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {payingWallet ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {order.status >= 1 ? "ĐÃ THANH TOÁN CỌC" : "THANH TOÁN CỌC QUA VÍ SỐ DƯ"}
              </button>

              <Link
                href={`/deposit?order_code=${order.order_code}&amount=${order.min_deposit_amount}`}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 transition"
              >
                <QrCode className="w-4 h-4 text-gray-600" /> QUÉT MÃ VIETQR NẠP TIỀN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
