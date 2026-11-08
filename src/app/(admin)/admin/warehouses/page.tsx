"use client";

import React, { useState } from "react";
import { formatVND, formatDate } from "@/lib/utils";
import { 
  Truck, 
  Package, 
  Boxes, 
  QrCode, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Scale, 
  Layers,
  MapPin
} from "lucide-react";

const MOCK_BIG_PACKAGES = [
  {
    id: "bp-1",
    code: "xachtay1708",
    destination: "Kho Hà Nội",
    received_packs: 12,
    weight_kg: 24.5,
    volume_cbm: 0.18,
    status_text: "Đang trên đường về Việt Nam",
    ex_date: "2026-10-17T08:00:00.000Z",
  },
  {
    id: "bp-2",
    code: "BAO-QC-202610-09",
    destination: "Kho TP. Hồ Chí Minh",
    received_packs: 35,
    weight_kg: 68.2,
    volume_cbm: 0.42,
    status_text: "Đã tới kho Việt Nam",
    ex_date: "2026-10-15T12:00:00.000Z",
  },
];

export default function AdminWarehousesPage() {
  const [activeTab, setActiveTab] = useState<"scan" | "bigpackage" | "routes">("scan");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [scannedItems, setScannedItems] = useState([
    { code: "773291884210", weight: 3.5, time: "10:15:20" },
    { code: "882194012951", weight: 1.2, time: "10:14:02" },
  ]);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    setScannedItems([
      {
        code: barcodeInput,
        weight: parseFloat(weightInput) || 1.0,
        time: new Date().toLocaleTimeString(),
      },
      ...scannedItems,
    ]);
    setBarcodeInput("");
    setWeightInput("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-0.5">
            Quản Lý Vận Hành Kho Bãi & Bao Hàng
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý Kho Hàng & BigPackage
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quét mã nhập kho Trung Quốc, đóng bao lớn và giám sát lộ trình vận chuyển TQ-VN
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("scan")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "scan" ? "bg-brand-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Quét Mã Nhận Hàng (Scanner)</span>
        </button>

        <button
          onClick={() => setActiveTab("bigpackage")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "bigpackage" ? "bg-brand-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Quản Lý Bao Hàng Lớn (BigPackage)</span>
        </button>
      </div>

      {/* Tab 1: Scanner */}
      {activeTab === "scan" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900">Quét Mã Vận Đơn TQ</h3>
            <form onSubmit={handleScanSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mã Vận Đơn (Barcode / QR)</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Dùng máy quét barcode hoặc nhập tay..."
                  className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Cân Nặng Thực Tế (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="VD: 3.5"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Xác Nhận Nhập Kho
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900">Kiện Hàng Vừa Quét ({scannedItems.length})</h3>
              <span className="text-xs text-gray-400">Tự động cập nhật vào hệ thống khách hàng</span>
            </div>

            <div className="divide-y divide-gray-100">
              {scannedItems.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-gray-800 text-xs block">{item.code}</span>
                      <span className="text-[11px] text-gray-400 block">{item.time}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-brand-700 text-xs">{item.weight} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: BigPackage */}
      {activeTab === "bigpackage" && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900">Danh Sách Bao Hàng Lớn</h3>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Đóng Bao Mới</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Mã Bao Hàng</th>
                  <th className="py-3.5 px-4">Kho Đích Đến</th>
                  <th className="py-3.5 px-4">Số Kiện Con</th>
                  <th className="py-3.5 px-4">Cân Nặng / Thể Tích</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Ngày Xuất TQ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_BIG_PACKAGES.map((bp) => (
                  <tr key={bp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-brand-700">{bp.code}</td>
                    <td className="py-4 px-4 font-bold text-purple-700">{bp.destination}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">{bp.received_packs} kiện</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-800 block">{bp.weight_kg} kg</span>
                      <span className="text-[10px] text-gray-400">{bp.volume_cbm} m³</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {bp.status_text}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400">{formatDate(bp.ex_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
