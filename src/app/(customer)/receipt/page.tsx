"use client";

import React, { useState, useEffect } from "react";
import { 
  Receipt, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Loader2, 
  ArrowRight,
  MapPin,
  Phone,
  User,
  Printer
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

interface ExportReceiptUI {
  id: string;
  receipt_code: string;
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  shipping_carrier?: string;
  total_packages: number;
  total_weight_kg: number;
  shipping_fee_vnd: number;
  status: "pending" | "delivering" | "delivered";
  created_at: string;
}

export default function CustomerReceiptPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<ExportReceiptUI[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form tạo yêu cầu giao hàng
  const [formData, setFormData] = useState({
    receiverName: profile?.full_name || "Nguyễn Văn Trung",
    receiverPhone: profile?.phone || "0912345678",
    deliveryAddress: "Số 18, Ngõ 92 Nguyễn Khánh Toàn, Cầu Giấy, Hà Nội",
    carrier: "Giao Hàng Tiết Kiệm (GHTK)",
    note: "Giao giờ hành chính, gọi trước khi đến",
  });

  useEffect(() => {
    async function loadReceipts() {
      setLoading(true);
      try {
        if (user) {
          const { data } = await supabase
            .from("export_receipts")
            .select("*")
            .eq("customer_id", user.id)
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            setReceipts(data.map((d: any) => ({
              id: d.id,
              receipt_code: d.receipt_code,
              receiver_name: d.receiver_name,
              receiver_phone: d.receiver_phone,
              delivery_address: d.delivery_address,
              shipping_carrier: d.shipping_carrier || "GHTK",
              total_packages: Number(d.total_packages || 1),
              total_weight_kg: Number(d.total_weight_kg || 0),
              shipping_fee_vnd: Number(d.shipping_fee_vnd || 0),
              status: d.status || "pending",
              created_at: d.created_at,
            })));
            setLoading(false);
            return;
          }
        }

        // Demo fallback
        setReceipts([
          {
            id: "rc-1",
            receipt_code: "PXK-202610-0192",
            receiver_name: "Nguyễn Văn Trung",
            receiver_phone: "0912345678",
            delivery_address: "Số 18, Ngõ 92 Nguyễn Khánh Toàn, Cầu Giấy, Hà Nội",
            shipping_carrier: "Shipper Nam Trung Nội Thành",
            total_packages: 5,
            total_weight_kg: 18.5,
            shipping_fee_vnd: 80000,
            status: "delivered",
            created_at: "2026-10-20T10:00:00.000Z",
          },
          {
            id: "rc-2",
            receipt_code: "PXK-202610-0210",
            receiver_name: "Nguyễn Văn Trung",
            receiver_phone: "0912345678",
            delivery_address: "Kho Hà Nội (Khách qua lấy trực tiếp)",
            shipping_carrier: "Tự lấy tại kho",
            total_packages: 2,
            total_weight_kg: 6.2,
            shipping_fee_vnd: 0,
            status: "pending",
            created_at: "2026-10-24T15:30:00.000Z",
          },
        ]);
      } catch (err) {
        console.error("Load receipts error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReceipts();
  }, [user]);

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const code = `PXK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (user) {
        await supabase.from("export_receipts").insert({
          receipt_code: code,
          customer_id: user.id,
          receiver_name: formData.receiverName,
          receiver_phone: formData.receiverPhone,
          delivery_address: formData.deliveryAddress,
          shipping_carrier: formData.carrier,
          total_packages: 1,
          total_weight_kg: 3.5,
          shipping_fee_vnd: 45000,
          status: "pending",
        });
      }

      setReceipts([
        {
          id: `rc-${Date.now()}`,
          receipt_code: code,
          receiver_name: formData.receiverName,
          receiver_phone: formData.receiverPhone,
          delivery_address: formData.deliveryAddress,
          shipping_carrier: formData.carrier,
          total_packages: 1,
          total_weight_kg: 3.5,
          shipping_fee_vnd: 45000,
          status: "pending",
          created_at: new Date().toISOString(),
        },
        ...receipts,
      ]);

      alert(`Đã tạo yêu cầu xuất giao hàng ${code} thành công! Kho VN sẽ chuẩn bị hàng để giao.`);
      setShowCreateModal(false);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-600" />
            <span>Yêu Cầu Xuất Kho & Giao Hàng</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Quản lý các kiện hàng đã về kho Việt Nam và tạo lệnh giao hàng tận nơi
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Yêu Cầu Xuất Giao</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">Danh Sách Phiếu Xuất Kho</h3>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
            <span className="text-xs">Đang tải phiếu xuất kho...</span>
          </div>
        ) : receipts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">Chưa có phiếu xuất kho nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Mã Phiếu</th>
                  <th className="py-3.5 px-4">Người Nhận / SĐT</th>
                  <th className="py-3.5 px-4">Địa Chỉ Nhận Hàng</th>
                  <th className="py-3.5 px-4">Hình Thức Giao</th>
                  <th className="py-3.5 px-4">Số Kiện / Cân Nặng</th>
                  <th className="py-3.5 px-4">Cước Giao</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Ngày Tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {receipts.map((rc) => (
                  <tr key={rc.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-brand-700">{rc.receipt_code}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-900 block">{rc.receiver_name}</span>
                      <span className="font-mono text-gray-400 text-[11px]">{rc.receiver_phone}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 max-w-xs truncate">{rc.delivery_address}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{rc.shipping_carrier}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-900 block">{rc.total_packages} kiện</span>
                      <span className="text-[11px] text-gray-500">{rc.total_weight_kg} kg</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-gray-900">
                      {rc.shipping_fee_vnd > 0 ? formatVND(rc.shipping_fee_vnd) : "Miễn phí"}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        rc.status === "delivered" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        rc.status === "delivering" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {rc.status === "delivered" ? "Đã nhận hàng" :
                         rc.status === "delivering" ? "Đang giao" : "Chờ gom hàng"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-400">{formatDate(rc.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tạo Lệnh Xuất Kho */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateReceipt} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <h3 className="font-bold text-base text-gray-900">Tạo Yêu Cầu Xuất Kho Giao Hàng</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Họ tên người nhận *</label>
                <input
                  type="text"
                  required
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Số điện thoại nhận hàng *</label>
                <input
                  type="tel"
                  required
                  value={formData.receiverPhone}
                  onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Địa chỉ nhận hàng chi tiết *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="Số nhà, ngõ, phường, quận/huyện, tỉnh/thành..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Hình thức giao hàng</label>
                <select
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  <option value="Giao Hàng Tiết Kiệm (GHTK)">Giao Hàng Tiết Kiệm (GHTK) - Toàn quốc</option>
                  <option value="Viettel Post">Viettel Post - Toàn quốc</option>
                  <option value="Shipper Nam Trung Nội Thành">Shipper Nam Trung Nội Thành (Hà Nội & HCM)</option>
                  <option value="Gửi Xe Khách / Chành Xe">Gửi Xe Khách / Chành Xe theo yêu cầu</option>
                  <option value="Tự Lấy Tại Kho Nam Trung">Tự lấy hàng trực tiếp tại kho Nam Trung</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Ghi chú giao hàng</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Gửi Yêu Cầu</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
