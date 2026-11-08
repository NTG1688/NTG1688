"use client";

import React from "react";
import { formatVND, formatDate } from "@/lib/utils";
import { FileText, Download, ShieldCheck, Search, Filter } from "lucide-react";

const MOCK_DECLARATIONS = [
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
];

export default function DeclarationsPage() {
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

        <button className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all self-start sm:self-auto">
          <Download className="w-4 h-4" />
          <span>Xuất File Excel Hải Quan</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
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
              {MOCK_DECLARATIONS.map((dec) => (
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
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {dec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
