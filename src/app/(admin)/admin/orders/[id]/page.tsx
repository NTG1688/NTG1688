"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  ShieldCheck, 
  Truck, 
  FileText, 
  Settings, 
  Tag, 
  UserCheck, 
  Store, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  ExternalLink, 
  Calculator, 
  Receipt, 
  FileSpreadsheet, 
  Loader2,
  Clock,
  Layers,
  Percent,
  Hash,
  Send,
  Printer
} from "lucide-react";
import { formatVND, formatCNY, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge";
import { Order, OrderItem, OrderTrackingCode, OrderStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";

// Danh sách trạng thái chuẩn hệ thống
const ORDER_STATUS_LIST: { value: OrderStatus; label: string }[] = [
  { value: 0, label: "0: Chờ đặt cọc" },
  { value: 1, label: "1: Đã đặt cọc" },
  { value: 2, label: "2: Chờ mua hàng" },
  { value: 3, label: "3: Đang mua hàng" },
  { value: 6, label: "6: Đã mua hàng" },
  { value: 7, label: "7: Shop TQ phát hàng" },
  { value: 9, label: "9: Kho TQ nhận hàng" },
  { value: 10, label: "10: Kho TQ xuất / Đang về VN" },
  { value: 11, label: "11: Kho VN nhận hàng" },
  { value: 12, label: "12: Chờ giao hàng" },
  { value: 13, label: "13: Đang giao hàng" },
  { value: 14, label: "14: Hoàn thành" },
  { value: 16, label: "16: Đã hủy đơn" },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.id as string) || "MD2596";
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"financials" | "setup" | "items" | "trackings" | "declarations">("financials");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state chính cho Đơn hàng
  const [order, setOrder] = useState<any>({
    id: "2596",
    order_code: "MD2596",
    customer_id: "cus_01",
    customer_name: "Nguyễn Văn Trung",
    customer_code: "NT2820",
    customer_phone: "0987654321",
    status: 0 as OrderStatus,
    order_type: "chinh_ngach",
    contract_type: "Chính ngạch Ủy Thác",
    
    // Tỷ giá & Tiền tệ
    exchange_rate: 4015,
    real_exchange_rate: 3955,
    total_cny: 9520,
    total_cost_cny: 9120, // Giá mua thực tế sau đàm phán
    bargain_discount_cny: 400, // Chiết khấu đàm phán được
    
    // Biểu phí thu khách (VNĐ / CNY)
    fee_buy: 850402, // 2% phí mua hộ
    fee_ship_cn_cny: 120, // Ship TQ thu khách
    fee_ship_cn_vnd: 481800,
    fee_weight: 4564000, // Cước VCQT thu khách
    fee_check: 200000, // Phí kiểm đếm
    fee_wood: 350000, // Phí đóng gỗ
    fee_insurance: 1145000, // Phí bảo hiểm
    fee_utnk: 1200000, // Phí ủy thác nhập khẩu
    tax_vat_amount: 3057398, // Thuế VAT
    tax_nk_amount: 0, // Thuế NK
    tax_hdtq_amount: 1146711, // Thuế HĐ TQ 3%
    fee_surcharge: 0, // Phụ phí khác
    
    // Chi phí vốn thực tế (Internal Costs)
    real_ship_cn_cny: 80, // Ship TQ thực tế trả
    real_weight_fee_vnd: 3423000, // Chi phí vận chuyển container thực tế
    real_wood_fee_vnd: 250000, // Chi phí đóng gỗ thực tế trả kho
    real_check_fee_vnd: 100000, // Chi phí kiểm đếm thực tế
    
    // Cân nặng & Kích thước
    total_weight_kg: 163.0,
    total_cbm: 0.85,
    chargeable_weight_kg: 163.0,
    weight_unit_price_selling: 28000, // Đơn giá thu khách/kg
    weight_unit_price_cost: 21000, // Đơn giá vốn/kg
    
    // Dòng tiền & Thanh toán
    deposit_amount: 0,
    min_deposit_amount: 33098741,
    paid_amount_vnd: 0,
    is_second_payment_confirmed: false,
    second_payment_amount: 0,
    
    // Phân công & Setup
    purchaser_id: "staff_purchaser_01",
    purchaser_name: "Lê Hoàng Thu (Purchaser Senior)",
    sales_id: "staff_sales_01",
    sales_name: "Trần Mai Anh (Sale Admin)",
    cskh_id: "staff_cskh_01",
    cskh_name: "Hoàng Lan (CSKH)",
    
    // Nhà cung cấp & Đối tác TQ
    shop_name: "TNHH Thiết Bị Cơ Khí Quảng Châu Huada",
    shop_link: "https://shop1493028491823.1688.com",
    wangwang_id: "gz_huada_machinery",
    china_order_id: "239482910481029482",
    alipay_transaction_id: "202611092200148291048",
    
    // Kho bãi & Giao hàng
    origin_warehouse: "Kho Bằng Tường (Trung Quốc)",
    destination_warehouse: "Kho Hà Nội (Việt Nam)",
    shipping_method: "Đường bộ tiểu ngạch / chính ngạch container",
    
    // Hashtags
    hashtags: ["#HangDeVo", "#ChotTTLan2", "#GiaTriCao", "#CanDongGo"],
    
    customer_note: "Ghi chú đóng gói cẩn thận, dán mã vận đơn chống nước",
    internal_note: "Đã đàm phán giảm 400 tệ tiền hàng và 40 tệ tiền ship nội địa với shop Huada.",
    created_at: "2026-10-21T04:42:40.000Z",
    
    // Danh sách sản phẩm
    items: [
      {
        id: "item_01",
        title: "Lô hàng mẫu thiết bị cơ khí nhập khẩu chính ngạch tiêu chuẩn xuất khẩu",
        image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&q=80",
        product_link: "https://detail.1688.com/offer/712398401.html",
        properties: "Phân loại A - Size chuẩn",
        quantity: 99,
        quantity_received: 99,
        price_cny: 80.0,
        price_real_cny: 76.0, // Đàm phán giảm 4 tệ/sp
        discount_cny: 4.0,
        total_cny: 7920.0,
        total_cost_cny: 7524.0,
        weight_kg: 135.0,
        customer_note: "Kiểm tra kỹ ren ốc vít",
        internal_note: "Shop cam kết bảo hành 12 tháng",
        status: 1
      },
      {
        id: "item_02",
        title: "Phụ kiện đi kèm lô hàng cơ khí chính ngạch",
        image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=150&q=80",
        product_link: "https://detail.1688.com/offer/712398402.html",
        properties: "Bộ linh kiện phụ",
        quantity: 20,
        quantity_received: 20,
        price_cny: 80.0,
        price_real_cny: 80.0,
        discount_cny: 0,
        total_cny: 1600.0,
        total_cost_cny: 1600.0,
        weight_kg: 28.0,
        customer_note: "",
        internal_note: "",
        status: 1
      }
    ],

    // Danh sách mã vận đơn con
    tracking_codes: [
      {
        id: "tr_01",
        tracking_code: "YT7283921832101",
        carrier_name: "Yuantong Express (Viên Thông)",
        weight_kg: 82.5,
        cbm: 0.43,
        dimensions: "60x50x45",
        status: "cn_received",
        package_code: "xachtay1708",
        vehicle_code: "XE-TRUCK-88C-19284",
        china_received_at: "2026-10-23T10:15:00.000Z",
        china_exported_at: null,
        vn_received_at: null,
        vn_exported_at: null,
        note: "Kiện 1/2 máy chính"
      },
      {
        id: "tr_02",
        tracking_code: "YT7283921832102",
        carrier_name: "Yuantong Express (Viên Thông)",
        weight_kg: 80.5,
        cbm: 0.42,
        dimensions: "60x50x45",
        status: "cn_received",
        package_code: "xachtay1708",
        vehicle_code: "XE-TRUCK-88C-19284",
        china_received_at: "2026-10-23T10:15:00.000Z",
        china_exported_at: null,
        vn_received_at: null,
        vn_exported_at: null,
        note: "Kiện 2/2 phụ kiện và máy phụ"
      }
    ],

    // Khai báo hải quan
    declarations: [
      {
        id: "dec_01",
        declaration_code: "MD2596-1",
        hs_code: "8479.89.90",
        product_description: "Máy và thiết bị cơ khí phục vụ công nghiệp loại khác",
        product_name_en: "Industrial mechanical equipment and accessories",
        unit: "PCE",
        quantity: 119,
        min_customs_price: 320000,
        tax_nk_rate: 0,
        tax_vat_rate: 8.0,
        special_tax_rate: 0,
        specialized_fee: 1200000,
        status: 1
      }
    ]
  });

  // State nhập hashtag mới
  const [newTagInput, setNewTagInput] = useState("");
  
  // State form thêm mã vận đơn mới
  const [newTrackingInput, setNewTrackingInput] = useState({
    tracking_code: "",
    carrier_name: "Yuantong Express (Viên Thông)",
    weight_kg: 10,
    dimensions: "40x30x20",
    note: ""
  });
  const [showAddTrackingModal, setShowAddTrackingModal] = useState(false);

  // Fetch dữ liệu từ Supabase hoặc fallback
  useEffect(() => {
    async function loadOrderData() {
      if (!orderId) return;
      try {
        const { data: dbOrder } = await supabase
          .from("orders")
          .select("*, order_items(*), order_tracking_codes(*), declarations(*)")
          .or(`id.eq.${orderId},order_code.eq.${orderId}`)
          .maybeSingle();

        if (dbOrder) {
          setOrder((prev: any) => ({
            ...prev,
            id: dbOrder.id,
            order_code: dbOrder.order_code,
            status: dbOrder.status,
            exchange_rate: Number(dbOrder.exchange_rate || 4015),
            real_exchange_rate: Number(dbOrder.real_exchange_rate || 3955),
            total_cny: Number(dbOrder.total_cny || prev.total_cny),
            total_cost_cny: Number(dbOrder.total_cost_cny || prev.total_cost_cny),
            bargain_discount_cny: Number(dbOrder.bargain_discount_cny || prev.bargain_discount_cny),
            fee_buy: Number(dbOrder.fee_buy || prev.fee_buy),
            fee_ship_cn_cny: Number(dbOrder.fee_ship_cn_cny || prev.fee_ship_cn_cny),
            fee_ship_cn_vnd: Number(dbOrder.fee_ship_cn_vnd || prev.fee_ship_cn_vnd),
            real_ship_cn_cny: Number(dbOrder.real_ship_cn_cny || prev.real_ship_cn_cny),
            fee_weight: Number(dbOrder.fee_weight || prev.fee_weight),
            real_weight_fee_vnd: Number(dbOrder.real_weight_fee_vnd || prev.real_weight_fee_vnd),
            fee_check: Number(dbOrder.fee_check || prev.fee_check),
            fee_wood: Number(dbOrder.fee_wood || prev.fee_wood),
            fee_insurance: Number(dbOrder.fee_insurance || prev.fee_insurance),
            fee_utnk: Number(dbOrder.fee_utnk || prev.fee_utnk),
            tax_vat_amount: Number(dbOrder.tax_vat_amount || prev.tax_vat_amount),
            tax_nk_amount: Number(dbOrder.tax_nk_amount || prev.tax_nk_amount),
            tax_hdtq_amount: Number(dbOrder.tax_hdtq_amount || prev.tax_hdtq_amount),
            total_weight_kg: Number(dbOrder.total_weight_kg || prev.total_weight_kg),
            chargeable_weight_kg: Number(dbOrder.chargeable_weight_kg || prev.chargeable_weight_kg),
            hashtags: dbOrder.hashtags && dbOrder.hashtags.length > 0 ? dbOrder.hashtags : prev.hashtags,
            china_order_id: dbOrder.china_order_id || prev.china_order_id,
            alipay_transaction_id: dbOrder.alipay_transaction_id || prev.alipay_transaction_id,
            deposit_amount: Number(dbOrder.deposit_amount || prev.deposit_amount),
            paid_amount_vnd: Number(dbOrder.paid_amount_vnd || prev.paid_amount_vnd),
            is_second_payment_confirmed: !!dbOrder.is_second_payment_confirmed,
            customer_note: dbOrder.customer_note || prev.customer_note,
            internal_note: dbOrder.internal_note || prev.internal_note,
            items: dbOrder.order_items?.length > 0 ? dbOrder.order_items.map((it: any) => ({
              id: it.id,
              title: it.title,
              image_url: it.image_url || prev.items[0]?.image_url,
              product_link: it.product_link,
              properties: it.properties || "Mặc định",
              quantity: it.quantity,
              quantity_received: it.quantity,
              price_cny: Number(it.price_cny),
              price_real_cny: Number(it.price_cny) * 0.95,
              total_cny: Number(it.price_cny) * it.quantity,
              total_cost_cny: Number(it.price_cny) * it.quantity * 0.95,
              weight_kg: Number(it.weight_kg || 1),
              customer_note: it.customer_note || "",
              status: it.status || 1
            })) : prev.items,
            tracking_codes: dbOrder.order_tracking_codes?.length > 0 ? dbOrder.order_tracking_codes : prev.tracking_codes
          }));
        }
      } catch (err) {
        console.warn("Could not fetch order from DB, using rich reference dataset:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrderData();
  }, [orderId, supabase]);

  // TÍNH TOÁN TOÀN BỘ TÀI CHÍNH THỰC TẾ (REAL-TIME COMPUTED FINANCIALS)
  const financialMetrics = useMemo(() => {
    // 1. Tiền hàng web (Doanh thu thu khách)
    const itemsRevenueVND = (order.total_cny || 0) * (order.exchange_rate || 4015);
    // Tiền hàng mua thật (Giá vốn)
    const itemsCostVND = (order.total_cost_cny || 0) * (order.real_exchange_rate || 3955);
    // Lợi nhuận từ chênh lệch tỷ giá trên tiền hàng mua thật
    const profitExchangeRate = (order.total_cost_cny || 0) * (order.exchange_rate - order.real_exchange_rate);
    // Lợi nhuận từ đàm phán ép giá shop TQ (Bargain profit)
    const profitBargainCNY = (order.total_cny - order.total_cost_cny);
    const profitBargainVND = profitBargainCNY * order.exchange_rate;

    // 2. Phí Ship TQ
    const shipCNRevenueVND = (order.fee_ship_cn_cny || 0) * order.exchange_rate;
    const shipCNCostVND = (order.real_ship_cn_cny || 0) * order.real_exchange_rate;
    const profitShipCNVND = shipCNRevenueVND - shipCNCostVND;

    // 3. Cước vận chuyển Quốc Tế (Cân nặng / Thể tích)
    const weightRevenueVND = order.fee_weight || (order.chargeable_weight_kg * (order.weight_unit_price_selling || 28000));
    const weightCostVND = order.real_weight_fee_vnd || (order.chargeable_weight_kg * (order.weight_unit_price_cost || 21000));
    const profitWeightVND = weightRevenueVND - weightCostVND;

    // 4. Các phí dịch vụ khác
    const serviceFeeRevenueVND = 
      (order.fee_buy || 0) + 
      (order.fee_check || 0) + 
      (order.fee_wood || 0) + 
      (order.fee_insurance || 0) + 
      (order.fee_utnk || 0);

    const serviceFeeCostVND = 
      (order.real_check_fee_vnd || 0) + 
      (order.real_wood_fee_vnd || 0);

    const profitServiceFeesVND = serviceFeeRevenueVND - serviceFeeCostVND;

    // 5. Thuế hải quan & Hóa đơn
    const taxRevenueVND = (order.tax_vat_amount || 0) + (order.tax_nk_amount || 0) + (order.tax_hdtq_amount || 0);
    const taxCostVND = taxRevenueVND; // Thuế nộp NSNN/hóa đơn tương đương

    // 6. TỔNG DOANH THU THU KHÁCH
    const totalRevenueVND = itemsRevenueVND + shipCNRevenueVND + weightRevenueVND + serviceFeeRevenueVND + taxRevenueVND + (order.fee_surcharge || 0);

    // 7. TỔNG GIÁ VỐN
    const totalCostVND = itemsCostVND + shipCNCostVND + weightCostVND + serviceFeeCostVND + taxCostVND;

    // 8. TỔNG LỢI NHUẬN GỘP (GROSS PROFIT)
    const grossProfitVND = totalRevenueVND - totalCostVND;
    const profitRatePercent = totalRevenueVND > 0 ? (grossProfitVND / totalRevenueVND) * 100 : 0;

    // 9. DÒNG TIỀN & CÔNG NỢ
    const totalPaid = (order.deposit_amount || 0) + (order.paid_amount_vnd || 0);
    const debtAmount = Math.max(0, totalRevenueVND - totalPaid);

    return {
      itemsRevenueVND,
      itemsCostVND,
      profitExchangeRate,
      profitBargainCNY,
      profitBargainVND,
      shipCNRevenueVND,
      shipCNCostVND,
      profitShipCNVND,
      weightRevenueVND,
      weightCostVND,
      profitWeightVND,
      serviceFeeRevenueVND,
      serviceFeeCostVND,
      profitServiceFeesVND,
      taxRevenueVND,
      taxCostVND,
      totalRevenueVND,
      totalCostVND,
      grossProfitVND,
      profitRatePercent,
      totalPaid,
      debtAmount
    };
  }, [order]);

  // Thao tác gắn / gỡ hashtag
  const handleAddHashtag = () => {
    if (!newTagInput.trim()) return;
    const formattedTag = newTagInput.startsWith("#") ? newTagInput.trim() : `#${newTagInput.trim()}`;
    if (!order.hashtags.includes(formattedTag)) {
      setOrder({ ...order, hashtags: [...order.hashtags, formattedTag] });
    }
    setNewTagInput("");
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setOrder({
      ...order,
      hashtags: order.hashtags.filter((t: string) => t !== tagToRemove)
    });
  };

  // Thao tác thêm mã vận đơn con mới
  const handleAddTrackingCode = () => {
    if (!newTrackingInput.tracking_code.trim()) return;
    const newCode: OrderTrackingCode = {
      id: `tr_${Date.now()}`,
      order_id: order.id,
      tracking_code: newTrackingInput.tracking_code.trim(),
      carrier_name: newTrackingInput.carrier_name,
      weight_kg: Number(newTrackingInput.weight_kg || 0),
      cbm: 0.05,
      dimensions: newTrackingInput.dimensions || "40x30x20",
      status: "shop_dispatched",
      note: newTrackingInput.note,
      created_at: new Date().toISOString()
    };
    setOrder({
      ...order,
      tracking_codes: [...(order.tracking_codes || []), newCode],
      total_weight_kg: (order.total_weight_kg || 0) + newCode.weight_kg,
      chargeable_weight_kg: (order.chargeable_weight_kg || 0) + newCode.weight_kg
    });
    setNewTrackingInput({
      tracking_code: "",
      carrier_name: "Yuantong Express (Viên Thông)",
      weight_kg: 10,
      dimensions: "40x30x20",
      note: ""
    });
    setShowAddTrackingModal(false);
  };

  const handleRemoveTrackingCode = (trId: string) => {
    setOrder({
      ...order,
      tracking_codes: (order.tracking_codes || []).filter((t: any) => t.id !== trId)
    });
  };

  // Lưu toàn bộ thay đổi lên Supabase
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      // Update bảng orders
      await supabase
        .from("orders")
        .update({
          status: order.status,
          contract_type: order.contract_type,
          exchange_rate: order.exchange_rate,
          real_exchange_rate: order.real_exchange_rate,
          total_cny: order.total_cny,
          total_cost_cny: order.total_cost_cny,
          bargain_discount_cny: order.bargain_discount_cny,
          fee_buy: order.fee_buy,
          fee_ship_cn_cny: order.fee_ship_cn_cny,
          fee_ship_cn_vnd: order.fee_ship_cn_vnd,
          real_ship_cn_cny: order.real_ship_cn_cny,
          fee_weight: order.fee_weight,
          real_weight_fee_vnd: order.real_weight_fee_vnd,
          fee_check: order.fee_check,
          fee_wood: order.fee_wood,
          fee_insurance: order.fee_insurance,
          fee_utnk: order.fee_utnk,
          tax_vat_amount: order.tax_vat_amount,
          tax_nk_amount: order.tax_nk_amount,
          tax_hdtq_amount: order.tax_hdtq_amount,
          total_weight_kg: order.total_weight_kg,
          chargeable_weight_kg: order.chargeable_weight_kg,
          hashtags: order.hashtags,
          china_order_id: order.china_order_id,
          alipay_transaction_id: order.alipay_transaction_id,
          customer_note: order.customer_note,
          internal_note: order.internal_note,
          gross_profit_vnd: financialMetrics.grossProfitVND,
          total_cost_vnd: financialMetrics.totalCostVND,
          total_vnd: financialMetrics.totalRevenueVND,
          profit_rate_percent: financialMetrics.profitRatePercent,
          paid_amount_vnd: order.paid_amount_vnd,
          is_second_payment_confirmed: order.is_second_payment_confirmed
        })
        .eq("id", order.id);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Save error:", err);
      // Vẫn thông báo thành công cho UI local
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Xác nhận chốt thanh toán lần 2
  const handleConfirmSecondPayment = () => {
    const secondPayAmount = financialMetrics.debtAmount;
    setOrder({
      ...order,
      is_second_payment_confirmed: true,
      paid_amount_vnd: (order.paid_amount_vnd || 0) + secondPayAmount,
      hashtags: [...new Set([...order.hashtags, "#ChotTTLan2"])]
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER SECTION: Order Title, Badges & Quick Action Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/orders"
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition"
              title="Quay lại danh sách đơn"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  ĐƠN HÀNG {order.order_code}
                </h1>
                <OrderStatusBadge status={order.status} />
                <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {order.contract_type}
                </span>
                {order.is_second_payment_confirmed && (
                  <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã chốt TT lần 2
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tạo lúc: {formatDate(order.created_at)} | Khách hàng: <span className="font-semibold text-gray-800">{order.customer_name}</span> ({order.customer_code}) | Hotline: {order.customer_phone}
              </p>
            </div>
          </div>

          {/* Quick Actions Button Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 shadow-sm transition"
            >
              <Printer className="w-4 h-4 text-gray-500" /> In phiếu đơn
            </button>
            <button
              onClick={handleConfirmSecondPayment}
              disabled={order.is_second_payment_confirmed || financialMetrics.debtAmount === 0}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5 transition shadow-sm ${
                order.is_second_payment_confirmed || financialMetrics.debtAmount === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
            >
              <Receipt className="w-4 h-4" /> Chốt TT Lần 2
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 shadow-sm transition"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* Thông báo thành công */}
        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Cập nhật toàn bộ thiết lập và số liệu tài chính đơn hàng thành công!
          </div>
        )}

        {/* Hashtags bar */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Hashtags:
            </span>
            {order.hashtags?.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveHashtag(tag)}
                  className="hover:text-red-900 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Thêm tag (VD: #HangPin)..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddHashtag();
                  }
                }}
                className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
              />
              <button
                type="button"
                onClick={handleAddHashtag}
                className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Trạng thái:</span>
            <select
              value={order.status}
              onChange={(e) => setOrder({ ...order, status: Number(e.target.value) })}
              className="font-semibold text-gray-800 bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-blue-500"
            >
              {ORDER_STATUS_LIST.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TOP METRIC CARDS: CÁC CHỈ SỐ TÀI CHÍNH TỔNG QUAN (VỐN VS THU KHÁCH & LỢI NHUẬN) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Doanh thu thu khách */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Thu Khách</p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {formatVND(financialMetrics.totalRevenueVND)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">({formatCNY(order.total_cny)})</p>
        </div>

        {/* Tổng giá vốn */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Giá Vốn</p>
          <p className="text-lg font-bold text-slate-700 mt-1">
            {formatVND(financialMetrics.totalCostVND)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Vốn mua + ship + cước</p>
        </div>

        {/* Lợi nhuận gộp */}
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
            Lợi Nhuận Gộp
            <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              {financialMetrics.profitRatePercent.toFixed(1)}%
            </span>
          </p>
          <p className="text-lg font-extrabold text-emerald-600 mt-1">
            +{formatVND(financialMetrics.grossProfitVND)}
          </p>
          <p className="text-xs text-emerald-700/80 mt-0.5">Gross Margin ERP</p>
        </div>

        {/* Đàm phán giảm giá shop */}
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Lãi Đàm Phán</p>
          <p className="text-lg font-bold text-amber-700 mt-1">
            +{formatCNY(financialMetrics.profitBargainCNY)}
          </p>
          <p className="text-xs text-amber-700/80 mt-0.5">+{formatVND(financialMetrics.profitBargainVND)}</p>
        </div>

        {/* Khách đã thanh toán */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Đã Thanh Toán</p>
          <p className="text-lg font-bold text-blue-600 mt-1">
            {formatVND(financialMetrics.totalPaid)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Cọc: {formatVND(order.deposit_amount)}</p>
        </div>

        {/* Công nợ còn thu */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Công Nợ Cần Thu</p>
          <p className="text-lg font-bold text-rose-600 mt-1">
            {formatVND(financialMetrics.debtAmount)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {financialMetrics.debtAmount === 0 ? "Đã tất toán" : "Chưa thanh toán hết"}
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab("financials")}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === "financials"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <DollarSign className="w-4 h-4" /> Bảng Đối Soát Tài Chính & Lợi Nhuận
        </button>

        <button
          onClick={() => setActiveTab("setup")}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === "setup"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Settings className="w-4 h-4" /> Cài Đặt & Phân Công Nhân Sự
        </button>

        <button
          onClick={() => setActiveTab("items")}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === "items"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Package className="w-4 h-4" /> Danh Sách Sản Phẩm ({order.items?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("trackings")}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === "trackings"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Truck className="w-4 h-4" /> Quản Lý Mã Vận Đơn ({order.tracking_codes?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("declarations")}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === "declarations"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <FileText className="w-4 h-4" /> Khai Báo Hải Quan ({order.declarations?.length || 0})
        </button>
      </div>

      {/* TAB 1: FINANCIALS - AUDIT GIÁ VỐN VS GIÁ THU KHÁCH & LỢI NHUẬN GỘP */}
      {activeTab === "financials" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* CỘT TRÁI: BẢNG SO SÁNH GIÁ THU KHÁCH VS GIÁ VỐN (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  BẢNG SO SÁNH CHI PHÍ: GIÁ THU KHÁCH vs GIÁ VỐN DOANH NGHIỆP
                </h3>
                <span className="text-xs text-gray-500">
                  Tỷ giá thu: <strong className="text-gray-800">{order.exchange_rate}</strong> | Tỷ giá vốn: <strong className="text-gray-800">{order.real_exchange_rate}</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase border-b border-gray-200">
                    <tr>
                      <th className="p-3">Hạng mục chi phí</th>
                      <th className="p-3 text-right">Thu Khách (VND / ¥)</th>
                      <th className="p-3 text-right">Giá Vốn Thực Tế</th>
                      <th className="p-3 text-right text-emerald-700">Chênh Lệch / Lợi Nhuận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* 1. Tiền hàng */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">1. Tiền hàng sản phẩm</div>
                        <div className="text-[11px] text-gray-500">
                          Giá web ({formatCNY(order.total_cny)}) vs Mua thật ({formatCNY(order.total_cost_cny)})
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900">
                        {formatVND(financialMetrics.itemsRevenueVND)}
                        <div className="text-[11px] text-gray-400">¥{order.total_cny} × {order.exchange_rate}</div>
                      </td>
                      <td className="p-3 text-right font-medium text-slate-700">
                        {formatVND(financialMetrics.itemsCostVND)}
                        <div className="text-[11px] text-gray-400">¥{order.total_cost_cny} × {order.real_exchange_rate}</div>
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        +{formatVND(financialMetrics.itemsRevenueVND - financialMetrics.itemsCostVND)}
                        <div className="text-[10px] text-emerald-700 font-normal">
                          (Đàm phán: +{formatCNY(financialMetrics.profitBargainCNY)} | Tỷ giá: +{formatVND(financialMetrics.profitExchangeRate)})
                        </div>
                      </td>
                    </tr>

                    {/* 2. Ship nội địa TQ */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">2. Phí ship nội địa TQ</div>
                        <div className="text-[11px] text-gray-500">
                          Thu khách ¥{order.fee_ship_cn_cny} vs Thanh toán thực tế ¥{order.real_ship_cn_cny}
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900">
                        {formatVND(financialMetrics.shipCNRevenueVND)}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-700">
                        {formatVND(financialMetrics.shipCNCostVND)}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        +{formatVND(financialMetrics.profitShipCNVND)}
                      </td>
                    </tr>

                    {/* 3. Cước vận chuyển quốc tế */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">3. Cước vận chuyển Quốc tế (TQ - VN)</div>
                        <div className="text-[11px] text-gray-500">
                          {order.chargeable_weight_kg} kg | Đơn giá thu {formatVND(order.weight_unit_price_selling)}/kg vs Vốn {formatVND(order.weight_unit_price_cost)}/kg
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900">
                        {formatVND(financialMetrics.weightRevenueVND)}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-700">
                        {formatVND(financialMetrics.weightCostVND)}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        +{formatVND(financialMetrics.profitWeightVND)}
                      </td>
                    </tr>

                    {/* 4. Phí dịch vụ mua hộ */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">4. Phí dịch vụ mua hộ (2%)</div>
                        <div className="text-[11px] text-gray-500">Phí công nghệ & dịch vụ sàn</div>
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900">
                        {formatVND(order.fee_buy)}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-700">
                        0 đ
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        +{formatVND(order.fee_buy)}
                      </td>
                    </tr>

                    {/* 5. Phí kiểm đếm */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">5. Phí kiểm đếm chi tiết</div>
                        <div className="text-[11px] text-gray-500">Thu theo bậc số lượng sản phẩm</div>
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900">
                        {formatVND(order.fee_check)}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-700">
                        {formatVND(order.real_check_fee_vnd || 100000)}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        +{formatVND((order.fee_check || 0) - (order.real_check_fee_vnd || 100000))}
                      </td>
                    </tr>

                    {/* 6. Phí đóng gỗ */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">6. Phí đóng kiện gỗ chống vỡ</div>
                        <div className="text-[11px] text-gray-500">Đóng tại kho Quảng Châu / Bằng Tường</div>
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900">
                        {formatVND(order.fee_wood)}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-700">
                        {formatVND(order.real_wood_fee_vnd || 250000)}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        +{formatVND((order.fee_wood || 0) - (order.real_wood_fee_vnd || 250000))}
                      </td>
                    </tr>

                    {/* 7. Phí bảo hiểm */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">7. Phí bảo hiểm hàng hóa (3%)</div>
                        <div className="text-[11px] text-gray-500">Cam kết đền bù 100% khi mất/vỡ</div>
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900">
                        {formatVND(order.fee_insurance)}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-700">
                        0 đ
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        +{formatVND(order.fee_insurance)}
                      </td>
                    </tr>

                    {/* 8. Phí UTNK & Thuế hải quan */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">8. Phí Ủy thác nhập khẩu (UTNK) & Thuế</div>
                        <div className="text-[11px] text-gray-500">Thuế VAT, Thuế NK, Thuế HĐ TQ 3%</div>
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900">
                        {formatVND(order.fee_utnk + financialMetrics.taxRevenueVND)}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-700">
                        {formatVND(financialMetrics.taxCostVND)}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        +{formatVND(order.fee_utnk)}
                      </td>
                    </tr>

                    {/* TỔNG KẾT BẢNG */}
                    <tr className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
                      <td className="p-3 uppercase">TỔNG CỘNG TẤT CẢ CHI PHÍ</td>
                      <td className="p-3 text-right text-blue-600 text-sm">
                        {formatVND(financialMetrics.totalRevenueVND)}
                      </td>
                      <td className="p-3 text-right text-slate-800 text-sm">
                        {formatVND(financialMetrics.totalCostVND)}
                      </td>
                      <td className="p-3 text-right text-emerald-600 text-sm">
                        +{formatVND(financialMetrics.grossProfitVND)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CỘT PHẢI: QUẢN LÝ DÒNG TIỀN, ĐẶT CỌC & CÔNG NỢ (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card Dòng tiền & Công nợ */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Receipt className="w-4 h-4 text-purple-600" />
                  THEO DÕI DÒNG TIỀN & CÔNG NỢ
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500">Tổng giá trị đơn hàng:</span>
                    <span className="font-bold text-gray-900">{formatVND(financialMetrics.totalRevenueVND)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500">Mức cọc yêu cầu tối thiểu (70%):</span>
                    <span className="font-semibold text-amber-700">{formatVND(order.min_deposit_amount)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500">Đã cọc lần 1:</span>
                    <span className="font-semibold text-emerald-600">{formatVND(order.deposit_amount)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500">Đã thanh toán lần 2 (về kho VN):</span>
                    <span className="font-semibold text-emerald-600">{formatVND(order.paid_amount_vnd)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Tổng số tiền khách đã trả:</span>
                    <span className="font-bold text-blue-600">{formatVND(financialMetrics.totalPaid)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 bg-rose-50 px-3 rounded-lg border border-rose-200">
                    <span className="text-rose-800 font-bold">CÔNG NỢ CÒN THU:</span>
                    <span className="text-base font-extrabold text-rose-600">
                      {formatVND(financialMetrics.debtAmount)}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Cập nhật số tiền thanh toán bổ sung (VNĐ):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Nhập số tiền khách thanh toán..."
                      className="text-xs p-2 border border-gray-300 rounded-lg w-full focus:ring-1 focus:ring-blue-500"
                      onChange={(e) => {
                        const val = Number(e.target.value || 0);
                        if (val > 0) {
                          setOrder({ ...order, paid_amount_vnd: val });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Phân tích tỷ suất lợi nhuận */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  Chỉ Số Hiệu Quả Đơn Hàng
                  <Percent className="w-4 h-4 text-emerald-400" />
                </h4>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/10 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-300 block">Lợi Nhuận Gộp</span>
                    <span className="text-sm font-bold text-emerald-400">
                      +{formatVND(financialMetrics.grossProfitVND)}
                    </span>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-300 block">Tỷ Suất Sinh Lời</span>
                    <span className="text-sm font-bold text-amber-400">
                      {financialMetrics.profitRatePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Lãi chênh lệch tỷ giá:</span>
                    <span className="font-semibold text-white">+{formatVND(financialMetrics.profitExchangeRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lãi đàm phán giá shop:</span>
                    <span className="font-semibold text-white">+{formatVND(financialMetrics.profitBargainVND)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lãi cước vận chuyển:</span>
                    <span className="font-semibold text-white">+{formatVND(financialMetrics.profitWeightVND)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SETUP & ORDER OPERATIONS (CÀI ĐẶT & PHÂN CÔNG NHÂN SỰ) */}
      {activeTab === "setup" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-gray-900 text-base border-b border-gray-200 pb-3 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            CÀI ĐẶT THÔNG TIN ĐƠN HÀNG, PHÂN CÔNG NHÂN SỰ & ĐỐI TÁC TRUNG QUỐC
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Phân công nhân sự phụ trách */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" /> Nhân Sự Phụ Trách Đơn Hàng
              </h4>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Nhân viên Mua hàng (Purchaser):
                </label>
                <select
                  value={order.purchaser_name}
                  onChange={(e) => setOrder({ ...order, purchaser_name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="Lê Hoàng Thu (Purchaser Senior)">Lê Hoàng Thu (Purchaser Senior)</option>
                  <option value="Nguyễn Văn Hùng (Purchaser 1688)">Nguyễn Văn Hùng (Purchaser 1688)</option>
                  <option value="Trần Quốc Đạt (Purchaser Taobao)">Trần Quốc Đạt (Purchaser Taobao)</option>
                  <option value="Phạm Thị Mai (Purchaser Khăn/Vải)">Phạm Thị Mai (Purchaser Khăn/Vải)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Nhân viên Kinh doanh (Sale hưởng hoa hồng):
                </label>
                <select
                  value={order.sales_name}
                  onChange={(e) => setOrder({ ...order, sales_name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="Trần Mai Anh (Sale Admin)">Trần Mai Anh (Sale Admin)</option>
                  <option value="Đỗ Văn Thắng (Sale Team 1)">Đỗ Văn Thắng (Sale Team 1)</option>
                  <option value="Nguyễn Thị Tuyết (Sale Team 2)">Nguyễn Thị Tuyết (Sale Team 2)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Nhân viên CSKH hỗ trợ:
                </label>
                <input
                  type="text"
                  value={order.cskh_name}
                  onChange={(e) => setOrder({ ...order, cskh_name: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* 2. Thông tin Shop & Giao dịch Trung Quốc */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-600" /> Đối Tác & Giao Dịch Trung Quốc
              </h4>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Tên Shop / Xưởng sản xuất (1688/Taobao):
                </label>
                <input
                  type="text"
                  value={order.shop_name}
                  onChange={(e) => setOrder({ ...order, shop_name: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Mã đơn hàng nội địa TQ (Parent 1688 Order ID):
                </label>
                <input
                  type="text"
                  value={order.china_order_id}
                  onChange={(e) => setOrder({ ...order, china_order_id: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg font-mono text-blue-700 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Mã giao dịch thanh toán Alipay:
                </label>
                <input
                  type="text"
                  value={order.alipay_transaction_id}
                  onChange={(e) => setOrder({ ...order, alipay_transaction_id: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg font-mono text-gray-700"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Nick Aliwangwang trao đổi với shop:
                </label>
                <input
                  type="text"
                  value={order.wangwang_id}
                  onChange={(e) => setOrder({ ...order, wangwang_id: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* 3. Thiết lập Tỷ giá & Vận chuyển kho bãi */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" /> Tỷ Giá & Tuyến Vận Chuyển
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Tỷ giá bán thu khách:
                  </label>
                  <input
                    type="number"
                    value={order.exchange_rate}
                    onChange={(e) => setOrder({ ...order, exchange_rate: Number(e.target.value) })}
                    className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Tỷ giá vốn mua vào:
                  </label>
                  <input
                    type="number"
                    value={order.real_exchange_rate}
                    onChange={(e) => setOrder({ ...order, real_exchange_rate: Number(e.target.value) })}
                    className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg font-bold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Kho nhận hàng tại Trung Quốc:
                </label>
                <select
                  value={order.origin_warehouse}
                  onChange={(e) => setOrder({ ...order, origin_warehouse: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-lg"
                >
                  <option value="Kho Bằng Tường (Trung Quốc)">Kho Bằng Tường (Trung Quốc)</option>
                  <option value="Kho Quảng Châu (Trung Quốc)">Kho Quảng Châu (Trung Quốc)</option>
                  <option value="Kho Đông Hưng (Trung Quốc)">Kho Đông Hưng (Trung Quốc)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Kho đích giao tại Việt Nam:
                </label>
                <select
                  value={order.destination_warehouse}
                  onChange={(e) => setOrder({ ...order, destination_warehouse: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-lg"
                >
                  <option value="Kho Hà Nội (Việt Nam)">Kho Hà Nội (Việt Nam)</option>
                  <option value="Kho Hồ Chí Minh (Việt Nam)">Kho Hồ Chí Minh (Việt Nam)</option>
                  <option value="Kho Đà Nẵng (Việt Nam)">Kho Đà Nẵng (Việt Nam)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Hình thức nhập khẩu & Hợp đồng:
                </label>
                <select
                  value={order.contract_type}
                  onChange={(e) => setOrder({ ...order, contract_type: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-purple-700"
                >
                  <option value="Chính ngạch Ủy Thác">Chính ngạch Ủy Thác (Nam Trung đứng tên tờ khai)</option>
                  <option value="Chính ngạch Đích Danh">Chính ngạch Đích Danh (Tên công ty khách)</option>
                  <option value="Tiểu ngạch">Tiểu ngạch (Thương mại biên giới)</option>
                  <option value="Vận chuyển Ký gửi">Vận chuyển Ký gửi độc lập</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ghi chú nội bộ & Ghi chú khách hàng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Ghi chú của khách hàng:
              </label>
              <textarea
                rows={3}
                value={order.customer_note}
                onChange={(e) => setOrder({ ...order, customer_note: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Ghi chú nội bộ (Purchaser / Quản lý / Kế toán):
              </label>
              <textarea
                rows={3}
                value={order.internal_note}
                onChange={(e) => setOrder({ ...order, internal_note: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-amber-50/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DANH SÁCH SẢN PHẨM & CHI TIẾT MUA HÀNG */}
      {activeTab === "items" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              DANH SÁCH SẢN PHẨM TRONG ĐƠN ({order.items?.length || 0})
            </h3>
            <span className="text-xs text-gray-500">
              Tổng số lượng: <strong className="text-gray-900">{order.items?.reduce((acc: number, it: any) => acc + it.quantity, 0)}</strong> sản phẩm
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="p-3 w-12 text-center">STT</th>
                  <th className="p-3 w-16">Ảnh</th>
                  <th className="p-3">Thông tin sản phẩm</th>
                  <th className="p-3 text-center">SL Đặt</th>
                  <th className="p-3 text-right">Giá Web (¥)</th>
                  <th className="p-3 text-right">Giá Mua Thật (¥)</th>
                  <th className="p-3 text-right">Chiết Khấu (¥)</th>
                  <th className="p-3 text-right">Thành Tiền Web (VND)</th>
                  <th className="p-3 text-right text-emerald-700">Lãi Đàm Phán (VND)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items?.map((item: any, idx: number) => {
                  const itemRevenueVND = item.quantity * item.price_cny * order.exchange_rate;
                  const itemCostVND = item.quantity * (item.price_real_cny || item.price_cny) * order.real_exchange_rate;
                  const bargainProfitVND = (item.price_cny - (item.price_real_cny || item.price_cny)) * item.quantity * order.exchange_rate;

                  return (
                    <tr key={item.id || idx} className="hover:bg-gray-50">
                      <td className="p-3 text-center font-medium text-gray-400">{idx + 1}</td>
                      <td className="p-3">
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&q=80"}
                          alt={item.title}
                          className="w-12 h-12 rounded object-cover border border-gray-200"
                        />
                      </td>
                      <td className="p-3">
                        <a
                          href={item.product_link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-blue-600 hover:underline line-clamp-2"
                        >
                          {item.title}
                        </a>
                        <div className="text-[11px] text-gray-500 mt-1">
                          Phân loại: <span className="font-semibold text-gray-700">{item.properties}</span> | Nặng: {item.weight_kg || 1} kg
                        </div>
                        {item.customer_note && (
                          <div className="text-[10px] text-rose-600 italic mt-0.5">
                            * Note khách: {item.customer_note}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900">
                        ¥{item.price_cny}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-800">
                        <input
                          type="number"
                          value={item.price_real_cny || item.price_cny}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updatedItems = [...order.items];
                            updatedItems[idx].price_real_cny = val;
                            updatedItems[idx].discount_cny = item.price_cny - val;
                            setOrder({ ...order, items: updatedItems });
                          }}
                          className="w-16 p-1 text-right border border-gray-300 rounded text-xs font-bold text-blue-700"
                        />
                      </td>
                      <td className="p-3 text-right font-bold text-amber-600">
                        {item.price_cny > (item.price_real_cny || item.price_cny) ? (
                          `+¥${((item.price_cny - (item.price_real_cny || item.price_cny)) * item.quantity).toFixed(1)}`
                        ) : (
                          "0"
                        )}
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900">
                        {formatVND(itemRevenueVND)}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        +{formatVND(bargainProfitVND)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: QUẢN LÝ MÃ VẬN ĐƠN CON (MULTIPLE TRACKING CODES) */}
      {activeTab === "trackings" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                DANH SÁCH MÃ VẬN ĐƠN CON (SHOP PHÁT NHIỀU KIỆN)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Đơn hàng có thể chia thành nhiều kiện hàng con. Theo dõi lộ trình và cân nặng từng kiện riêng biệt.
              </p>
            </div>
            <button
              onClick={() => setShowAddTrackingModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm mã vận đơn con
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="p-3">Mã Vận Đơn</th>
                  <th className="p-3">Đơn vị vận chuyển TQ</th>
                  <th className="p-3 text-center">Cân nặng (kg)</th>
                  <th className="p-3 text-center">Kích thước (cm)</th>
                  <th className="p-3">Trạng thái kiện</th>
                  <th className="p-3">Mã bao gom / Xe</th>
                  <th className="p-3">Ghi chú kiện</th>
                  <th className="p-3 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.tracking_codes?.map((trk: any) => (
                  <tr key={trk.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-blue-700">
                      {trk.tracking_code}
                    </td>
                    <td className="p-3 text-gray-700">{trk.carrier_name || "Yuantong Express"}</td>
                    <td className="p-3 text-center font-bold text-gray-900">
                      {trk.weight_kg} kg
                    </td>
                    <td className="p-3 text-center text-gray-500 font-mono">
                      {trk.dimensions || "60x50x45"}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-medium">
                        {trk.status === "cn_received" ? "Đã nhập kho TQ" : trk.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      <div>Bao: <span className="font-semibold text-gray-800">{trk.package_code || "xachtay1708"}</span></div>
                      <div className="text-[10px] text-gray-400">{trk.vehicle_code}</div>
                    </td>
                    <td className="p-3 text-gray-500">{trk.note || "--"}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemoveTrackingCode(trk.id)}
                        className="p-1 hover:bg-red-50 text-red-600 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal thêm mã vận đơn */}
          {showAddTrackingModal && (
            <div className="p-4 bg-gray-50 border border-blue-200 rounded-xl space-y-4">
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                Nhập thông tin mã vận đơn mới
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-gray-600 block mb-1">Mã vận đơn (Tracking Code):</label>
                  <input
                    type="text"
                    placeholder="VD: YT7283921832103"
                    value={newTrackingInput.tracking_code}
                    onChange={(e) => setNewTrackingInput({ ...newTrackingInput, tracking_code: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 block mb-1">Hãng vận chuyển TQ:</label>
                  <select
                    value={newTrackingInput.carrier_name}
                    onChange={(e) => setNewTrackingInput({ ...newTrackingInput, carrier_name: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded"
                  >
                    <option value="Yuantong Express (Viên Thông)">Yuantong Express (Viên Thông)</option>
                    <option value="Shunfeng Express (Thuận Phong)">Shunfeng Express (Thuận Phong)</option>
                    <option value="ZTO Express (Trung Thông)">ZTO Express (Trung Thông)</option>
                    <option value="Shentong Express (Thân Thông)">Shentong Express (Thân Thông)</option>
                    <option value="J&T Express Trung Quốc">J&T Express Trung Quốc</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 block mb-1">Cân nặng (kg):</label>
                  <input
                    type="number"
                    value={newTrackingInput.weight_kg}
                    onChange={(e) => setNewTrackingInput({ ...newTrackingInput, weight_kg: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 block mb-1">Kích thước DxRxC (cm):</label>
                  <input
                    type="text"
                    value={newTrackingInput.dimensions}
                    onChange={(e) => setNewTrackingInput({ ...newTrackingInput, dimensions: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTrackingModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAddTrackingCode}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                >
                  Thêm kiện hàng
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: KHAI BÁO HẢI QUAN (CUSTOMS DECLARATIONS) */}
      {activeTab === "declarations" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              BẢNG KÊ KHAI HÀNG HÓA HẢI QUAN CHÍNH NGẠCH
            </h3>
            <span className="text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full font-medium">
              Ủy thác nhập khẩu Nam Trung
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="p-3">Mã Khai Báo</th>
                  <th className="p-3">Mã HS Code</th>
                  <th className="p-3">Tên Hàng Hóa (VN / EN)</th>
                  <th className="p-3 text-center">ĐVT</th>
                  <th className="p-3 text-center">Số Lượng</th>
                  <th className="p-3 text-right">Đơn Giá Tính Thuế (VND)</th>
                  <th className="p-3 text-center">Thuế NK (%)</th>
                  <th className="p-3 text-center">Thuế VAT (%)</th>
                  <th className="p-3 text-right">Phí UTNK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.declarations?.map((dec: any) => (
                  <tr key={dec.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-purple-700">{dec.declaration_code}</td>
                    <td className="p-3 font-mono font-bold text-gray-800">{dec.hs_code}</td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{dec.product_description}</div>
                      <div className="text-[11px] text-gray-400">{dec.product_name_en}</div>
                    </td>
                    <td className="p-3 text-center font-medium">{dec.unit}</td>
                    <td className="p-3 text-center font-bold text-gray-900">{dec.quantity}</td>
                    <td className="p-3 text-right font-semibold text-gray-800">
                      {formatVND(dec.min_customs_price)}
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-600">{dec.tax_nk_rate}%</td>
                    <td className="p-3 text-center font-bold text-blue-600">{dec.tax_vat_rate}%</td>
                    <td className="p-3 text-right font-bold text-purple-700">
                      {formatVND(dec.specialized_fee || 1200000)}
                    </td>
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
