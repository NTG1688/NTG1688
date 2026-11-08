"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  MessageSquare,
  DollarSign,
  FileText,
  AlertCircle
} from "lucide-react";
import { formatVND, formatCNY, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/ui/ImageUploader";

interface ComplaintItem {
  id: string;
  complaint_code: string;
  order_code: string;
  type: string;
  title: string;
  content: string;
  refund_requested_cny: number;
  refund_approved_vnd: number;
  status: "pending" | "investigating" | "accepted" | "rejected" | "completed";
  admin_response?: string;
  images: string[];
  created_at: string;
}

const TYPE_MAP: Record<string, string> = {
  broken: "Hàng bị vỡ hỏng / Móp méo",
  wrong_item: "Shop TQ phát sai mẫu / màu / size",
  missing: "Thiếu số lượng so với đặt",
  slow: "Chậm hàng quá thời gian cam kết",
  other: "Khiếu nại khác",
};

export default function CustomerComplainPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form khiếu nại mới
  const [formData, setFormData] = useState({
    orderCode: "MD2596",
    type: "missing",
    title: "",
    content: "",
    refundCny: 0,
    imageUrl: "",
  });

  useEffect(() => {
    async function loadComplaints() {
      setLoading(true);
      try {
        if (user) {
          const { data } = await supabase
            .from("complaints")
            .select("*, orders(order_code)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            setComplaints(data.map((d: any) => ({
              id: d.id,
              complaint_code: d.complaint_code,
              order_code: d.orders?.order_code || "MD2596",
              type: d.type,
              title: d.title,
              content: d.content,
              refund_requested_cny: Number(d.refund_requested_cny || 0),
              refund_approved_vnd: Number(d.refund_approved_vnd || 0),
              status: d.status || "pending",
              admin_response: d.admin_response,
              images: Array.isArray(d.images) ? d.images : [],
              created_at: d.created_at,
            })));
            setLoading(false);
            return;
          }
        }

        // Demo fallback
        setComplaints([
          {
            id: "cp-1",
            complaint_code: "KN-202610-0045",
            order_code: "MD2572",
            type: "missing",
            title: "Shop 1688 phát thiếu 5 cái hộp bảo quản chân không",
            content: "Đơn đặt 50 bộ nhưng khi kiểm đếm thực tế chỉ nhận được 45 bộ. Đề nghị đòi hoàn tiền 5 bộ từ shop Taobao.",
            refund_requested_cny: 150,
            refund_approved_vnd: 602250,
            status: "accepted",
            admin_response: "Đã làm việc với shop Trung Quốc, shop đồng ý hoàn tiền 150 CNY. Tiền đã được hoàn vào ví của quý khách.",
            images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&q=80"],
            created_at: "2026-10-17T11:20:00.000Z",
          },
          {
            id: "cp-2",
            complaint_code: "KN-202610-0052",
            order_code: "MD2588",
            type: "wrong_item",
            title: "Áo phông nhận sai màu trắng thành màu đen",
            content: "Yêu cầu shop đổi trả hoặc bồi thường chiết khấu 30%.",
            refund_requested_cny: 80,
            refund_approved_vnd: 0,
            status: "investigating",
            admin_response: "Nhân viên mua hàng đang chat đàm phán với chủ shop trên AliWangwang.",
            images: [],
            created_at: "2026-10-21T09:40:00.000Z",
          },
        ]);
      } catch (err) {
        console.error("Load complaints error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadComplaints();
  }, [user]);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("Vui lòng điền tiêu đề và nội dung khiếu nại.");
      return;
    }

    setSubmitting(true);
    try {
      const code = `KN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (user) {
        await supabase.from("complaints").insert({
          complaint_code: code,
          user_id: user.id,
          type: formData.type,
          title: formData.title,
          content: formData.content,
          refund_requested_cny: formData.refundCny,
          refund_requested_vnd: formData.refundCny * 4015,
          images: formData.imageUrl ? [formData.imageUrl] : [],
          status: "pending",
        });
      }

      setComplaints([
        {
          id: `cp-${Date.now()}`,
          complaint_code: code,
          order_code: formData.orderCode,
          type: formData.type,
          title: formData.title,
          content: formData.content,
          refund_requested_cny: formData.refundCny,
          refund_approved_vnd: 0,
          status: "pending",
          images: formData.imageUrl ? [formData.imageUrl] : [],
          created_at: new Date().toISOString(),
        },
        ...complaints,
      ]);

      alert(`Đã gửi khiếu nại ${code}! Bộ phận CSKH Nam Trung sẽ phản hồi trong vòng 24h.`);
      setShowCreateModal(false);
      setFormData({
        orderCode: "MD2596",
        type: "missing",
        title: "",
        content: "",
        refundCny: 0,
        imageUrl: "",
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
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <span>Khiếu Nại & Yêu Cầu Bồi Thường</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Nam Trung cam kết bảo vệ quyền lợi 100%, hỗ trợ đòi hoàn tiền từ shop Trung Quốc và bồi hoàn thỏa đáng
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Gửi Khiếu Nại Mới</span>
        </button>
      </div>

      {/* Cards List */}
      {loading ? (
        <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
          <span className="text-xs">Đang tải danh sách khiếu nại...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="py-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 p-8">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
          <h3 className="text-base font-bold text-gray-800">Không có khiếu nại nào đang xử lý</h3>
          <p className="text-xs text-gray-400 mt-1">Các đơn hàng của bạn đang được vận chuyển an toàn.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-black text-amber-700 text-sm">{item.complaint_code}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-semibold">
                    Đơn: {item.order_code}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    · {TYPE_MAP[item.type] || item.type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">{formatDate(item.created_at)}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    item.status === "accepted" || item.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    item.status === "investigating" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                    item.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                    "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {item.status === "accepted" ? "Đã chấp thuận bồi thường" :
                     item.status === "investigating" ? "Đang đàm phán với shop TQ" :
                     item.status === "completed" ? "Đã hoàn tất" : "Chờ tiếp nhận"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.content}</p>
              </div>

              {item.images.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  {item.images.map((img, idx) => (
                    <img key={idx} src={img} alt="Bằng chứng" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                  ))}
                </div>
              )}

              {/* Phản hồi từ Admin / CSKH */}
              {item.admin_response && (
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Phản hồi từ CSKH Nam Trung:
                  </span>
                  <p className="text-blue-800 leading-relaxed">{item.admin_response}</p>
                  {item.refund_approved_vnd > 0 && (
                    <span className="font-bold text-emerald-700 block mt-1">
                      Số tiền đã bồi hoàn vào ví: +{formatVND(item.refund_approved_vnd)}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Gửi Khiếu Nại Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateComplaint} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-gray-900">Gửi Khiếu Nại Đơn Hàng</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Mã đơn hàng liên quan *</label>
                <input
                  type="text"
                  required
                  value={formData.orderCode}
                  onChange={(e) => setFormData({ ...formData, orderCode: e.target.value })}
                  placeholder="VD: MD2596"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Loại sự cố *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  <option value="broken">Hàng bị vỡ hỏng / Móp méo khi vận chuyển</option>
                  <option value="wrong_item">Shop Trung Quốc phát sai mẫu / màu / kích cỡ</option>
                  <option value="missing">Thiếu số lượng so với đặt hàng</option>
                  <option value="slow">Chậm hàng quá thời gian cam kết</option>
                  <option value="other">Lý do khác</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Tiêu đề ngắn gọn *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Thiếu 5 cái áo thun trong kiện hàng"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Mô tả chi tiết sự cố *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Mô tả cụ thể tình trạng hàng nhận được..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Số tiền đề nghị hoàn trả (Tệ - CNY)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.refundCny}
                  onChange={(e) => setFormData({ ...formData, refundCny: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  ~ Tương đương: {formatVND(formData.refundCny * 4015)}
                </span>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Upload ảnh bằng chứng thực tế</label>
                <ImageUploader
                  currentImageUrl={formData.imageUrl}
                  onImageUploaded={(url: string) => setFormData({ ...formData, imageUrl: url })}
                  folder="complaints"
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
                <span>Gửi Khiếu Nại</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
