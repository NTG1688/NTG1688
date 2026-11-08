"use client";

import React, { useState } from "react";
import { formatVND, formatDate } from "@/lib/utils";
import { VietQRTopupModal } from "@/components/dashboard/VietQRTopupModal";
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PlusCircle, 
  RefreshCcw, 
  QrCode, 
  FileText 
} from "lucide-react";

const MOCK_TRANSACTIONS = [
  {
    id: "tx-1",
    code: "GD-20261021-9921",
    type: "deposit",
    amount: 50000000,
    balance_after: 50000000,
    note: "Nạp tiền tự động qua VietQR - MBBank",
    created_at: "2026-10-21T05:00:00.000Z",
  },
  {
    id: "tx-2",
    code: "GD-20261021-9945",
    type: "order_payment",
    amount: -33098741,
    balance_after: 16901259,
    note: "Đặt cọc đơn hàng MD2596 (Chính ngạch)",
    created_at: "2026-10-21T05:15:20.000Z",
  },
  {
    id: "tx-3",
    code: "GD-20261022-1002",
    type: "deposit",
    amount: 10000000,
    balance_after: 26901259,
    note: "Nạp tiền chuyển khoản VietinBank",
    created_at: "2026-10-22T08:30:10.000Z",
  },
];

export default function WalletPage() {
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const walletBalance = 24500000;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Ví Tiền & Lịch Sử Giao Dịch
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Quản lý số dư, nạp tiền tự động 24/7 và kiểm tra chi tiết các giao dịch trừ/hoàn cọc
        </p>
      </div>

      {/* Balance Card Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-brand-800 via-brand-700 to-indigo-900 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-brand-200 uppercase tracking-wider block">
            Số Dư Khả Dụng Hiện Tại
          </span>
          <div className="text-3xl sm:text-4xl font-black mt-1 font-mono tracking-tight">
            {formatVND(walletBalance)}
          </div>
          <p className="text-xs text-brand-200/80 mt-1">
            Mã Khách Hàng: <span className="font-bold font-mono text-white">NT2820</span> · Cấp bậc: VIP 1
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTopupOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Nạp Tiền VietQR</span>
          </button>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-gray-900">Biến Động Số Dư Gần Đây</h3>
            <p className="text-xs text-gray-400 mt-0.5">Lịch sử nạp, trừ tiền thanh toán đơn hàng</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="py-3.5 px-4">Mã Giao Dịch</th>
                <th className="py-3.5 px-4">Loại Giao Dịch</th>
                <th className="py-3.5 px-4">Số Tiền (VNĐ)</th>
                <th className="py-3.5 px-4">Số Dư Sau</th>
                <th className="py-3.5 px-4">Nội Dung / Diễn Giải</th>
                <th className="py-3.5 px-4 text-right">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_TRANSACTIONS.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-gray-800">
                      {tx.code}
                    </td>
                    <td className="py-4 px-4">
                      {isPositive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>Nạp tiền</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-lg">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Trừ tiền đơn</span>
                        </span>
                      )}
                    </td>
                    <td className={`py-4 px-4 font-mono font-extrabold text-sm ${isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                      {isPositive ? `+${formatVND(tx.amount)}` : formatVND(tx.amount)}
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-700 font-bold">
                      {formatVND(tx.balance_after)}
                    </td>
                    <td className="py-4 px-4 text-gray-600 font-medium max-w-xs truncate">
                      {tx.note}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-400">
                      {formatDate(tx.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <VietQRTopupModal
        isOpen={isTopupOpen}
        onClose={() => setIsTopupOpen(false)}
        userCode="NT2820"
      />
    </div>
  );
}
