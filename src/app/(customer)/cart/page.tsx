"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Store, 
  ShieldCheck, 
  PackageCheck, 
  Box, 
  Loader2,
  ExternalLink,
  PlusCircle,
  AlertCircle
} from "lucide-react";
import { formatVND, formatCNY } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { orderStore } from "@/lib/order-store";

interface CartShopGroup {
  shopName: string;
  items: CartItemUI[];
}

interface CartItemUI {
  id: string;
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
}

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [exchangeRate] = useState(4015);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItemUI[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal thêm nhanh sản phẩm vào giỏ
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    url: "",
    shop: "Shop 1688 Quảng Châu",
    properties: "Mặc định",
    priceCny: 50,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&q=80",
    note: "",
  });

  useEffect(() => {
    async function loadCart() {
      setLoading(true);
      try {
        if (user) {
          const { data } = await supabase
            .from("cart_items")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            setCartItems(data.map((d: any) => ({
              id: d.id,
              shop_name: d.shop_name || "Shop Taobao/1688",
              item_title: d.item_title,
              item_image: d.item_image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&q=80",
              item_url: d.item_url,
              properties: d.properties || "Tiêu chuẩn",
              price_cny: Number(d.price_cny || 0),
              quantity: Number(d.quantity || 1),
              note: d.note || "",
              is_check: !!d.is_check,
              is_wood: !!d.is_wood,
              is_insurance: !!d.is_insurance,
              selected: d.selected !== false,
            })));
            setLoading(false);
            return;
          }
        }

        // Demo fallback items
        setCartItems([
          {
            id: "cart-1",
            shop_name: "Guangzhou Digital Flagship Store (1688)",
            item_title: "Tai nghe bluetooth không dây chống ồn chủ động ANC phiên bản 2026",
            item_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80",
            item_url: "https://detail.1688.com/offer/654321098.html",
            properties: "Màu Đen - Bản Pro ANC",
            price_cny: 125.5,
            quantity: 10,
            note: "Kiểm tra kỹ phụ kiện cáp sạc",
            is_check: true,
            is_wood: false,
            is_insurance: true,
            selected: true,
          },
          {
            id: "cart-2",
            shop_name: "Guangzhou Digital Flagship Store (1688)",
            item_title: "Cáp sạc nhanh Type-C 100W bọc dù siêu bền dài 2m",
            item_image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=150&q=80",
            item_url: "https://detail.1688.com/offer/123456789.html",
            properties: "Xám titan - 2 mét",
            price_cny: 18.0,
            quantity: 50,
            note: "",
            is_check: false,
            is_wood: false,
            is_insurance: false,
            selected: true,
          },
          {
            id: "cart-3",
            shop_name: "Xưởng Gia Dụng Thông Minh Chiết Giang (Taobao)",
            item_title: "Robot hút bụi lau nhà tự động đổ rác thông minh đa năng",
            item_image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=150&q=80",
            item_url: "https://item.taobao.com/item.htm?id=987654321",
            properties: "Bản Quốc Tế - Trắng Tinh Khôi",
            price_cny: 850.0,
            quantity: 2,
            note: "Hàng điện tử dễ vỡ, đề nghị đóng gỗ bảo vệ",
            is_check: true,
            is_wood: true,
            is_insurance: true,
            selected: true,
          },
        ]);
      } catch (err) {
        console.error("Load cart error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [user]);

  const toggleSelectAll = (checked: boolean) => {
    setCartItems(cartItems.map((it) => ({ ...it, selected: checked })));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(cartItems.map((it) => {
      if (it.id === id) {
        const newQty = Math.max(1, it.quantity + delta);
        return { ...it, quantity: newQty };
      }
      return it;
    }));
  };

  const toggleService = (id: string, field: "is_check" | "is_wood" | "is_insurance") => {
    setCartItems(cartItems.map((it) => {
      if (it.id === id) {
        return { ...it, [field]: !it[field] };
      }
      return it;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((it) => it.id !== id));
  };

  const handleAddNewItem = () => {
    if (!newItem.title || !newItem.url) {
      alert("Vui lòng nhập tên và link sản phẩm");
      return;
    }
    const item: CartItemUI = {
      id: `cart-${Date.now()}`,
      shop_name: newItem.shop || "Shop 1688",
      item_title: newItem.title,
      item_image: newItem.image,
      item_url: newItem.url,
      properties: newItem.properties,
      price_cny: Number(newItem.priceCny) || 10,
      quantity: Number(newItem.quantity) || 1,
      note: newItem.note,
      is_check: false,
      is_wood: false,
      is_insurance: false,
      selected: true,
    };
    setCartItems([item, ...cartItems]);
    setShowAddModal(false);
    setNewItem({
      title: "",
      url: "",
      shop: "Shop 1688 Quảng Châu",
      properties: "Mặc định",
      priceCny: 50,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&q=80",
      note: "",
    });
  };

  // Tính toán chi phí cho các mặt hàng được chọn
  const selectedItems = cartItems.filter((it) => it.selected);
  const totalCny = selectedItems.reduce((s, it) => s + it.price_cny * it.quantity, 0);
  const totalGoodsVnd = totalCny * exchangeRate;
  const feeBuy = totalGoodsVnd > 0 ? Math.max(50000, Math.round(totalGoodsVnd * 0.03)) : 0;
  const feeCheck = selectedItems.filter((it) => it.is_check).reduce((s, it) => s + it.quantity * 2000, 0);
  const feeWood = selectedItems.filter((it) => it.is_wood).length * 150000;
  const feeInsurance = selectedItems.filter((it) => it.is_insurance).reduce((s, it) => s + Math.round(it.price_cny * it.quantity * exchangeRate * 0.03), 0);
  const totalEstimatedVnd = totalGoodsVnd + feeBuy + feeCheck + feeWood + feeInsurance;
  const minDepositVnd = Math.round(totalEstimatedVnd * 0.7);

  // Nhóm theo shop
  const groupedShops: CartShopGroup[] = [];
  cartItems.forEach((it) => {
    let group = groupedShops.find((g) => g.shopName === it.shop_name);
    if (!group) {
      group = { shopName: it.shop_name, items: [] };
      groupedShops.push(group);
    }
    group.items.push(it);
  });

  const handleCreateOrderFromCart = async () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để tạo đơn hàng.");
      return;
    }

    setIsSubmitting(true);
    try {
      const randomNum = Math.floor(2700 + Math.random() * 100);
      const orderCode = `MD${randomNum}`;

      const formattedItems = selectedItems.map((it, idx) => ({
        id: `it_cart_${Date.now()}_${idx}`,
        order_id: orderCode,
        title: it.item_title,
        link: it.item_url || "https://detail.1688.com",
        shop_name: it.shop_name,
        shop_id: "shop_cart",
        image_url: it.item_image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&q=80",
        properties: it.properties || "Mặc định",
        quantity: it.quantity,
        quantity_received: 0,
        price_cny: it.price_cny,
        price_real_cny: it.price_cny,
        discount_cny: 0,
        total_cny: it.price_cny * it.quantity,
        total_cost_cny: it.price_cny * it.quantity,
        weight_kg: 0,
        customer_note: it.note || "",
        internal_note: "",
        status: 0,
      }));

      orderStore.createOrder({
        id: orderCode,
        order_code: orderCode,
        customer_id: user?.id || "cust-01",
        customer_name: user?.email ? user.email.split("@")[0] : "Khách Hàng NTG",
        customer_code: "NT2820",
        customer_phone: "0988776655",
        status: 0,
        order_type: "order",
        contract_type: "Tiểu ngạch",
        exchange_rate: exchangeRate,
        real_exchange_rate: exchangeRate - 35,
        total_cny: totalCny,
        total_cost_cny: totalCny,
        total_vnd: totalEstimatedVnd,
        deposit_amount: 0,
        min_deposit_amount: minDepositVnd,
        remaining_amount: totalEstimatedVnd,
        fee_buy: feeBuy,
        fee_check: feeCheck,
        fee_wood: feeWood,
        fee_insurance: feeInsurance,
        items: formattedItems,
        tracking_codes: [],
      });

      // Xoá các mặt hàng đã tạo đơn khỏi giỏ
      setCartItems(cartItems.filter((it) => !it.selected));

      alert(`Đã tạo thành công đơn hàng ${orderCode}! Hệ thống chuyển bạn về chi tiết đơn.`);
      router.push(`/orders/${orderCode}`);
    } catch (err: any) {
      alert("Lỗi tạo đơn: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-brand-600" />
            <span>Giỏ Hàng Đặt Mua 1688 / Taobao</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Quản lý các sản phẩm đã thu thập từ các shop Trung Quốc trước khi gửi duyệt đơn
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-brand-600" />
            <span>Thêm Link Sản Phẩm</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          <span className="text-xs">Đang tải giỏ hàng...</span>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-gray-200 p-8">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Giỏ hàng của bạn đang trống</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Hãy cài đặt Extension đặt hàng hoặc thêm link sản phẩm thủ công để lên đơn.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-brand-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột Trái: Danh Sách Sản Phẩm Gom Theo Shop */}
          <div className="lg:col-span-2 space-y-4">
            {/* Thanh chọn tất cả */}
            <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-200 text-xs">
              <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cartItems.every((it) => it.selected)}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <span>Chọn tất cả ({cartItems.length} sản phẩm)</span>
              </label>

              <span className="text-gray-400">
                Đã chọn: <strong className="text-brand-600">{selectedItems.length}</strong>
              </span>
            </div>

            {groupedShops.map((group, groupIdx) => (
              <div key={groupIdx} className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
                {/* Shop Header */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-brand-600" />
                    <span className="font-bold text-xs text-gray-800">{group.shopName}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{group.items.length} món</span>
                </div>

                {/* Items in Shop */}
                <div className="divide-y divide-gray-100">
                  {group.items.map((item) => (
                    <div key={item.id} className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-start gap-3.5">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => {
                            setCartItems(cartItems.map((it) => it.id === item.id ? { ...it, selected: !it.selected } : it));
                          }}
                          className="w-4 h-4 text-brand-600 rounded mt-1 cursor-pointer"
                        />

                        <img
                          src={item.item_image}
                          alt={item.item_title}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-100 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <a
                            href={item.item_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-xs sm:text-sm text-gray-900 hover:text-brand-600 line-clamp-2 transition-colors flex items-center gap-1"
                          >
                            <span>{item.item_title}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                          </a>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-semibold">
                              {item.properties}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 mt-3">
                            <div>
                              <span className="font-extrabold text-sm text-brand-700">
                                {formatCNY(item.price_cny)}
                              </span>
                              <span className="text-[11px] text-gray-400 ml-1.5 font-medium">
                                (~{formatVND(item.price_cny * exchangeRate)})
                              </span>
                            </div>

                            {/* Quantity controls */}
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1.5 hover:bg-gray-200 text-gray-600 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 text-xs font-bold font-mono text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1.5 hover:bg-gray-200 text-gray-600 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Add-on services per item */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-50 text-[11px]">
                        <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
                          <input
                            type="checkbox"
                            checked={item.is_check}
                            onChange={() => toggleService(item.id, "is_check")}
                            className="w-3.5 h-3.5 text-brand-600 rounded"
                          />
                          <span>Kiểm đếm (+2k/sp)</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
                          <input
                            type="checkbox"
                            checked={item.is_wood}
                            onChange={() => toggleService(item.id, "is_wood")}
                            className="w-3.5 h-3.5 text-brand-600 rounded"
                          />
                          <span>Đóng gỗ (+150k)</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
                          <input
                            type="checkbox"
                            checked={item.is_insurance}
                            onChange={() => toggleService(item.id, "is_insurance")}
                            className="w-3.5 h-3.5 text-brand-600 rounded"
                          />
                          <span>Bảo hiểm 100% (+3%)</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cột Phải: Bảng Tóm Tắt & Thanh Toán */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs space-y-4 sticky top-20">
              <h3 className="font-bold text-sm text-gray-900 pb-3 border-b border-gray-100 uppercase tracking-wider">
                Tóm Tắt Đơn Hàng ({selectedItems.length} món)
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Tiền hàng (Tệ):</span>
                  <span className="font-mono font-bold text-gray-900">{formatCNY(totalCny)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tỷ giá tính toán:</span>
                  <span className="font-mono font-semibold">{exchangeRate.toLocaleString()} đ/CNY</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tiền hàng quy đổi VNĐ:</span>
                  <span className="font-mono font-bold text-gray-900">{formatVND(totalGoodsVnd)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí dịch vụ mua hàng (3%):</span>
                  <span className="font-mono font-semibold text-gray-900">{formatVND(feeBuy)}</span>
                </div>

                {feeCheck > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Phí kiểm đếm:</span>
                    <span className="font-mono font-semibold text-gray-900">{formatVND(feeCheck)}</span>
                  </div>
                )}

                {feeWood > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Phí đóng kiện gỗ:</span>
                    <span className="font-mono font-semibold text-gray-900">{formatVND(feeWood)}</span>
                  </div>
                )}

                {feeInsurance > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Phí bảo hiểm hàng hóa:</span>
                    <span className="font-mono font-semibold text-gray-900">{formatVND(feeInsurance)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="font-bold text-gray-800 text-sm">Tổng Tạm Tính:</span>
                  <span className="font-mono font-black text-brand-700 text-lg">
                    {formatVND(totalEstimatedVnd)}
                  </span>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex justify-between items-center text-xs">
                  <span>Tiền cọc tối thiểu (70%):</span>
                  <span className="font-mono font-black text-amber-900 text-sm">
                    {formatVND(minDepositVnd)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateOrderFromCart}
                disabled={isSubmitting || selectedItems.length === 0}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tạo đơn hàng...</span>
                  </>
                ) : (
                  <>
                    <span>Gửi Đơn Mua Hàng ({selectedItems.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-gray-400 space-y-1">
                <p>• Phí vận chuyển TQ-VN sẽ được cân đo và tính chính xác khi hàng về tới kho.</p>
                <p>• Hỗ trợ khiếu nại và bảo hiểm 100% nếu xảy ra thất lạc hàng hóa.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Sản Phẩm Nhanh Vào Giỏ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <h3 className="font-bold text-base text-gray-900">Thêm Sản Phẩm Vào Giỏ Hàng</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="VD: Giày thể thao nam thoáng khí mẫu 2026"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Link sản phẩm (1688 / Taobao) *</label>
                <input
                  type="text"
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  placeholder="https://detail.1688.com/offer/..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Đơn giá Tệ (CNY) *</label>
                  <input
                    type="number"
                    value={newItem.priceCny}
                    onChange={(e) => setNewItem({ ...newItem, priceCny: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Số lượng *</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Phân loại (Màu, Size)</label>
                <input
                  type="text"
                  value={newItem.properties}
                  onChange={(e) => setNewItem({ ...newItem, properties: e.target.value })}
                  placeholder="VD: Màu đen - Size 42"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Ghi chú cho nhân viên mua hàng</label>
                <input
                  type="text"
                  value={newItem.note}
                  onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                  placeholder="Ghi chú thêm..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNewItem}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl cursor-pointer"
              >
                Thêm Vào Giỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
