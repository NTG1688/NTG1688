"use client";

import { OrderStatus } from "@/types";
import { createClient } from "@/lib/supabase/client";

export interface StoredOrderItem {
  id: string;
  order_id: string;
  title: string;
  image_url: string;
  product_link?: string;
  link?: string;
  shop_name?: string;
  shop_id?: string;
  properties: string;
  quantity: number;
  quantity_received: number;
  price_cny: number;
  price_real_cny: number; // Giá mua thật sau đàm phán
  discount_cny: number;
  total_cny: number;
  total_cost_cny: number;
  weight_kg: number;
  customer_note: string;
  internal_note: string;
  status: number;
}

export interface StoredTrackingCode {
  id: string;
  order_id: string;
  tracking_code: string;
  carrier_name: string;
  weight_kg: number;
  cbm: number;
  dimensions: string;
  status: "shop_dispatched" | "cn_received" | "cn_exported" | "vn_received" | "vn_exported" | "delivered";
  package_code: string;
  vehicle_code: string;
  china_received_at?: string | null;
  china_exported_at?: string | null;
  vn_received_at?: string | null;
  vn_exported_at?: string | null;
  note: string;
  created_at: string;
}

export interface StoredDeclaration {
  id: string;
  order_id: string;
  declaration_code: string;
  hs_code: string;
  product_description: string;
  product_name_en: string;
  unit: string;
  quantity: number;
  min_customs_price: number;
  tax_nk_rate: number;
  tax_vat_rate: number;
  special_tax_rate: number;
  specialized_fee: number;
  status: number;
}

export interface StoredOrder {
  id: string;
  order_code: string;
  customer_id: string;
  customer_name: string;
  customer_code: string;
  customer_phone: string;
  status: OrderStatus;
  order_type: "order" | "deposit" | "chinh_ngach";
  contract_type: string;

  // Tỷ giá
  exchange_rate: number;
  real_exchange_rate: number;

  // Tiền hàng
  total_cny: number;
  total_cost_cny: number;
  bargain_discount_cny: number;
  total_vnd: number;
  total_cost_vnd: number;
  gross_profit_vnd: number;
  profit_rate_percent: number;

  // Biểu phí thu khách
  fee_buy: number;
  fee_ship_cn_cny: number;
  fee_ship_cn_vnd: number;
  fee_weight: number;
  fee_check: number;
  fee_wood: number;
  fee_insurance: number;
  fee_utnk: number;
  tax_vat_amount: number;
  tax_nk_amount: number;
  tax_hdtq_amount: number;
  fee_surcharge: number;

  // Chi phí vốn thực tế
  real_ship_cn_cny: number;
  real_ship_cn_vnd: number;
  real_weight_fee_vnd: number;
  real_wood_fee_vnd: number;
  real_check_fee_vnd: number;

  // Vận chuyển & Cân nặng
  total_weight_kg: number;
  total_cbm: number;
  chargeable_weight_kg: number;
  weight_unit_price_selling: number;
  weight_unit_price_cost: number;

  // Dòng tiền & Công nợ
  deposit_amount: number;
  min_deposit_amount: number;
  paid_amount_vnd: number;
  remaining_amount: number;
  is_second_payment_confirmed: boolean;
  second_payment_amount: number;

  // Phân công & Đối tác
  purchaser_id: string;
  purchaser_name: string;
  sales_id: string;
  sales_name: string;
  cskh_id: string;
  cskh_name: string;

  shop_name: string;
  shop_link: string;
  wangwang_id: string;
  china_order_id: string;
  alipay_transaction_id: string;

  origin_warehouse: string;
  destination_warehouse: string;
  shipping_method: string;

  hashtags: string[];
  customer_note: string;
  internal_note: string;
  created_at: string;
  updated_at: string;

  items: StoredOrderItem[];
  tracking_codes: StoredTrackingCode[];
  declarations: StoredDeclaration[];
}

const STORAGE_KEY = "NTG1688_ERP_ORDERS_STORE_V2";

