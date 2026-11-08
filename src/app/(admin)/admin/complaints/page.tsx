"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  MessageSquare, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  ArrowRight
} from "lucide-react";
import { formatVND, formatCNY, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AdminComplaint {
  id: string;
  complaint_code: string;
  customer_name: string;
  customer_code: string;
  customer_id: string;
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

export default function AdminComplaintsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal xử lý khiếu nại
  const [handlingItem, setHandlingItem] = useState<AdminComplaint | null>(null);
  const [responseText, setResponseText] = useState("");
  const [approvedVnd, setApprovedVnd] = useState(0);
  const [actionStatus, setActionStatus] = useState<AdminComplaint["status"]>("accepted");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadComplaints() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("complaints")
          .select("*, profiles:user_id(full_name, user_code, id), orders(order_code)")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setComplaints(data.map((d: any) => ({
            id: d.id,
            complaint_code: d.complaint_code,
            customer_name: d.profiles?.full_name || "Khách Hàng",
            customer_code: d.profiles?.user_code || "NT2820",
            customer_id: d.profiles?.id || d.user_id,
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
        } else {
          // Demo fallback
          setComplaints([
            {
              id: "cp-1",
              complaint_code: "KN-202610-0045",
              customer_name: "Nguyễn Văn Trung",
              customer_code: "NT2820",
              customer_id: "u-1",
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
              customer_name: "Nguyễn Văn Trung",
              customer_code: "NT2820",
              customer_id: "u-1",
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
        }
      } catch (err) {
        console.error("Load admin complaints error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadComplaints();
  }, []);

  const handleProcessComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handlingItem) return;

    setProcessing(true);
    try {
      // 1. Cập nhật trạng thái khiếu nại
      await supabase
        .from("complaints")
        .update({
          status: actionStatus,
          admin_response: responseText,
          refund_approved_vnd: approvedVnd,
          updated_at: new Date().toISOString(),
        })
        .eq("id", handlingItem.id);

      // 2. Nếu chấp thuận bồi hoàn > 0, cộng tiền vào ví khách hàng
      if (actionStatus === "accepted" && approvedVnd > 0 && handlingItem.customer_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("wallet_balance")
          .eq("id", handlingItem.customer_id)
          .single();

        const currentBal = Number(profile?.wallet_balance || 0);
        const nextBal = currentBal + approvedVnd;

        await supabase
          .from("profiles")
          .update({ wallet_balance: nextBal })
          .eq("id", handlingItem.customer_id);

        await supabase.from("wallet_transactions").insert({
          transaction_code: `HT-${Date.now()}`,
          user_id: handlingItem.customer_id,
          amount: approvedVnd,
          balance_after: nextBal,
          type: "refund",
          note: `Bồi hoàn tiền khiếu nại ${handlingItem.complaint_code}`,
        });
      }

      setComplaints(complaints.map((c) => c.id === handlingItem.id ? {
        ...c,
        status: actionStatus,
        admin_response: responseText,
        refund_approved_vnd: approvedVnd,
      } : c));

      alert(`Đã cập nhật khiếu nại ${handlingItem.complaint_code} thành công!`);
      setHandlingItem(null);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.complaint_code.toLowerCase().includes(q) ||
      c.customer_name.toLowerCase().includes(q) ||
      c.customer_code.toLowerCase().includes(q) ||
      c.order_code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
            Dịch Vụ Khách Hàng & Xử Lý Tranh Chấp
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-purple-600" />
            <span>Xử Lý Khiếu Nại & Đòi Hoàn Tiền (TuiKuan)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tiếp nhận khiếu nại từ khách hàng, đàm phán đòi tiền shop Taobao/1688 và duyệt bồi hoàn ví
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo mã khiếu nại, mã đơn, tên khách..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-xs">Đang tải khiếu nại...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Mã KN</th>
                  <th className="py-3.5 px-4">Khách Hàng</th>
                  <th className="py-3.5 px-4">Đơn Hàng</th>
                  <th className="py-3.5 px-4">Nội Dung Sự Cố</th>
                  <th className="py-3.5 px-4">Đề Nghị Hoàn</th>
                  <th className="py-3.5 px-4">Đã Bồi Hoàn (VNĐ)</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Xử Lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-black text-amber-700 text-sm">{item.complaint_code}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-900 block">{item.customer_name}</span>
                      <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded inline-block">
                        {item.customer_code}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-gray-700">{item.order_code}</td>
                    <td className="py-4 px-4 max-w-xs">
                      <span className="font-bold text-gray-900 block truncate">{item.title}</span>
                      <span className="text-gray-500 text-[11px] line-clamp-1">{item.content}</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-gray-900">{formatCNY(item.refund_requested_cny)}</td>
                    <td className="py-4 px-4 font-mono font-bold text-emerald-700">{formatVND(item.refund_approved_vnd)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === "accepted" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        item.status === "investigating" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        item.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {item.status === "accepted" ? "Đã bồi thường" :
                         item.status === "investigating" ? "Đang đàm phán" :
                         item.status === "rejected" ? "Bị từ chối" : "Chờ xử lý"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setHandlingItem(item);
                          setResponseText(item.admin_response || "");
                          setApprovedVnd(item.refund_approved_vnd || Math.round(item.refund_requested_cny * 4015));
                          setActionStatus(item.status);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Xử lý</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Xử Lý Khiếu Nại */}
      {handlingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleProcessComplaint} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <h3 className="font-bold text-base text-gray-900">
              Xử Lý Khiếu Nại: <span className="text-amber-700 font-mono">{handlingItem.complaint_code}</span>
            </h3>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1 text-xs">
              <div><strong className="text-gray-700">Khách hàng:</strong> {handlingItem.customer_name} ({handlingItem.customer_code})</div>
              <div><strong className="text-gray-700">Đơn hàng:</strong> {handlingItem.order_code}</div>
              <div><strong className="text-gray-700">Tiêu đề:</strong> {handlingItem.title}</div>
              <div className="text-gray-600 mt-1">{handlingItem.content}</div>
              <div><strong className="text-gray-700">Số tiền khách yêu cầu hoàn:</strong> {formatCNY(handlingItem.refund_requested_cny)} (~{formatVND(handlingItem.refund_requested_cny * 4015)})</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Trạng thái quyết định *</label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                >
                  <option value="investigating">Đang đàm phán với shop Trung Quốc</option>
                  <option value="accepted">Chấp thuận bồi hoàn (Cộng tiền vào ví khách)</option>
                  <option value="rejected">Từ chối khiếu nại (Không đủ căn cứ)</option>
                </select>
              </div>

              {actionStatus === "accepted" && (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Số tiền duyệt bồi hoàn vào ví (VNĐ) *</label>
                  <input
                    type="number"
                    step={1000}
                    value={approvedVnd}
                    onChange={(e) => setApprovedVnd(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm font-bold text-emerald-700"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-gray-700 block mb-1">Nội dung phản hồi gửi khách hàng *</label>
                <textarea
                  required
                  rows={3}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Ghi rõ kết quả đàm phán với shop TQ hoặc lý do bồi thường..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setHandlingItem(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-5 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Lưu & Phản Hồi</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
