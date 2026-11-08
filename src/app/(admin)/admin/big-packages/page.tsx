"use client";

import React, { useState, useEffect } from "react";
import { 
  Boxes, 
  Plus, 
  Truck, 
  Search, 
  Package, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  ScanLine,
  ArrowRight,
  Scale,
  Calendar
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface BigPackageRow {
  id: string;
  code: string;
  warehouse_name: string;
  total_weight_kg: number;
  total_volume_cbm: number;
  package_count: number;
  status: "packing" | "in_transit" | "arrived_vn" | "unpacked";
  vehicle_code?: string;
  departure_date?: string;
  arrival_date?: string;
  created_at: string;
}

export default function AdminBigPackagesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<BigPackageRow[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newBao, setNewBao] = useState({
    code: `BAO-HN-${Math.floor(100 + Math.random() * 900)}`,
    warehouse: "Kho Quảng Châu (Trung Quốc)",
    vehicle: "Xe tải số 14C-8921",
    weight: 45.8,
    volume: 0.25,
    packageCount: 18,
  });

  useEffect(() => {
    async function loadBigPackages() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("big_packages")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setPackages(data.map((d: any) => ({
            id: d.id,
            code: d.code,
            warehouse_name: "Kho Quảng Châu",
            total_weight_kg: Number(d.weight || d.total_weight_kg || 0),
            total_volume_cbm: Number(d.volume || d.total_volume_cbm || 0),
            package_count: Number(d.package_count || 1),
            status: d.status || "in_transit",
            vehicle_code: d.vehicle_code || "14C-8921",
            created_at: d.created_at,
          })));
        } else {
          // Demo fallback
          setPackages([
            {
              id: "bp-1",
              code: "xachtay1708",
              warehouse_name: "Kho Quảng Châu (CN)",
              total_weight_kg: 185.6,
              total_volume_cbm: 0.85,
              package_count: 42,
              status: "in_transit",
              vehicle_code: "Chuyến xe Cửa Khẩu Hữu Nghị 01",
              created_at: "2026-10-18T14:30:00.000Z",
            },
            {
              id: "bp-2",
              code: "BAO-HN-009",
              warehouse_name: "Kho Bằng Tường (CN)",
              total_weight_kg: 240.2,
              total_volume_cbm: 1.15,
              package_count: 58,
              status: "arrived_vn",
              vehicle_code: "Xe tải 29H-671.22",
              created_at: "2026-10-15T09:00:00.000Z",
            },
            {
              id: "bp-3",
              code: "BAO-HCM-003",
              warehouse_name: "Kho Bằng Tường (CN)",
              total_weight_kg: 420.0,
              total_volume_cbm: 2.3,
              package_count: 85,
              status: "unpacked",
              vehicle_code: "Container Sài Gòn 51D-9912",
              created_at: "2026-10-10T08:00:00.000Z",
            },
          ]);
        }
      } catch (err) {
        console.error("Load big packages error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBigPackages();
  }, []);

  const handleCreateBigPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (supabase) {
        await supabase.from("big_packages").insert({
          code: newBao.code,
          weight: newBao.weight,
          volume: newBao.volume,
          status: "in_transit",
        });
      }

      setPackages([
        {
          id: `bp-${Date.now()}`,
          code: newBao.code,
          warehouse_name: newBao.warehouse,
          total_weight_kg: newBao.weight,
          total_volume_cbm: newBao.volume,
          package_count: newBao.packageCount,
          status: "in_transit",
          vehicle_code: newBao.vehicle,
          created_at: new Date().toISOString(),
        },
        ...packages,
      ]);

      alert(`Đã niêm phong và tạo bao lớn ${newBao.code} thành công!`);
      setShowCreateModal(false);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: BigPackageRow["status"]) => {
    setPackages(packages.map((p) => p.id === id ? { ...p, status: newStatus } : p));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
            Quản Lý Vận Chuyển Tuyến TQ-VN
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-purple-600" />
            <span>Đóng Bao Hàng Lớn (BigPackage)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Gom các kiện hàng lẻ tại Kho TQ thành bao lớn, niêm phong và gán lên chuyến xe/container về Việt Nam
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-purple-700/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Niêm Phong Bao Mới</span>
        </button>
      </div>

      {/* Big Packages Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">Danh Sách Bao Hàng Đang Lưu Thông</h3>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-xs">Đang tải danh sách bao hàng...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Mã Bao Hàng</th>
                  <th className="py-3.5 px-4">Kho Đóng Bao</th>
                  <th className="py-3.5 px-4">Số Kiện Hàng</th>
                  <th className="py-3.5 px-4">Khối Lượng / Thể Tích</th>
                  <th className="py-3.5 px-4">Phương Tiện / Chuyến Xe</th>
                  <th className="py-3.5 px-4">Trạng Thái Vận Chuyển</th>
                  <th className="py-3.5 px-4 text-right">Ngày Niêm Phong</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-black text-purple-700 text-sm">
                      {pkg.code}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-800">{pkg.warehouse_name}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-md">{pkg.package_count} kiện lẻ</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-900 block font-mono">{pkg.total_weight_kg} kg</span>
                      <span className="text-[10px] text-gray-400 font-mono">{pkg.total_volume_cbm} m³</span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 font-medium">{pkg.vehicle_code}</td>
                    <td className="py-4 px-4">
                      <select
                        value={pkg.status}
                        onChange={(e) => handleUpdateStatus(pkg.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border focus:outline-none ${
                          pkg.status === "in_transit" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          pkg.status === "arrived_vn" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          pkg.status === "unpacked" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <option value="packing">Đang gom kiện</option>
                        <option value="in_transit">Đang về VN</option>
                        <option value="arrived_vn">Đã về kho VN</option>
                        <option value="unpacked">Đã rỡ bao kiểm đếm</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-400">{formatDate(pkg.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tạo Bao Hàng Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateBigPackage} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <h3 className="font-bold text-base text-gray-900">Niêm Phong Bao Hàng Lớn Mới</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Mã bao hàng *</label>
                <input
                  type="text"
                  required
                  value={newBao.code}
                  onChange={(e) => setNewBao({ ...newBao, code: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-purple-700"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Kho thực hiện đóng bao</label>
                <select
                  value={newBao.warehouse}
                  onChange={(e) => setNewBao({ ...newBao, warehouse: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  <option value="Kho Quảng Châu (CN)">Kho Quảng Châu (Trung Quốc)</option>
                  <option value="Kho Bằng Tường (CN)">Kho Bằng Tường (Trung Quốc)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tổng cân nặng (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newBao.weight}
                    onChange={(e) => setNewBao({ ...newBao, weight: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Số kiện lẻ trong bao *</label>
                  <input
                    type="number"
                    required
                    value={newBao.packageCount}
                    onChange={(e) => setNewBao({ ...newBao, packageCount: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Chuyến xe / Phương tiện vận chuyển</label>
                <input
                  type="text"
                  value={newBao.vehicle}
                  onChange={(e) => setNewBao({ ...newBao, vehicle: e.target.value })}
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
                className="px-5 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Lưu & Niêm Phong Bao</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