// DỮ LIỆU GỐC 10 ĐƠN HÀNG THỰC TẾ CHI TIẾT TỪ AUTO_GEMINI
const INITIAL_ORDERS_DATA: StoredOrder[] = [
  {
    id: "MD2596",
    order_code: "MD2596",
    customer_id: "cus_01",
    customer_name: "Nguyễn Văn Trung",
    customer_code: "NT2820",
    customer_phone: "0987654321",
    status: 0,
    order_type: "chinh_ngach",
    contract_type: "Chính ngạch Ủy Thác",
    exchange_rate: 4015,
    real_exchange_rate: 3955,
    total_cny: 9520,
    total_cost_cny: 9120,
    bargain_discount_cny: 400,
    total_vnd: 42520111,
    total_cost_vnd: 36069900,
    gross_profit_vnd: 6450211,
    profit_rate_percent: 15.2,
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
    fee_surcharge: 0,
    real_ship_cn_cny: 80,
    real_ship_cn_vnd: 316400,
    real_weight_fee_vnd: 3423000,
    real_wood_fee_vnd: 250000,
    real_check_fee_vnd: 100000,
    total_weight_kg: 163.0,
    total_cbm: 0.85,
    chargeable_weight_kg: 163.0,
    weight_unit_price_selling: 28000,
    weight_unit_price_cost: 21000,
    deposit_amount: 0,
    min_deposit_amount: 33098741,
    paid_amount_vnd: 0,
    remaining_amount: 42520111,
    is_second_payment_confirmed: false,
    second_payment_amount: 0,
    purchaser_id: "staff_purchaser_01",
    purchaser_name: "Lê Hoàng Thu (Purchaser Senior)",
    sales_id: "staff_sales_01",
    sales_name: "Trần Mai Anh (Sale Admin)",
    cskh_id: "staff_cskh_01",
    cskh_name: "Hoàng Lan (CSKH)",
    shop_name: "TNHH Thiết Bị Cơ Khí Quảng Châu Huada",
    shop_link: "https://shop1493028491823.1688.com",
    wangwang_id: "gz_huada_machinery",
    china_order_id: "239482910481029482",
    alipay_transaction_id: "202611092200148291048",
    origin_warehouse: "Kho Bằng Tường (Trung Quốc)",
    destination_warehouse: "Kho Hà Nội (Việt Nam)",
    shipping_method: "Đường bộ container",
    hashtags: ["#HangDeVo", "#ChotTTLan2", "#GiaTriCao", "#CanDongGo"],
    customer_note: "Ghi chú đóng gói cẩn thận, dán mã vận đơn chống nước",
    internal_note: "Đã đàm phán giảm 400 tệ tiền hàng và 40 tệ tiền ship nội địa với shop Huada.",
    created_at: "2026-10-21T04:42:40.000Z",
    updated_at: "2026-10-21T04:42:40.000Z",
    items: [
      {
        id: "item_2596_1",
        order_id: "MD2596",
        title: "Lô hàng mẫu thiết bị cơ khí nhập khẩu chính ngạch tiêu chuẩn xuất khẩu",
        image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&q=80",
        product_link: "https://detail.1688.com/offer/712398401.html",
        properties: "Phân loại A - Size chuẩn",
        quantity: 99,
        quantity_received: 99,
        price_cny: 80.0,
        price_real_cny: 76.0,
        discount_cny: 4.0,
        total_cny: 7920.0,
        total_cost_cny: 7524.0,
        weight_kg: 135.0,
        customer_note: "Kiểm tra kỹ ren ốc vít",
        internal_note: "Shop cam kết bảo hành 12 tháng",
        status: 1
      },
      {
        id: "item_2596_2",
        order_id: "MD2596",
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
    tracking_codes: [
      {
        id: "tr_2596_1",
        order_id: "MD2596",
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
        note: "Kiện 1/2 máy chính",
        created_at: "2026-10-22T08:00:00.000Z"
      },
      {
        id: "tr_2596_2",
        order_id: "MD2596",
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
        note: "Kiện 2/2 phụ kiện và máy phụ",
        created_at: "2026-10-22T08:00:00.000Z"
      }
    ],
    declarations: [
      {
        id: "dec_2596_1",
        order_id: "MD2596",
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
  },
  {
    id: "MD2591",
    order_code: "MD2591",
    customer_id: "cus_01",
    customer_name: "Nguyễn Văn Trung",
    customer_code: "NT2820",
    customer_phone: "0987654321",
    status: 1,
    order_type: "chinh_ngach",
    contract_type: "Chính ngạch Đích Danh",
    exchange_rate: 4015,
    real_exchange_rate: 3955,
    total_cny: 4850,
    total_cost_cny: 4650,
    bargain_discount_cny: 200,
    total_vnd: 21950000,
    total_cost_vnd: 19100000,
    gross_profit_vnd: 2850000,
    profit_rate_percent: 13.0,
    fee_buy: 439000,
    fee_ship_cn_cny: 80,
    fee_ship_cn_vnd: 321200,
    fee_weight: 1680000,
    fee_check: 100000,
    fee_wood: 250000,
    fee_insurance: 658500,
    fee_utnk: 0,
    tax_vat_amount: 1540000,
    tax_nk_amount: 0,
    tax_hdtq_amount: 0,
    fee_surcharge: 0,
    real_ship_cn_cny: 60,
    real_ship_cn_vnd: 237300,
    real_weight_fee_vnd: 1260000,
    real_wood_fee_vnd: 180000,
    real_check_fee_vnd: 50000,
    total_weight_kg: 60.0,
    total_cbm: 0.35,
    chargeable_weight_kg: 60.0,
    weight_unit_price_selling: 28000,
    weight_unit_price_cost: 21000,
    deposit_amount: 15365000,
    min_deposit_amount: 15365000,
    paid_amount_vnd: 15365000,
    remaining_amount: 6585000,
    is_second_payment_confirmed: false,
    second_payment_amount: 0,
    purchaser_id: "staff_purchaser_02",
    purchaser_name: "Nguyễn Văn Hùng (Purchaser 1688)",
    sales_id: "staff_sales_01",
    sales_name: "Trần Mai Anh (Sale Admin)",
    cskh_id: "staff_cskh_01",
    cskh_name: "Hoàng Lan (CSKH)",
    shop_name: "Công ty Phụ Tùng Máy Chiết Giang",
    shop_link: "https://shop1482910.1688.com",
    wangwang_id: "zj_machinery_parts",
    china_order_id: "192830192840192",
    alipay_transaction_id: "2026110822001928301",
    origin_warehouse: "Kho Bằng Tường (Trung Quốc)",
    destination_warehouse: "Kho Hà Nội (Việt Nam)",
    shipping_method: "Đường bộ hỏa tốc",
    hashtags: ["#HoaToc", "#CanDongGo"],
    customer_note: "Giao gấp trước ngày 30",
    internal_note: "Shop đã xác nhận sẵn hàng trong kho",
    created_at: "2026-10-20T08:15:00.000Z",
    updated_at: "2026-10-20T08:15:00.000Z",
    items: [
      {
        id: "item_2591_1",
        order_id: "MD2591",
        title: "Bạc đạn vòng bi công nghiệp tốc độ cao nhập khẩu",
        image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&q=80",
        product_link: "https://detail.1688.com/offer/81920381.html",
        properties: "Mã 6205-2RS",
        quantity: 100,
        quantity_received: 100,
        price_cny: 48.5,
        price_real_cny: 46.5,
        discount_cny: 2.0,
        total_cny: 4850.0,
        total_cost_cny: 4650.0,
        weight_kg: 60.0,
        customer_note: "",
        internal_note: "",
        status: 1
      }
    ],
    tracking_codes: [
      {
        id: "tr_2591_1",
        order_id: "MD2591",
        tracking_code: "SF1029381029",
        carrier_name: "Shunfeng Express (Thuận Phong)",
        weight_kg: 60.0,
        cbm: 0.35,
        dimensions: "50x40x35",
        status: "shop_dispatched",
        package_code: "BH-HN-091",
        vehicle_code: "XE-01",
        china_received_at: null,
        china_exported_at: null,
        vn_received_at: null,
        vn_exported_at: null,
        note: "Đang phát từ Chiết Giang",
        created_at: "2026-10-20T09:00:00.000Z"
      }
    ],
    declarations: []
  },
  {
    id: "MD2581",
    order_code: "MD2581",
    customer_id: "cus_02",
    customer_name: "Thu Nguyễn",
    customer_code: "NT1102",
    customer_phone: "0912345678",
    status: 10,
    order_type: "chinh_ngach",
    contract_type: "Chính ngạch Ủy Thác",
    exchange_rate: 4015,
    real_exchange_rate: 3955,
    total_cny: 6960,
    total_cost_cny: 6560,
    bargain_discount_cny: 400,
    total_vnd: 27955642,
    total_cost_vnd: 24200000,
    gross_profit_vnd: 3755642,
    profit_rate_percent: 13.4,
    fee_buy: 559000,
    fee_ship_cn_cny: 100,
    fee_ship_cn_vnd: 401500,
    fee_weight: 2240000,
    fee_check: 150000,
    fee_wood: 300000,
    fee_insurance: 838000,
    fee_utnk: 1200000,
    tax_vat_amount: 1980000,
    tax_nk_amount: 0,
    tax_hdtq_amount: 838669,
    fee_surcharge: 0,
    real_ship_cn_cny: 60,
    real_ship_cn_vnd: 237300,
    real_weight_fee_vnd: 1680000,
    real_wood_fee_vnd: 200000,
    real_check_fee_vnd: 80000,
    total_weight_kg: 80.0,
    total_cbm: 0.45,
    chargeable_weight_kg: 80.0,
    weight_unit_price_selling: 28000,
    weight_unit_price_cost: 21000,
    deposit_amount: 22147382,
    min_deposit_amount: 19568949,
    paid_amount_vnd: 22147382,
    remaining_amount: 5808260,
    is_second_payment_confirmed: false,
    second_payment_amount: 0,
    purchaser_id: "staff_purchaser_01",
    purchaser_name: "Lê Hoàng Thu (Purchaser Senior)",
    sales_id: "staff_sales_01",
    sales_name: "Trần Mai Anh (Sale Admin)",
    cskh_id: "staff_cskh_01",
    cskh_name: "Hoàng Lan (CSKH)",
    shop_name: "Thâm Quyến Pin Lithium Điện Tử",
    shop_link: "https://shop14781920.1688.com",
    wangwang_id: "sz_lithium_batt",
    china_order_id: "381920381029481",
    alipay_transaction_id: "202611072200381920",
    origin_warehouse: "Kho Bằng Tường (Trung Quốc)",
    destination_warehouse: "Kho Hà Nội (Việt Nam)",
    shipping_method: "Đường bộ chuyên tuyến pin",
    hashtags: ["#HangPin", "#ChotTTLan2"],
    customer_note: "Hàng có pin lithium đóng thùng xốp",
    internal_note: "Lô hàng đã lên xe container rời Bằng Tường về cửa khẩu Hữu Nghị",
    created_at: "2026-10-16T11:45:00.000Z",
    updated_at: "2026-10-16T11:45:00.000Z",
    items: [
      {
        id: "item_2581_1",
        order_id: "MD2581",
        title: "Khối pin sạc lithium lưu trữ điện năng lượng cao",
        image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=150&q=80",
        product_link: "https://detail.1688.com/offer/918230192.html",
        properties: "12V 100Ah",
        quantity: 20,
        quantity_received: 20,
        price_cny: 348.0,
        price_real_cny: 328.0,
        discount_cny: 20.0,
        total_cny: 6960.0,
        total_cost_cny: 6560.0,
        weight_kg: 80.0,
        customer_note: "Đo điện áp trước khi xuất xưởng",
        internal_note: "",
        status: 1
      }
    ],
    tracking_codes: [
      {
        id: "tr_2581_1",
        order_id: "MD2581",
        tracking_code: "ZTO9182390182",
        carrier_name: "ZTO Express (Trung Thông)",
        weight_kg: 80.0,
        cbm: 0.45,
        dimensions: "65x55x45",
        status: "cn_exported",
        package_code: "xachtay1708",
        vehicle_code: "XE-TRUCK-88C-19284",
        china_received_at: "2026-10-18T10:00:00.000Z",
        china_exported_at: "2026-10-21T15:00:00.000Z",
        vn_received_at: null,
        vn_exported_at: null,
        note: "Đang trên đường về kho HN",
        created_at: "2026-10-17T08:00:00.000Z"
      }
    ],
    declarations: []
  }
];

export type OrderRecord = StoredOrder;

// LỚP DỊCH VỤ ORDER STORE ĐIỀU HÀNH ERP CHUYÊN SÂU
export class OrderStoreService {
  private static instance: OrderStoreService;

  private constructor() {}

  public static getInstance(): OrderStoreService {
    if (!OrderStoreService.instance) {
      OrderStoreService.instance = new OrderStoreService();
    }
    return OrderStoreService.instance;
  }

  // Lấy danh sách tất cả đơn hàng (Ưu tiên Local Storage, tự khởi tạo nếu trống)
  public getOrders(): StoredOrder[] {
    if (typeof window === "undefined") {
      return INITIAL_ORDERS_DATA;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Read local storage failed, using fallback:", e);
    }

    // Khởi tạo lần đầu
    this.saveAllOrders(INITIAL_ORDERS_DATA);
    return INITIAL_ORDERS_DATA;
  }

  // Lấy chi tiết đơn hàng theo mã đơn hoặc id
  public getOrderById(idOrCode: string): StoredOrder | null {
    const orders = this.getOrders();
    const clean = idOrCode?.toLowerCase().trim();
    return orders.find(
      (o) => o.id.toLowerCase() === clean || o.order_code.toLowerCase() === clean
    ) || null;
  }

  // Đăng ký nhận sự kiện cập nhật thời gian thực
  public subscribe(callback: (orders: StoredOrder[]) => void): () => void {
    if (typeof window === "undefined") {
      return () => {};
    }
    const handler = () => {
      callback(this.getOrders());
    };
    window.addEventListener("NTG_ORDERS_UPDATED", handler);
    return () => {
      window.removeEventListener("NTG_ORDERS_UPDATED", handler);
    };
  }

  // Cập nhật đơn hàng và tự động tính toán lại toàn bộ tài chính
  public updateOrder(orderId: string, updates: Partial<StoredOrder>): StoredOrder | null {
    const orders = this.getOrders();
    const index = orders.findIndex(
      (o) => o.id.toLowerCase() === orderId.toLowerCase() || o.order_code.toLowerCase() === orderId.toLowerCase()
    );

    if (index === -1) return null;

    const current = orders[index];
    const merged: StoredOrder = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Tự động tính toán lại tài chính chuẩn xác
    const recomputed = this.recalculateFinancials(merged);
    orders[index] = recomputed;

    this.saveAllOrders(orders);
    this.syncToSupabase(recomputed);

    return recomputed;
  }

  // Chuyển đổi trạng thái đơn hàng (14 bước)
  public updateOrderStatus(orderId: string, newStatus: OrderStatus): StoredOrder | null {
    return this.updateOrder(orderId, { status: newStatus });
  }

  // Khách hàng thanh toán tiền cọc bằng ví số dư
  public payDepositWithWallet(orderId: string): { success: boolean; message: string; order?: StoredOrder } {
    const order = this.getOrderById(orderId);
    if (!order) {
      return { success: false, message: "Không tìm thấy đơn hàng." };
    }

    if (order.status >= 1) {
      return { success: false, message: "Đơn hàng đã được thanh toán tiền cọc trước đó." };
    }

    const depositToPay = order.min_deposit_amount || (order.total_vnd * 0.7);

    const updated = this.updateOrder(order.id, {
      status: 1, // Đã đặt cọc
      deposit_amount: depositToPay,
      paid_amount_vnd: (order.paid_amount_vnd || 0) + depositToPay,
      remaining_amount: Math.max(0, order.total_vnd - depositToPay)
    });

    return {
      success: true,
      message: `Thanh toán thành công ${depositToPay.toLocaleString()} đ từ ví số dư Nam Trung.`,
      order: updated || undefined
    };
  }

  // Quản trị viên chốt thanh toán lần 2 khi hàng về kho VN
  public confirmSecondPayment(orderId: string): { success: boolean; message: string; order?: StoredOrder } {
    const order = this.getOrderById(orderId);
    if (!order) {
      return { success: false, message: "Không tìm thấy đơn hàng." };
    }

    const currentTotal = order.total_vnd;
    const currentPaid = (order.deposit_amount || 0) + (order.paid_amount_vnd || 0);
    const debtToCollect = Math.max(0, currentTotal - currentPaid);

    const updatedHashtags = Array.from(new Set([...order.hashtags, "#ChotTTLan2"]));

    const updated = this.updateOrder(order.id, {
      is_second_payment_confirmed: true,
      paid_amount_vnd: (order.paid_amount_vnd || 0) + debtToCollect,
      remaining_amount: 0,
      hashtags: updatedHashtags
    });

    return {
      success: true,
      message: `Đã chốt thanh toán lần 2 và thu đủ ${debtToCollect.toLocaleString()} đ công nợ!`,
      order: updated || undefined
    };
  }

  // Thêm mã vận đơn con mới
  public addTrackingCode(orderId: string, trackingData: Omit<StoredTrackingCode, "id" | "order_id" | "created_at">): StoredOrder | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const newCode: StoredTrackingCode = {
      ...trackingData,
      id: `tr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      order_id: order.id,
      created_at: new Date().toISOString()
    };

    const updatedTrackings = [...(order.tracking_codes || []), newCode];
    const totalWeight = updatedTrackings.reduce((sum, t) => sum + (Number(t.weight_kg) || 0), 0);
    const totalCbm = updatedTrackings.reduce((sum, t) => sum + (Number(t.cbm) || 0), 0);

    return this.updateOrder(order.id, {
      tracking_codes: updatedTrackings,
      total_weight_kg: totalWeight,
      chargeable_weight_kg: totalWeight,
      total_cbm: totalCbm
    });
  }

  // Xóa mã vận đơn con
  public deleteTrackingCode(orderId: string, trackingId: string): StoredOrder | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const updatedTrackings = (order.tracking_codes || []).filter((t) => t.id !== trackingId);
    const totalWeight = updatedTrackings.reduce((sum, t) => sum + (Number(t.weight_kg) || 0), 0);
    const totalCbm = updatedTrackings.reduce((sum, t) => sum + (Number(t.cbm) || 0), 0);

    return this.updateOrder(order.id, {
      tracking_codes: updatedTrackings,
      total_weight_kg: totalWeight,
      chargeable_weight_kg: totalWeight,
      total_cbm: totalCbm
    });
  }

  // Thêm sản phẩm mới vào đơn hàng
  public addOrderItem(orderId: string, itemData: Omit<StoredOrderItem, "id" | "order_id" | "total_cny" | "total_cost_cny">): StoredOrder | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const totalCny = itemData.quantity * itemData.price_cny;
    const totalCostCny = itemData.quantity * (itemData.price_real_cny || itemData.price_cny);

    const newItem: StoredOrderItem = {
      ...itemData,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      order_id: order.id,
      total_cny: totalCny,
      total_cost_cny: totalCostCny
    };

    const updatedItems = [...(order.items || []), newItem];
    const totalOrderCny = updatedItems.reduce((sum, it) => sum + it.total_cny, 0);
    const totalOrderCostCny = updatedItems.reduce((sum, it) => sum + it.total_cost_cny, 0);

    return this.updateOrder(order.id, {
      items: updatedItems,
      total_cny: totalOrderCny,
      total_cost_cny: totalOrderCostCny,
      bargain_discount_cny: totalOrderCny - totalOrderCostCny
    });
  }

  // Xóa sản phẩm khỏi đơn hàng
  public deleteOrderItem(orderId: string, itemId: string): StoredOrder | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const updatedItems = (order.items || []).filter((it) => it.id !== itemId);
    const totalOrderCny = updatedItems.reduce((sum, it) => sum + it.total_cny, 0);
    const totalOrderCostCny = updatedItems.reduce((sum, it) => sum + it.total_cost_cny, 0);

    return this.updateOrder(order.id, {
      items: updatedItems,
      total_cny: totalOrderCny,
      total_cost_cny: totalOrderCostCny,
      bargain_discount_cny: totalOrderCny - totalOrderCostCny
    });
  }

  // Khôi phục lại dữ liệu mẫu
  public resetToDefaults(): StoredOrder[] {
    this.saveAllOrders(INITIAL_ORDERS_DATA);
    return INITIAL_ORDERS_DATA;
  }

  // Thêm mới đơn hàng hoàn chỉnh vào hệ thống
  public createOrder(newOrder: Partial<StoredOrder>): StoredOrder {
    const orders = this.getOrders();
    const id = newOrder.id || `ORD-${Date.now()}`;
    const code = newOrder.order_code || `MD${Math.floor(1000 + Math.random() * 9000)}`;
    const template: StoredOrder = {
      id,
      order_code: code,
      customer_id: newOrder.customer_id || "cust-01",
      customer_name: newOrder.customer_name || "Nguyễn Văn Khách",
      customer_code: newOrder.customer_code || "NT2820",
      customer_phone: newOrder.customer_phone || "0988776655",
      status: (newOrder.status ?? 0) as OrderStatus,
      order_type: newOrder.order_type || "order",
      contract_type: newOrder.contract_type || "Tiểu ngạch",
      exchange_rate: newOrder.exchange_rate || 4015,
      real_exchange_rate: newOrder.real_exchange_rate || 3980,
      total_cny: newOrder.total_cny || 0,
      total_cost_cny: newOrder.total_cost_cny || 0,
      bargain_discount_cny: newOrder.bargain_discount_cny || 0,
      total_vnd: newOrder.total_vnd || 0,
      total_cost_vnd: newOrder.total_cost_vnd || 0,
      gross_profit_vnd: newOrder.gross_profit_vnd || 0,
      profit_rate_percent: newOrder.profit_rate_percent || 0,
      fee_buy: newOrder.fee_buy || 0,
      fee_ship_cn_cny: newOrder.fee_ship_cn_cny || 0,
      fee_ship_cn_vnd: newOrder.fee_ship_cn_vnd || 0,
      fee_weight: newOrder.fee_weight || 0,
      fee_check: newOrder.fee_check || 0,
      fee_wood: newOrder.fee_wood || 0,
      fee_insurance: newOrder.fee_insurance || 0,
      fee_utnk: newOrder.fee_utnk || 0,
      tax_vat_amount: newOrder.tax_vat_amount || 0,
      tax_nk_amount: newOrder.tax_nk_amount || 0,
      tax_hdtq_amount: newOrder.tax_hdtq_amount || 0,
      fee_surcharge: newOrder.fee_surcharge || 0,
      real_ship_cn_cny: newOrder.real_ship_cn_cny || 0,
      real_ship_cn_vnd: newOrder.real_ship_cn_vnd || 0,
      real_weight_fee_vnd: newOrder.real_weight_fee_vnd || 0,
      real_wood_fee_vnd: newOrder.real_wood_fee_vnd || 0,
      real_check_fee_vnd: newOrder.real_check_fee_vnd || 0,
      total_weight_kg: newOrder.total_weight_kg || 0,
      total_cbm: newOrder.total_cbm || 0,
      chargeable_weight_kg: newOrder.chargeable_weight_kg || 0,
      weight_unit_price_selling: newOrder.weight_unit_price_selling || 28000,
      weight_unit_price_cost: newOrder.weight_unit_price_cost || 21000,
      deposit_amount: newOrder.deposit_amount || 0,
      min_deposit_amount: newOrder.min_deposit_amount || 0,
      paid_amount_vnd: newOrder.paid_amount_vnd || 0,
      remaining_amount: newOrder.remaining_amount || 0,
      is_second_payment_confirmed: newOrder.is_second_payment_confirmed || false,
      second_payment_amount: newOrder.second_payment_amount || 0,
      purchaser_id: newOrder.purchaser_id || "u-pur-01",
      purchaser_name: newOrder.purchaser_name || "Lê Thị Thảo (Purchaser)",
      sales_id: newOrder.sales_id || "u-sale-01",
      sales_name: newOrder.sales_name || "Nguyễn Văn Tuấn (Sale)",
      cskh_id: newOrder.cskh_id || "u-cskh-01",
      cskh_name: newOrder.cskh_name || "Trần Thị Mai (CSKH)",
      shop_name: newOrder.shop_name || "Shop 1688",
      shop_link: newOrder.shop_link || "https://shop1688.com",
      wangwang_id: newOrder.wangwang_id || "cntaobao_seller",
      china_order_id: newOrder.china_order_id || "",
      alipay_transaction_id: newOrder.alipay_transaction_id || "",
      origin_warehouse: newOrder.origin_warehouse || "Kho Bằng Tường",
      destination_warehouse: newOrder.destination_warehouse || "Kho Hà Nội",
      shipping_method: newOrder.shipping_method || "Đường bộ tiểu ngạch",
      customer_note: newOrder.customer_note || "",
      internal_note: newOrder.internal_note || "",
      hashtags: newOrder.hashtags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: newOrder.items || [],
      tracking_codes: newOrder.tracking_codes || [],
      declarations: newOrder.declarations || []
    };
    const recomputed = this.recalculateFinancials(template);
    orders.unshift(recomputed);
    this.saveAllOrders(orders);
    this.syncToSupabase(recomputed);
    return recomputed;
  }

  // CÔNG THỨC TÍNH TOÁN TOÀN BỘ TÀI CHÍNH ĐƠN HÀNG CHUẨN XÁC
  private recalculateFinancials(order: StoredOrder): StoredOrder {
    const exchangeRate = order.exchange_rate || 4015;
    const realRate = order.real_exchange_rate || 3955;

    // 1. Tiền hàng
    const totalCny = order.items && order.items.length > 0 
      ? order.items.reduce((sum, it) => sum + (it.price_cny * it.quantity), 0)
      : (order.total_cny || 0);

    const totalCostCny = order.items && order.items.length > 0
      ? order.items.reduce((sum, it) => sum + ((it.price_real_cny || it.price_cny) * it.quantity), 0)
      : (order.total_cost_cny || totalCny);

    const bargainDiscountCny = Math.max(0, totalCny - totalCostCny);

    const itemsRevenueVnd = totalCny * exchangeRate;
    const itemsCostVnd = totalCostCny * realRate;

    // 2. Ship nội địa TQ
    const shipCnRevenueVnd = (order.fee_ship_cn_cny || 0) * exchangeRate;
    const shipCnCostVnd = (order.real_ship_cn_cny || 0) * realRate;

    // 3. Cước vận chuyển quốc tế
    const weightSellingRate = order.weight_unit_price_selling || 28000;
    const weightCostRate = order.weight_unit_price_cost || 21000;
    const weightRevenueVnd = (order.chargeable_weight_kg || 0) * weightSellingRate;
    const weightCostVnd = (order.chargeable_weight_kg || 0) * weightCostRate;

    // 4. Các phí dịch vụ
    const buyFeeVnd = order.fee_buy !== undefined ? order.fee_buy : (itemsRevenueVnd * 0.02);
    const serviceFeeRevenue = 
      buyFeeVnd +
      (order.fee_check || 0) +
      (order.fee_wood || 0) +
      (order.fee_insurance || 0) +
      (order.fee_utnk || 0);

    const serviceFeeCost = 
      (order.real_check_fee_vnd || 0) +
      (order.real_wood_fee_vnd || 0);

    // 5. Thuế
    const taxRevenue = 
      (order.tax_vat_amount || 0) +
      (order.tax_nk_amount || 0) +
      (order.tax_hdtq_amount || 0);
    const taxCost = taxRevenue;

    // 6. Tổng doanh thu thu khách
    const totalVnd = itemsRevenueVnd + shipCnRevenueVnd + weightRevenueVnd + serviceFeeRevenue + taxRevenue + (order.fee_surcharge || 0);

    // 7. Tổng giá vốn thực tế
    const totalCostVnd = itemsCostVnd + shipCnCostVnd + weightCostVnd + serviceFeeCost + taxCost;

    // 8. Lợi nhuận gộp & Tỷ suất
    const grossProfitVnd = totalVnd - totalCostVnd;
    const profitRatePercent = totalVnd > 0 ? (grossProfitVnd / totalVnd) * 100 : 0;

    // 9. Dòng tiền & Công nợ
    const minDeposit = Math.round(totalVnd * 0.7);
    const totalPaid = (order.deposit_amount || 0) + (order.paid_amount_vnd || 0);
    const remaining = Math.max(0, totalVnd - totalPaid);

    return {
      ...order,
      total_cny: totalCny,
      total_cost_cny: totalCostCny,
      bargain_discount_cny: bargainDiscountCny,
      total_vnd: totalVnd,
      total_cost_vnd: totalCostVnd,
      gross_profit_vnd: grossProfitVnd,
      profit_rate_percent: Number(profitRatePercent.toFixed(1)),
      fee_buy: buyFeeVnd,
      fee_ship_cn_vnd: shipCnRevenueVnd,
      real_ship_cn_vnd: shipCnCostVnd,
      fee_weight: weightRevenueVnd,
      real_weight_fee_vnd: weightCostVnd,
      min_deposit_amount: minDeposit,
      remaining_amount: remaining
    };
  }

  private saveAllOrders(orders: StoredOrder[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      // Dispatch custom event để các component khác tự động cập nhật
      window.dispatchEvent(new Event("NTG_ORDERS_UPDATED"));
    } catch (e) {
      console.error("Save orders to localStorage failed:", e);
    }
  }

  // Đồng bộ ngầm lên Supabase (Fire and forget, không chặn giao diện)
  private async syncToSupabase(order: StoredOrder): Promise<void> {
    try {
      const supabase = createClient();
      await supabase
        .from("orders")
        .update({
          status: order.status,
          total_cny: order.total_cny,
          total_vnd: order.total_vnd,
          deposit_amount: order.deposit_amount,
          min_deposit_amount: order.min_deposit_amount,
          remaining_amount: order.remaining_amount,
          paid_amount_vnd: order.paid_amount_vnd,
          is_second_payment_confirmed: order.is_second_payment_confirmed,
          hashtags: order.hashtags,
          customer_note: order.customer_note,
          internal_note: order.internal_note,
          gross_profit_vnd: order.gross_profit_vnd,
          total_cost_vnd: order.total_cost_vnd
        })
        .eq("order_code", order.order_code);
    } catch (e) {
      // Bỏ qua lỗi RLS nếu chưa cấp quyền anon
    }
  }
}

export const orderStore = OrderStoreService.getInstance();
