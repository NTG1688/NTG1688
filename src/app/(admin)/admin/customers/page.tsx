"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  DollarSign, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Plus, 
  Minus, 
  Loader2,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface CustomerUI {
  id: string;
  user_code: string;
  username: string;
  full_name: string;
  phone: string;
  email: string;
  level_id: number;
  wallet_balance: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminCustomersPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerUI[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal điều chỉnh số dư ví
  const [adjustTarget, setAdjustTarget] = useState<CustomerUI | null>(null);
  const [adjustType, setAdjustType] = useState<"deposit" | "withdrawal">("deposit");
  const [adjustAmount, setAdjustAmount] = useState<number>(500000);
  const [adjustNote, setAdjustNote] = useState<string>("Admin cộng tiền nạp ví trực tiếp");
  const [adjusting, setAdjusting] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setCustomers(data.map((d: any) => ({
          id: d.id,
          user_code: d.user_code || "NT2820",
          username: d.username || "khachhang",
          full_name: d.full_name || "Khách Hàng",
          phone: d.phone || "—",
          email: d.email || "—",
          level_id: Number(d.level_id || 1),
          wallet_balance: Number(d.wallet_balance || 0),
          is_active: d.is_active !== false,
          created_at: d.created_at,
        })));
      } else {
        // Demo fallback
        setCustomers([
          {
            id: "c-1",
            user_code: "NT2820",
            username: "ahxdhn",
            full_name: "Nguyễn Văn Trung",
            phone: "0912345678",
            email: "ahxdhn@nhapkhaunamtrung.com",
            level_id: 2,
            wallet_balance: 24500000,
            is_active: true,
            created_at: "2026-10-01T08:00:00.000Z",
          },
          {
            id: "c-2",
            user_code: "NT1042",
            username: "tranducnam",
            full_name: "Trần Đức Nam",
            phone: "0987654321",
            email: "nam.tran@gmail.com",
            level_id: 3,
            wallet_balance: 58200000,
            is_active: true,
            created_at: "2026-09-15T10:30:00.000Z",
          },
          {
            id: "c-3",
            user_code: "NT5591",
            username: "lehoangquan",
            full_name: "Lê Hoàng Quân",
            phone: "0988776655",
            email: "quan.le@oemvn.com",
            level_id: 1,
            wallet_balance: 2400000,
            is_active: true,
            created_at: "2026-10-10T14:20:00.000Z",
          },
        ]);
      }
    } catch (err) {
      console.error("Load customers error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleAdjustWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget || adjustAmount <= 0) return;

    setAdjusting(true);
    try {
      const delta = adjustType === "deposit" ? adjustAmount : -adjustAmount;
      const newBalance = Math.max(0, adjustTarget.wallet_balance + delta);
      const txCode = `GD-ADMIN-${Date.now()}`;

      // Cập nhật profile trên Supabase
      await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", adjustTarget.id);

      // Lưu transaction log
      await supabase.from("wallet_transactions").insert({
        transaction_code: txCode,
        user_id: adjustTarget.id,
        amount: delta,
        balance_after: newBalance,
        type: adjustType === "deposit" ? "deposit" : "withdrawal",
        note: `[Admin] ${adjustNote}`,
      });

      // Cập nhật state local
      setCustomers(customers.map((c) => c.id === adjustTarget.id ? { ...c, wallet_balance: newBalance } : c));
      alert(`Đã ${adjustType === "deposit" ? "cộng" : "trừ"} thành công ${formatVND(adjustAmount)} cho khách hàng ${adjustTarget.user_code}!`);
      setAdjustTarget(null);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setAdjusting(false);
    }
  };

  const handleToggleActive = async (cust: CustomerUI) => {
    const nextState = !cust.is_active;
    try {
      await supabase
        .from("profiles")
        .update({ is_active: nextState })
        .eq("id", cust.id);

      setCustomers(customers.map((c) => c.id === cust.id ? { ...c, is_active: nextState } : c));
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.user_code.toLowerCase().includes(q) ||
      c.full_name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
            Quản Lý Hội Viên & Khách Hàng
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            <span>Quản Lý Khách Hàng & Số Dư Ví</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Xem danh sách thành viên, điều chỉnh số dư ví, nâng cấp bậc VIP và phân quyền
          </p>
        </div>

        <button
          onClick={loadCustomers}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo mã KH (NT2820), họ tên, SĐT, username..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-xs">Đang tải danh sách khách hàng...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Mã KH</th>
                  <th className="py-3.5 px-4">Họ Tên / Username</th>
                  <th className="py-3.5 px-4">Số Điện Thoại</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Cấp Bậc</th>
                  <th className="py-3.5 px-4">Số Dư Ví (VNĐ)</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Điều Chỉnh Ví</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-black text-purple-700 text-sm">
                      {cust.user_code}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-900 block">{cust.full_name}</span>
                      <span className="text-[10px] text-gray-400">@{cust.username}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-700 font-semibold">{cust.phone}</td>
                    <td className="py-4 px-4 text-gray-500 max-w-xs truncate">{cust.email}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-bold text-[11px]">
                        VIP {cust.level_id}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-black text-emerald-700 text-sm">
                      {formatVND(cust.wallet_balance)}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleActive(cust)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer ${
                          cust.is_active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {cust.is_active ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{cust.is_active ? "Hoạt động" : "Đã khóa"}</span>
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setAdjustTarget(cust)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Nạp/Trừ tiền</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Điều Chỉnh Số Dư Ví */}
      {adjustTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleAdjustWallet} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <h3 className="font-bold text-base text-gray-900">
              Điều Chỉnh Số Dư Ví: <span className="text-purple-700">{adjustTarget.user_code}</span> ({adjustTarget.full_name})
            </h3>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex justify-between items-center text-xs">
              <span className="text-gray-500">Số dư hiện tại:</span>
              <span className="font-mono font-black text-emerald-700 text-base">{formatVND(adjustTarget.wallet_balance)}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Loại điều chỉnh</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("deposit")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                      adjustType === "deposit" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-200"
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Cộng tiền (Nạp ví)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("withdrawal")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                      adjustType === "withdrawal" ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-700 border-gray-200"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Trừ tiền (Rút/Phạt)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Số tiền (VNĐ) *</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Lý do / Nội dung diễn giải *</label>
                <textarea
                  required
                  rows={2}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setAdjustTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={adjusting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {adjusting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác Nhận Điều Chỉnh</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
