"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatVND, formatCNY } from "@/lib/utils";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { orderStore } from "@/lib/order-store";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  ShieldCheck, 
  PackageCheck, 
  Boxes, 
  HelpCircle,
  FileText
} from "lucide-react";

interface ProductItemInput {
  id: string;
  title: string;
  link: string;
  property: string;
  priceCny: number;
  quantity: number;
  imageUrl: string;
  note: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [exchangeRate] = useState<number>(4015);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cấu hình đơn hàng
  const [orderType, setOrderType] = useState<"order" | "chinh_ngach">("order");
  const [warehouseId, setWarehouseId] = useState<string>("a0000000-0000-0000-0000-000000000001"); // Kho HN
  const [isCheck, setIsCheck] = useState(false);
  const [isWood, setIsWood] = useState(false);
  const [isInsurance, setIsInsurance] = useState(false);
  const [customerNote, setCustomerNote] = useState("");

  // Trường bổ sung cho Chính Ngạch (NKCN)
  const [hsCode, setHsCode] = useState("");
  const [contractType, setContractType] = useState("Ủy thác nhập khẩu");
  const [taxVatRate, setTaxVatRate] = useState(8);
  const [taxNkRate, setTaxNkRate] = useState(0);

  // Danh sách sản phẩm
  const [items, setItems] = useState<ProductItemInput[]>([
    {
      id: "item-1",
      title: "",
      link: "",
      property: "",
      priceCny: 0,
      quantity: 1,
      imageUrl: "",
      note: "",
    },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        title: "",
        link: "",
        property: "",
        priceCny: 0,
        quantity: 1,
        imageUrl: "",
        note: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof ProductItemInput, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Tính toán chi phí thời gian thực
  const totalCny = items.reduce((sum, item) => sum + (Number(item.priceCny) || 0) * (Number(item.quantity) || 1), 0);
  const totalGoodsVnd = totalCny * exchangeRate;
  
  // Phí mua hàng: 3% hoặc tối thiểu 50.000đ
  const feeBuy = totalGoodsVnd > 0 ? Math.max(50000, Math.round(totalGoodsVnd * 0.03)) : 0;
  
  // Phí kiểm đếm (nếu chọn)
  const feeCheck = isCheck ? items.reduce((sum, item) => sum + (Number(item.quantity) || 1) * 2000, 0) : 0;
  
  // Phí bảo hiểm (nếu chọn: 3% giá trị hàng)
  const feeInsurance = isInsurance ? Math.round(totalGoodsVnd * 0.03) : 0;

  // Thuế NKCN (nếu là chính ngạch)
  const taxNkAmount = orderType === "chinh_ngach" ? Math.round(totalGoodsVnd * (taxNkRate / 100)) : 0;
  const taxVatAmount = orderType === "chinh_ngach" ? Math.round((totalGoodsVnd + taxNkAmount) * (taxVatRate / 100)) : 0;
  const feeUtnk = orderType === "chinh_ngach" ? 1200000 : 0; // Phí ủy thác tối thiểu

  const totalOrderVnd = totalGoodsVnd + feeBuy + feeCheck + feeInsurance + taxNkAmount + taxVatAmount + feeUtnk;
  const minDepositVnd = Math.round(totalOrderVnd * 0.7); // Cọc 70%

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((it) => !it.title || !it.link || it.priceCny <= 0)) {
      alert("Vui lòng điền đầy đủ Tên sản phẩm, Link sản phẩm và Đơn giá Tệ");
      return;
    }

    try {
      setIsSubmitting(true);
      const randomNum = Math.floor(2600 + Math.random() * 100);
      const orderCode = `MD${randomNum}`;

      // Tạo các item chuẩn cho Order Store
      const formattedItems = items.map((it, idx) => ({
        id: `it_${Date.now()}_${idx}`,
        order_id: orderCode,
        title: it.title,
        link: it.link,
        shop_name: "1688 / Taobao Factory",
        shop_id: "shop_oem",
        image_url: it.imageUrl || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&q=80",
        properties: it.property || "Mặc định",
        quantity: Number(it.quantity) || 1,
        quantity_received: 0,
        price_cny: Number(it.priceCny) || 0,
        price_real_cny: Number(it.priceCny) || 0,
        discount_cny: 0,
        total_cny: (Number(it.priceCny) || 0) * (Number(it.quantity) || 1),
        total_cost_cny: (Number(it.priceCny) || 0) * (Number(it.quantity) || 1),
        weight_kg: 0,
        customer_note: it.note || "",
        internal_note: "",
        status: 0,
      }));

      // Lưu trực tiếp vào ERP Order Store
      orderStore.createOrder({
        id: orderCode,
        order_code: orderCode,
        customer_id: user?.id || "cust-01",
        customer_name: user?.email ? user.email.split("@")[0] : "Khách Hàng NTG",
        customer_code: "NT2820",
        customer_phone: "0988776655",
        status: 0, // Chờ cọc
        order_type: orderType,
        contract_type: orderType === "chinh_ngach" ? contractType : "Tiểu ngạch",
        exchange_rate: exchangeRate,
        real_exchange_rate: exchangeRate - 35,
        total_cny: totalCny,
        total_cost_cny: totalCny,
        bargain_discount_cny: 0,
        total_vnd: totalOrderVnd,
        deposit_amount: 0,
        min_deposit_amount: minDepositVnd,
        remaining_amount: totalOrderVnd,
        fee_buy: feeBuy,
        fee_check: feeCheck,
        fee_wood: 0,
        fee_insurance: feeInsurance,
        fee_utnk: feeUtnk,
        tax_vat_amount: taxVatAmount,
        tax_nk_amount: taxNkAmount,
        customer_note: customerNote,
        items: formattedItems,
        tracking_codes: [],
      });

      // Background đồng bộ Supabase nếu kết nối sẵn
      try {
        if (user) {
          const { data: order } = await supabase.from("orders").insert({
            order_code: orderCode,
            customer_id: user.id,
            status: 0,
            order_type: orderType,
            exchange_rate: exchangeRate,
            total_cny: totalCny,
            total_vnd: totalOrderVnd,
            deposit_amount: 0,
            min_deposit_amount: minDepositVnd,
            remaining_amount: totalOrderVnd,
            fee_buy: feeBuy,
            fee_check: feeCheck,
            fee_insurance: feeInsurance,
            fee_utnk: feeUtnk,
            tax_vat_rate: taxVatRate,
            tax_vat_amount: taxVatAmount,
            tax_nk_rate: taxNkRate,
            tax_nk_amount: taxNkAmount,
            contract_type: orderType === "chinh_ngach" ? contractType : "Tiểu ngạch",
            customer_note: customerNote,
            receive_warehouse_id: warehouseId,
          }).select().single();

          if (order?.id) {
            const orderItemsToInsert = items.map((it) => ({
              order_id: order.id,
              title: it.title,
              source_url: it.link,
              property_desc: it.property,
              price_cny: it.priceCny,
              quantity: it.quantity,
              image_url: it.imageUrl,
              customer_note: it.note,
            }));
            await supabase.from("order_items").insert(orderItemsToInsert);
          }
        }
      } catch (dbErr) {
        console.warn("Supabase background sync:", dbErr);
      }

      alert(`Tạo đơn hàng ${orderCode} thành công! Hệ thống chuyển bạn tới trang chi tiết đơn.`);
      router.push(`/orders/${orderCode}`);
    } catch (err: any) {
      alert("Lỗi tạo đơn: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitOrder} className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Tạo Đơn Hàng Mua Hộ Mới
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Hỗ trợ đặt hàng trực tiếp qua link Taobao, 1688, Tmall, JD, Pinduoduo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl">
          <span>Tỷ giá áp dụng:</span>
          <span>1 ¥ = {exchangeRate.toLocaleString("vi-VN")} đ</span>
        </div>
      </div>

      {/* Chọn Loại Hình & Kho Nhận */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
            Hình thức nhập khẩu
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrderType("order")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                orderType === "order"
                  ? "bg-brand-50 border-brand-500 text-brand-900 font-bold"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="text-xs block font-bold">Tiểu Ngạch / Phổ Thông</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Vận chuyển bao thuế</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderType("chinh_ngach")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                orderType === "chinh_ngach"
                  ? "bg-purple-50 border-purple-500 text-purple-900 font-bold"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="text-xs block font-bold">Chính Ngạch (NKCN)</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Có tờ khai & hóa đơn VAT</span>
            </button>
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
            Kho nhận hàng tại Việt Nam
          </label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="a0000000-0000-0000-0000-000000000001">Kho Hà Nội (Giao miền Bắc & Trung)</option>
            <option value="a0000000-0000-0000-0000-000000000002">Kho TP. Hồ Chí Minh (Giao miền Nam)</option>
          </select>
        </div>
      </div>

      {/* Mục bổ sung cho Chính Ngạch nếu chọn NKCN */}
      {orderType === "chinh_ngach" && (
        <div className="p-5 bg-purple-50/50 rounded-3xl border border-purple-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-sm text-purple-900">Thông Tin Khai Báo Hải Quan (NKCN)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Mã HS Code (Nếu biết)</label>
              <input
                type="text"
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
                placeholder="VD: 8479.89.90"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono text-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Thuế Nhập Khẩu (%)</label>
              <input
                type="number"
                value={taxNkRate}
                onChange={(e) => setTaxNkRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Thuế VAT (%)</label>
              <input
                type="number"
                value={taxVatRate}
                onChange={(e) => setTaxVatRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Danh Sách Sản Phẩm */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-gray-900">Danh Sách Sản Phẩm Đặt Mua</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl border border-brand-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Link Sản Phẩm</span>
          </button>
        </div>

        {items.map((item, idx) => (
          <div
            key={item.id}
            className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-4 relative"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="font-bold text-xs text-brand-700">Sản phẩm #{idx + 1}</span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Link sản phẩm (Taobao / 1688 / Tmall)</label>
                  <input
                    type="url"
                    required
                    value={item.link}
                    onChange={(e) => handleItemChange(idx, "link", e.target.value)}
                    placeholder="https://detail.1688.com/offer/..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    required
                    value={item.title}
                    onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                    placeholder="Nhập tên sản phẩm tiếng Việt hoặc tiếng Trung..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Màu sắc / Kích thước</label>
                    <input
                      type="text"
                      value={item.property}
                      onChange={(e) => handleItemChange(idx, "property", e.target.value)}
                      placeholder="Màu đen, Size L..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Số lượng</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Đơn giá Tệ (¥ CNY)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.priceCny || ""}
                      onChange={(e) => handleItemChange(idx, "priceCny", parseFloat(e.target.value) || 0)}
                      placeholder="¥ 0.00"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Upload ảnh mẫu lên Cloudflare R2 */}
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-700 block mb-1">Ảnh sản phẩm</label>
                <ImageUploader
                  folder="orders"
                  onUploadComplete={(url) => handleItemChange(idx, "imageUrl", url)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dịch Vụ Gia Tăng */}
      <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
          Dịch vụ gia tăng tùy chọn
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={isCheck}
              onChange={(e) => setIsCheck(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600"
            />
            <div>
              <span className="text-xs font-bold text-gray-800 block">Kiểm đếm hàng</span>
              <span className="text-[10px] text-gray-400 block">Kiểm tra số lượng, màu sắc, rách vỡ</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={isWood}
              onChange={(e) => setIsWood(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600"
            />
            <div>
              <span className="text-xs font-bold text-gray-800 block">Đóng gỗ bảo vệ</span>
              <span className="text-[10px] text-gray-400 block">Dành cho đồ gốm, kính, hàng dễ vỡ</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={isInsurance}
              onChange={(e) => setIsInsurance(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600"
            />
            <div>
              <span className="text-xs font-bold text-gray-800 block">Bảo hiểm 100%</span>
              <span className="text-[10px] text-gray-400 block">Đền bù 100% giá trị khi mất mát</span>
            </div>
          </label>
        </div>
      </div>

      {/* Tổng Hợp & Đặt Hàng */}
      <div className="p-6 bg-gradient-to-r from-gray-900 to-brand-950 text-white rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold text-brand-300 uppercase tracking-widest block">
              Tổng Kết Tạm Tính Đơn Hàng
            </span>
            <div className="text-2xl sm:text-3xl font-black mt-1 font-mono">
              {formatVND(totalOrderVnd)}
            </div>
            <span className="text-xs text-gray-400">
              Tổng tiền hàng Tệ: <strong className="text-white">{formatCNY(totalCny)}</strong> · Cọc tối thiểu: <strong className="text-amber-400">{formatVND(minDepositVnd)}</strong>
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isSubmitting ? "Đang tạo đơn..." : "Xác Nhận Tạo Đơn Hàng"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
