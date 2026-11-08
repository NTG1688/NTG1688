"use client";

import React, { useState, useEffect } from "react";
import { 
  Receipt, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Loader2,
  DollarSign,
  Package
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AdminExportReceipt {
  id: string;
  receipt_code: string;
  customer_name: string;
  customer_code: string;
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  shipping_carrier: string;
  total_packages: number;
  total_weight_kg: number;
  shipping_fee_vnd: number;
  status: "pending" | "delivering" | "delivered";
  created_at: string;
}

export default function AdminExportReceiptsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<AdminExportReceipt[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadAllReceipts() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("export_receipts")
          .select("*, profiles:customer_id(full_name, user_code)")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setReceipts(data.map((d: any) => ({
            id: d.id,
            receipt_code: d.receipt_code,
            customer_name: d.profiles?.full_name || d.receiver_name,
            customer_code: d.profiles?.user_code || "NT2820",
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
        } else {
          // Demo fallback
          setReceipts([
            {
              id: "rc-1",
              receipt_code: "PXK-202610-0192",
              customer_name: "Nguyễn Văn Trung",
              customer_code: "NT2820",
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
              customer_name: "Nguyễn Văn Trung",
              customer_code: "NT2820",
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
            {
              id: "rc-3",
              receipt_code: "PXK-202610-0222",
              customer_name: "Lê Hoàng Quân",
              customer_code: "NT5591",
              receiver_name: "Lê Hoàng Quân",
              receiver_phone: "0988776655",
              delivery_address: "Khu Công Nghiệp Tân Bình, TP. Hồ Chí Minh",
              shipping_carrier: "Viettel Post Liên Tỉnh",
              total_packages: 12,
              total_weight_kg: 54.0,
              shipping_fee_vnd: 250000,
              status: "delivering",
              created_at: "2026-10-26T09:15:00.000Z",
            },
          ]);
        }
      } catch (err) {
        console.error("Load admin receipts error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllReceipts();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: AdminExportReceipt["status"]) => {
    try {
      await supabase
        .from("export_receipts")
        .update({ status: newStatus })
        .eq("id", id);

      setReceipts(receipts.map((r) => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error("Update receipt status error:", err);
    }
  };

  const handlePrint = (rc: AdminExportReceipt) => {
    window.print();
  };

  const filteredReceipts = receipts.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.receipt_code.toLowerCase().includes(q) ||
      r.customer_name.toLowerCase().includes(q) ||
      r.customer_code.toLowerCase().includes(q) ||
      r.receiver_phone.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
            Quản Lý Xuất Kho Việt Nam
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-purple-600" />
            <span>Phiếu Xuất Kho & Bàn Giao Hàng</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Theo dõi danh sách các phiếu xuất kho giao khách tại Kho Hà Nội và Kho TP.HCM
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo mã phiếu, mã KH, số điện thoại người nhận..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-xs">Đang tải phiếu xuất kho...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Mã Phiếu</th>
                  <th className="py-3.5 px-4">Khách Hàng (Mã KH)</th>
                  <th className="py-3.5 px-4">Người Nhận & SĐT</th>
                  <th className="py-3.5 px-4">Địa Chỉ Giao Hàng</th>
                  <th className="py-3.5 px-4">Đơn Vị VC</th>
                  <th className="py-3.5 px-4">Số Kiện / Khối Lượng</th>
                  <th className="py-3.5 px-4">Cước Giao (VNĐ)</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">In Phiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReceipts.map((rc) => (
                  <tr key={rc.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-black text-purple-700 text-sm">
                      {rc.receipt_code}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-900 block">{rc.customer_name}</span>
                      <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded inline-block">
                        {rc.customer_code}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-800 block">{rc.receiver_name}</span>
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
                      <select
                        value={rc.status}
                        onChange={(e) => handleUpdateStatus(rc.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border focus:outline-none ${
                          rc.status === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          rc.status === "delivering" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <option value="pending">Chờ gom hàng</option>
                        <option value="delivering">Đang giao hàng</option>
                        <option value="delivered">Đã giao thành công</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handlePrint(rc)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-purple-700 transition-colors cursor-pointer"
                        title="In phiếu xuất kho A4/A5"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
