"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatVND, formatDate } from "@/lib/utils";
import { Plus, Package, Search, ArrowRight, Truck } from "lucide-react";

const MOCK_DEPOSITS = [
  {
    id: "dep-1",
    code: "KG-20261020-0012",
    tracking_code: "773291884210",
    item_name: "Linh kiện điện tử & phụ kiện máy tính",
    weight_kg: 3.5,
    volume_cbm: 0.012,
    destination: "Kho Hà Nội",
    status_text: "Đã về kho Hà Nội",
    fee_weight: 77000,
    created_at: "2026-10-20T08:15:00.000Z",
  },
  {
    id: "dep-2",
    code: "KG-20261022-0045",
    tracking_code: "882194012951",
    item_name: "Hàng mẫu may mặc xuất khẩu",
    weight_kg: 1.2,
    volume_cbm: 0.005,
    destination: "Kho Hà Nội",
    status_text: "Đang trên đường về Việt Nam",
    fee_weight: 30000,
    created_at: "2026-10-22T10:30:00.000Z",
  },
];

export default function DepositOrdersPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý Đơn Ký Gửi / Vận Chuyển
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Khai báo mã vận đơn Trung Quốc ký gửi về kho và vận chuyển về Việt Nam
          </p>
        </div>

        <Link
          href="/deposit/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đơn Ký Gửi</span>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã ký gửi, mã vận đơn TQ..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="py-3.5 px-4">Mã Ký Gửi</th>
                <th className="py-3.5 px-4">Mã Vận Đơn TQ</th>
                <th className="py-3.5 px-4">Tên Hàng Hóa</th>
                <th className="py-3.5 px-4">Cân Nặng / Thể Tích</th>
                <th className="py-3.5 px-4">Cước Vận Chuyển</th>
                <th className="py-3.5 px-4">Kho Đích</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_DEPOSITS.map((dep) => (
                <tr key={dep.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-brand-700">
                    {dep.code}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-purple-700">
                    {dep.tracking_code}
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-800">
                    {dep.item_name}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    <span className="font-bold text-gray-900 block">{dep.weight_kg} kg</span>
                    <span className="text-[10px] text-gray-400">{dep.volume_cbm} m³</span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-700">
                    {formatVND(dep.fee_weight)}
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-700">
                    {dep.destination}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {dep.status_text}
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
