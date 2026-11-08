"use client";

import React, { useState } from "react";
import { formatVND, formatCNY } from "@/lib/utils";
import { ArrowRightLeft, Calculator, X } from "lucide-react";

interface Props {
  defaultRate?: number;
}

export const QuickCurrencyCalc: React.FC<Props> = ({ defaultRate = 4015 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cny, setCny] = useState<string>("100");
  const [rate, setRate] = useState<number>(defaultRate);

  const numCny = parseFloat(cny) || 0;
  const totalVnd = numCny * rate;

  return (
    <>
      {/* Nút bật máy tính nhanh */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg border border-brand-200 transition-colors shadow-sm"
        title="Bấm để quy đổi Tệ (CNY) sang VNĐ nhanh"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>1 ¥ = {rate.toLocaleString("vi-VN")} đ</span>
        <Calculator className="w-3.5 h-3.5 ml-1 text-brand-600" />
      </button>

      {/* Popup máy tính tiện lợi */}
      {isOpen && (
        <div className="fixed top-16 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
              <Calculator className="w-4 h-4 text-brand-600" />
              <span>Quy đổi Tệ (CNY) sang VNĐ</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 mt-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Tiền Trung Quốc (CNY - ¥)</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  value={cny}
                  onChange={(e) => setCny(e.target.value)}
                  placeholder="Nhập số Tệ..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">¥ CNY</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>Tỷ giá áp dụng:</span>
              <span className="font-semibold text-gray-700">{rate.toLocaleString("vi-VN")} đ/¥</span>
            </div>

            <div className="p-3 bg-brand-50 rounded-xl border border-brand-100">
              <span className="text-xs font-medium text-brand-600">Thành tiền Việt Nam (VNĐ)</span>
              <div className="text-lg font-bold text-brand-800 mt-0.5">
                {formatVND(totalVnd)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
