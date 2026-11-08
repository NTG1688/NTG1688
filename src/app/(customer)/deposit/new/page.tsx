"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, PackagePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewDepositPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [warehouseId, setWarehouseId] = useState("a0000000-0000-0000-0000-000000000001");
  const [cnWarehouseId, setCnWarehouseId] = useState("a0000000-0000-0000-0000-000000000004"); // Quảng Châu
  const [note, setNote] = useState("");

  const [packages, setPackages] = useState([
    { id: "pkg-1", trackingCode: "", itemName: "", quantity: 1, note: "" },
  ]);

  const handleAddPackage = () => {
    setPackages([
      ...packages,
      { id: `pkg-${Date.now()}`, trackingCode: "", itemName: "", quantity: 1, note: "" },
    ]);
  };

  const handleRemovePackage = (index: number) => {
    if (packages.length <= 1) return;
    setPackages(packages.filter((_, idx) => idx !== index));
  };

  const handlePackageChange = (index: number, field: string, value: any) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (packages.some((p) => !p.trackingCode)) {
      alert("Vui lòng điền mã vận đơn Trung Quốc");
      return;
    }

    try {
      setIsSubmitting(true);
      const code = `NTG-DEP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Lưu đơn ký gửi vào Supabase
      const { data, error } = await supabase.from("orders").insert({
        order_code: code,
        customer_id: "dd2ac030-b566-43a1-809c-299a20d605fe",
        status: 1, // Ký gửi tạo là sẵn sàng nhận
        order_type: "deposit",
        exchange_rate: 4015,
        total_cny: 0,
        total_vnd: 0,
        deposit_amount: 0,
        min_deposit_amount: 0,
        remaining_amount: 0,
        receive_warehouse_id: warehouseId,
        customer_note: note,
      }).select().single();

      alert(`Tạo đơn ký gửi ${code} thành công!`);
      router.push("/deposit");
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link href="/deposit" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Tạo Đơn Ký Gửi Mới
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Khai báo mã vận đơn shop Trung Quốc gửi về kho Nam Trung
            </p>
          </div>
        </div>
      </div>

      {/* Kho Nhận */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <label className="text-xs font-bold text-gray-700 block">Kho Trung Quốc Nhận Hàng</label>
          <select
            value={cnWarehouseId}
            onChange={(e) => setCnWarehouseId(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
          >
            <option value="a0000000-0000-0000-0000-000000000004">Kho Quảng Châu (Quảng Đông)</option>
            <option value="a0000000-0000-0000-0000-000000000003">Kho Bằng Tường (Quảng Tây)</option>
          </select>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <label className="text-xs font-bold text-gray-700 block">Kho Đích Nhận Tại Việt Nam</label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
          >
            <option value="a0000000-0000-0000-0000-000000000001">Kho Hà Nội</option>
            <option value="a0000000-0000-0000-0000-000000000002">Kho TP. Hồ Chí Minh</option>
          </select>
        </div>
      </div>

      {/* Danh Sách Kiện Hàng */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">Danh Sách Mã Vận Đơn TQ</h3>
          <button
            type="button"
            onClick={handleAddPackage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl border border-brand-200"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mã Vận Đơn</span>
          </button>
        </div>

        {packages.map((pkg, idx) => (
          <div key={pkg.id} className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-700">Kiện hàng #{idx + 1}</span>
              {packages.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePackage(idx)}
                  className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mã Vận Đơn TQ (Bắt buộc)</label>
                <input
                  type="text"
                  required
                  value={pkg.trackingCode}
                  onChange={(e) => handlePackageChange(idx, "trackingCode", e.target.value)}
                  placeholder="VD: 773291884210"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tên Hàng Hóa</label>
                <input
                  type="text"
                  value={pkg.itemName}
                  onChange={(e) => handlePackageChange(idx, "itemName", e.target.value)}
                  placeholder="Quần áo, phụ kiện điện tử..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Số Lượng Kiện</label>
                <input
                  type="number"
                  min="1"
                  value={pkg.quantity}
                  onChange={(e) => handlePackageChange(idx, "quantity", parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
      >
        <PackagePlus className="w-4 h-4" />
        <span>{isSubmitting ? "Đang tạo đơn..." : "Tạo Đơn Ký Gửi Ngay"}</span>
      </button>
    </form>
  );
}
