export type UserRole = 
  | 'customer'
  | 'sale'
  | 'purchaser'
  | 'warehouse_cn'
  | 'warehouse_vn'
  | 'accountant'
  | 'admin';

export interface Profile {
  id: string;
  user_code: string; // VD: NT2820
  username: string;
  full_name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  level_id: number;
  wallet_balance: number;
  default_warehouse_id?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export type OrderStatus = 
  | 0  // Chưa đặt cọc
  | 1  // Đã đặt cọc
  | 2  // Chờ mua hàng
  | 3  // Đang mua hàng
  | 6  // Đã mua hàng
  | 7  // Shop TQ phát hàng
  | 9  // Kho TQ nhận hàng
  | 10 // Kho TQ xuất hàng / Vận chuyển về VN
  | 11 // Kho VN nhận hàng
  | 12 // Chờ giao hàng
  | 13 // Đang giao hàng
  | 14 // Hoàn thành
  | 16; // Đã hủy

export interface Order {
  id: string;
  order_code: string;
  customer_id: string;
  sale_id?: string;
  buyer_id?: string;
  status: OrderStatus;
  order_type: 'order' | 'deposit' | 'chinh_ngach';
  
  exchange_rate: number;
  total_cny: number;
  total_vnd: number;
  deposit_amount: number;
  min_deposit_amount: number;
  remaining_amount: number;
  
  fee_buy: number;
  fee_ship_cn_cny: number;
  fee_ship_cn_vnd: number;
  fee_weight: number;
  fee_volume: number;
  fee_check: number;
  fee_wood: number;
  fee_insurance: number;
  fee_surcharge: number;
  
  contract_type?: string;
  tax_vat_rate: number;
  tax_vat_amount: number;
  tax_nk_rate: number;
  tax_nk_amount: number;
  fee_utnk: number;
  tax_hdtq_amount: number;
  
  shop_name?: string;
  shop_id?: string;
  site?: string;
  receive_warehouse_id?: string;
  customer_note?: string;
  internal_note?: string;
  
  created_at: string;
  deposited_at?: string;
  bought_at?: string;
  shop_delivered_at?: string;
  cn_imported_at?: string;
  cn_exported_at?: string;
  vn_imported_at?: string;
  completed_at?: string;
  
  items?: OrderItem[];
  packages?: Package[];
  declarations?: Declaration[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  title: string;
  image_url?: string;
  product_link: string;
  properties?: string;
  quantity: number;
  price_cny: number;
  total_cny: number;
  customer_note?: string;
  status: number;
}

export interface Package {
  id: string;
  tracking_code: string;
  order_id?: string;
  big_package_id?: string;
  customer_id: string;
  weight_kg: number;
  volume_cbm: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  status: number; // 1: Kho TQ nhận, 2: Kho TQ xuất, 3: Kho VN nhận, 4: Đã giao
  cn_received_at?: string;
  vn_received_at?: string;
  created_at: string;
}

export interface BigPackage {
  id: string;
  code: string; // VD: xachtay1708, BAO-HN-001
  warehouse_id: string;
  total_weight_kg: number;
  total_volume_cbm: number;
  package_count: number;
  status: 'packing' | 'in_transit' | 'arrived_vn' | 'unpacked';
  vehicle_code?: string;
  departure_date?: string;
  arrival_date?: string;
  created_at: string;
}

export interface Declaration {
  id: string;
  order_id: string;
  declaration_code: string;
  hs_code?: string;
  product_description: string;
  consignee?: string;
  image_url?: string;
  unit: string;
  quantity: number;
  min_customs_price: number;
  tax_nk_rate: number;
  tax_vat_rate: number;
  special_tax_rate: number;
  import_policy?: string;
  specialized_fee: number;
  status: number;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  transaction_code: string;
  user_id: string;
  amount: number;
  balance_after: number;
  type: 'deposit' | 'withdrawal' | 'order_payment' | 'refund';
  order_id?: string;
  note?: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  shop_id?: string;
  shop_name: string;
  item_title: string;
  item_image?: string;
  item_url: string;
  properties?: string;
  price_cny: number;
  quantity: number;
  note?: string;
  is_check: boolean;
  is_wood: boolean;
  is_insurance: boolean;
  selected: boolean;
  created_at: string;
}

export interface PayService {
  id: string;
  pay_code: string;
  user_id: string;
  alipay_account: string;
  total_cny: number;
  exchange_rate: number;
  fee_cny: number;
  total_vnd: number;
  qr_image_url?: string;
  note?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_transaction_id?: string;
  assigned_staff_id?: string;
  created_at: string;
  completed_at?: string;
}

export interface Complaint {
  id: string;
  complaint_code: string;
  user_id: string;
  order_id?: string;
  package_id?: string;
  type: 'broken' | 'wrong_item' | 'missing' | 'slow' | 'other';
  title: string;
  content: string;
  images: string[];
  refund_requested_cny: number;
  refund_requested_vnd: number;
  refund_approved_vnd: number;
  status: 'pending' | 'investigating' | 'accepted' | 'rejected' | 'completed';
  admin_response?: string;
  created_at: string;
}

export interface ExportReceipt {
  id: string;
  receipt_code: string;
  customer_id: string;
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  shipping_carrier?: string;
  total_packages: number;
  total_weight_kg: number;
  shipping_fee_vnd: number;
  status: 'pending' | 'delivering' | 'delivered';
  created_at: string;
}

export interface CloudflareR2Config {
  endpoint: string;
  bucket: string;
  public_domain: string;
  access_key_id: string;
  secret_access_key: string;
}

export interface ExchangeRateConfig {
  rate: number;
  min_buy_fee: number;
  updated_by?: string;
}

export interface BankConfig {
  bank_name: string;
  account_number: string;
  account_name: string;
  branch?: string;
  bin: string;
}
