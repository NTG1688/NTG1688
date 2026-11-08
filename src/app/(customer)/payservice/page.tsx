"use client";

import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { formatVND, formatCNY, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/ui/ImageUploader";

interface PayServiceItem {
  id: string;
  pay_code: string;
  alipay_account: string;
  total_cny: number;
  exchange_rate: number;
  fee_cny: number;
  total_vnd: number;
  qr_image_url?: string;
  note?: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  created_at: string;
}

export default function PayServicePage() {
  const { user, profile } = useAuth();
  const supabase = createClient();
  const [exchangeRate] = useState(4015);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<PayServiceItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form tạo lệnh
  const [formData, setFormData] = useState({
    alipayAccount: "",
    amountCny: 1000,
    feePercent: 1.5, // 1.5% phí thanh toán hộ
    qrImage: "",
    note: "",
  });

  useEffect(() => {
    async function loadPayServices() {
      setLoading(true);
      try {
        if (user) {
          const { data } = await supabase
            .from("pay_services")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            setServices(data.map((d: any) => ({
              id: d.id,
              pay_code: d.pay_code,
              alipay_account: d.alipay_account,
              total_cny: Number(d.total_cny || 0),
              exchange_rate: Number(d.exchange_rate || 4015),
              fee_cny: Number(d.fee_cny || 0),
              total_vnd: Number(d.total_vnd || 0),
              qr_image_url: d.qr_image_url,
              note: d.note,
              status: d.status || "pending",
              created_at: d.created_at,
            })));
            setLoading(false);
            return;
          }
        }

        // Demo fallback
        setServices([
          {
            id: "pay-1",
            pay_code: "NTG-PAY-202610-0082",
            alipay_account: "namtrung1688@alipay.com",
            total_cny: 4500,
            exchange_rate: 4015,
            fee_cny: 67.5,
            total_vnd: 18338513,
            note: "Thanh toán đơn hàng 1688 OEM nội thất",
            status: "completed",
            created_at: "2026-10-22T08:30:00.000Z",
          },
          {
            id: "pay-2",
            pay_code: "NTG-PAY-202610-0091",
            alipay_account: "supplier9988@163.com",
            total_cny: 12000,
            exchange_rate: 4015,
            fee_cny: 180,
            total_vnd: 48902700,
            note: "Ủy thác thanh toán WeChat Pay đơn hàng linh kiện",
            status: "processing",
            created_at: "2026-10-25T14:15:00.000Z",
          },
        ]);
      } catch (err) {
        console.error("Load pay services error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPayServices();
  }, [user]);

  const feeCny = Math.round((formData.amountCny * formData.feePercent) / 100 * 10) / 10;
  const totalCny = formData.amountCny + feeCny;
  const totalVnd = Math.round(totalCny * exchangeRate);

  const handleCreatePayService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.alipayAccount || formData.amountCny <= 0) {
      alert("Vui lòng điền tài khoản Alipay và số tiền Tệ hợp lệ.");
      return;
    }

    setSubmitting(true);
    try {
      const payCode = `NTG-PAY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (user) {
        await supabase.from("pay_services").insert({
          pay_code: payCode,
          user_id: user.id,
          alipay_account: formData.alipayAccount.trim(),
          total_cny: formData.amountCny,
          exchange_rate: exchangeRate,
          fee_cny: feeCny,
          total_vnd: totalVnd,
          qr_image_url: formData.qrImage || null,
          note: formData.note,
          status: "pending",
        });
      }

      setServices([
        {
          id: `pay-${Date.now()}`,
          pay_code: payCode,
          alipay_account: formData.alipayAccount,
          total_cny: formData.amountCny,
          exchange_rate: exchangeRate,
          fee_cny: feeCny,
          total_vnd: totalVnd,
          qr_image_url: formData.qrImage,
          note: formData.note,
          status: "pending",
          created_at: new Date().toISOString(),
        },
        ...services,
      ]);

      alert(`Đã gửi yêu cầu thanh toán hộ ${payCode}! Nhân viên Nam Trung sẽ kiểm tra và thực hiện trong 15 phút.`);
      setShowCreateModal(false);
      setFormData({
        alipayAccount: "",
        amountCny: 1000,
        feePercent: 1.5,
        qrImage: "",
        note: "",
      });
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
            <CreditCard className="w-6 h-6 text-brand-600" />
            <span>Dịch Vụ Thanh Toán Hộ (Alipay / WeChat Pay)</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Ủy thác thanh toán trực tiếp đơn hàng Taobao, 1688, Tmall hoặc chuyển tiền cho đối tác Trung Quốc
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Lệnh Thanh Toán Hộ</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Tỷ giá thanh toán hôm nay</span>
          <div className="text-xl font-black text-brand-700 font-mono mt-1">1 CNY = {exchangeRate.toLocaleString()} VNĐ</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Tỷ giá cạnh tranh nhất thị trường</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Tốc độ xử lý lệnh</span>
          <div className="text-xl font-black text-purple-700 font-mono mt-1">5 - 15 Phút</div>
          <span className="text-[11px] text-gray-500 font-semibold">Nhân viên trực 8:00 - 23:00 hàng ngày</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Hạn mức tối đa</span>
          <div className="text-xl font-black text-emerald-700 font-mono mt-1">Không giới hạn</div>
          <span className="text-[11px] text-gray-500 font-semibold">Hỗ trợ ủy thác thanh toán chính ngạch</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">Lịch Sử Các Lệnh Thanh Toán Hộ</h3>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
            <span className="text-xs">Đang tải lịch sử lệnh thanh toán...</span>
          </div>
        ) : services.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <CreditCard className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">Chưa có lệnh thanh toán hộ nào. Bấm nút trên để tạo lệnh.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Mã Lệnh</th>
                  <th className="py-3.5 px-4">Tài Khoản Alipay / Nhận</th>
                  <th className="py-3.5 px-4">Số Tiền (CNY)</th>
                  <th className="py-3.5 px-4">Quy Đổi VNĐ</th>
                  <th className="py-3.5 px-4">Ghi Chú</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Ngày Tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-brand-700">{item.pay_code}</td>
                    <td className="py-4 px-4 font-mono text-gray-800 font-semibold">{item.alipay_account}</td>
                    <td className="py-4 px-4 font-mono font-bold text-gray-900">{formatCNY(item.total_cny)}</td>
                    <td className="py-4 px-4 font-mono font-extrabold text-emerald-700">{formatVND(item.total_vnd)}</td>
                    <td className="py-4 px-4 text-gray-500 max-w-xs truncate">{item.note || "—"}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        item.status === "processing" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        item.status === "cancelled" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {item.status === "completed" ? "Đã thanh toán" :
                         item.status === "processing" ? "Đang xử lý" :
                         item.status === "cancelled" ? "Đã hủy" : "Chờ xử lý"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-400">{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tạo Lệnh Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePayService} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-gray-900">Tạo Lệnh Thanh Toán Hộ Alipay / WeChat</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tài khoản Alipay / WeChat Pay nhận tiền *</label>
                <input
                  type="text"
                  required
                  value={formData.alipayAccount}
                  onChange={(e) => setFormData({ ...formData, alipayAccount: e.target.value })}
                  placeholder="VD: 13800138000 hoặc email@alipay.com"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Số tiền Tệ cần thanh toán (CNY) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.amountCny}
                  onChange={(e) => setFormData({ ...formData, amountCny: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm font-bold text-brand-700"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Upload Ảnh Mã QR Thanh Toán (Tùy chọn)</label>
                <ImageUploader
                  currentImageUrl={formData.qrImage}
                  onImageUploaded={(url: string) => setFormData({ ...formData, qrImage: url })}
                  folder="payservice-qr"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Ghi chú hoặc link đơn hàng</label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Ghi chú nội dung chuyển khoản cho shop..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              {/* Tính toán tự động */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Tiền cần thanh toán:</span>
                  <span className="font-mono font-bold text-gray-900">{formatCNY(formData.amountCny)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí dịch vụ ({formData.feePercent}%):</span>
                  <span className="font-mono text-gray-900">{formatCNY(feeCny)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tỷ giá áp dụng:</span>
                  <span className="font-mono font-bold text-gray-900">{exchangeRate.toLocaleString()} đ/CNY</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">Tổng tiền thanh toán (VNĐ):</span>
                  <span className="font-mono font-black text-emerald-700 text-base">{formatVND(totalVnd)}</span>
                </div>
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
                <span>Gửi Lệnh Thanh Toán</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
