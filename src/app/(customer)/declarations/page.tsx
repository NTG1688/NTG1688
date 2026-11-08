"use client";

import React, { useState, useEffect } from "react";
import { formatVND, formatDate } from "@/lib/utils";
import { FileText, Download, ShieldCheck, Search, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

interface DeclarationRow {
  id: string;
  ma_kb: string;
  order_code: string;
  hs_code: string;
  description: string;
  consignee: string;
  unit: string;
  quantity: number;
  tax_vat_rate: number;
  tax_nk_rate: number;
  specialized_fee: number;
  fee_utnk: number;
  status: string;
  created_at: string;
}

export default function DeclarationsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [declarations, setDeclarations] = useState<DeclarationRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadDeclarations() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("declarations")
          .select("*, orders(order_code, customer_id)")
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Declarations query error:", error.message);
        }

        if (data && data.length > 0) {
          setDeclarations(
            data.map((d: any) => ({
              id: d.id,
              ma_kb: d.declaration_code,
              order_code: d.orders?.order_code || "N/A",
              hs_code: d.hs_code || "",
              description: d.product_description || "",
              consignee: d.consignee || "CÔNG TY TNHH DỊCH VỤ VÀ THƯƠNG MẠI QUỐC TẾ NAM TRUNG",
              unit: d.unit || "PCE",
              quantity: Number(d.quantity || 0),
              tax_vat_rate: Number(d.tax_vat_rate || 0),
              tax_nk_rate: Number(d.tax_nk_rate || 0),
              specialized_fee: Number(d.specialized_fee || 0),
              fee_utnk: Number(d.fee_utnk || 1200000),
              status: d.status === 1 ? "Đang khai báo" : d.status === 2 ? "Đang kiểm hóa" : d.status === 3 ? "Đã duyệt thông quan" : "Chờ xử lý",
              created_at: d.created_at,
            }))
          );
        } else {
          // Demo data
          setDeclarations([
            {
              id: "dec-1",
              ma_kb: "MD2596-1",
              order_code: "MD2596",
              hs_code: "8479.89.90",
              description: "Máy và thiết bị cơ khí phục vụ công nghiệp loại khác",
              consignee: "CÔNG TY TNHH DỊCH VỤ VÀ THƯƠNG MẠI QUỐC TẾ NAM TRUNG",
              unit: "PCE",
              quantity: 119,
              tax_vat_rate: 8,
              tax_nk_rate: 0,
              specialized_fee: 0,
              fee_utnk: 1200000,
              status: "Đã duyệt thông quan",
              created_at: "2026-10-21T04:45:36.000Z",
            },
            {
              id: "dec-2",
              ma_kb: "MD2588-1",
              order_code: "MD2588",
              hs_code: "6109.10.00",
              description: "Áo phông nam nữ chất liệu cotton dệt kim",
              consignee: "CÔNG TY TNHH DỊCH VỤ VÀ THƯƠNG MẠI QUỐC TẾ NAM TRUNG",
              unit: "PCE",
              quantity: 500,
              tax_vat_rate: 8,
              tax_nk_rate: 12,
              specialized_fee: 1500000,
              fee_utnk: 2500000,
              status: "Đang kiểm hóa",
              created_at: "2026-10-18T10:00:00.000Z",
            },
          ]);
        }
      } catch (err) {
        console.error("Load declarations error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDeclarations();
  }, [user]);

  const filteredDeclarations = declarations.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.ma_kb.toLowerCase().includes(q) ||
      d.order_code.toLowerCase().includes(q) ||
      d.hs_code.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q)
    );
  });

  const handleExportExcel = () => {
    // Tạo CSV/TSV xuất dạng bảng Hải quan
    const headers = ["Mã Khai Báo", "Đơn Hàng", "HS Code", "Mô Tả Mặt Hàng", "SL", "ĐVT", "Thuế NK (%)", "VAT (%)", "Phí UTNK (VNĐ)", "Trạng Thái"];
    const rows = filteredDeclarations.map((d) => [
      d.ma_kb, d.order_code, d.hs_code, d.description,
      d.quantity, d.unit, d.tax_nk_rate, d.tax_vat_rate,
      d.fee_utnk, d.status
    ]);

    const csvContent = [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `to-khai-hai-quan-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Tờ Khai Hải Quan Chính Ngạch (NKCN)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Quản lý mã HS Code, biểu thuế nhập khẩu, thuế VAT và xuất chứng từ hải quan
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Xuất File Excel Hải Quan</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo mã khai báo, mã HS Code, mô tả..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
            <span className="text-xs">Đang tải dữ liệu tờ khai hải quan...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Mã Khai Báo</th>
                  <th className="py-3.5 px-4">Đơn Hàng</th>
                  <th className="py-3.5 px-4">Mã HS Code</th>
                  <th className="py-3.5 px-4">Mô Tả Mặt Hàng</th>
                  <th className="py-3.5 px-4">Số Lượng / ĐVT</th>
                  <th className="py-3.5 px-4">Thuế NK / VAT</th>
                  <th className="py-3.5 px-4">Phí Ủy Thác</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDeclarations.map((dec) => (
                  <tr key={dec.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-brand-700">
                      {dec.ma_kb}
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-600 font-semibold">
                      {dec.order_code}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-purple-700">
                      {dec.hs_code}
                    </td>
                    <td className="py-4 px-4 text-gray-800 font-medium max-w-xs truncate">
                      {dec.description}
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-900">
                      {dec.quantity} {dec.unit}
                    </td>
                    <td className="py-4 px-4">
                      <span className="block text-gray-700">NK: {dec.tax_nk_rate}%</span>
                      <span className="block text-gray-400">VAT: {dec.tax_vat_rate}%</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-700 font-mono">
                      {formatVND(dec.fee_utnk)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        dec.status === "Đã duyệt thông quan" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        dec.status === "Đang kiểm hóa" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-purple-50 text-purple-700 border-purple-200"
                      }`}>
                        {dec.status}
                      </span>
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
