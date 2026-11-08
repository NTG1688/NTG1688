"use client";

import React, { useState } from "react";
import { generateVietQRUrl } from "@/lib/vietqr";
import { formatVND } from "@/lib/utils";
import { Check, Copy, QrCode, X, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userCode: string; // VD: NT2820
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  bankBin?: string;
}

export const VietQRTopupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userCode,
  accountNumber = "117634318888",
  accountName = "CONG TY TNHH DICH VU VA THUONG MAI QUOC TE NAM TRUNG",
  bankName = "VIETINBANK",
  bankBin = "970415",
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | undefined>(undefined);

  if (!isOpen) return null;

  const memo = `NTG ${userCode.toUpperCase()}`;
  const qrUrl = generateVietQRUrl({
    bankBin,
    accountNumber,
    accountName,
    amount,
    memo,
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const quickAmounts = [500000, 1000000, 2000000, 5000000, 10000000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-brand-600 to-brand-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Nạp Tiền Vào Ví Tự Động (VietQR)</h3>
              <p className="text-xs text-brand-100 mt-1">Cộng tiền tự động 24/7 chỉ sau 3 giây</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Amount Selector */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Chọn số tiền nạp nhanh (Tùy chọn)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt === amount ? undefined : amt)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                    amount === amt
                      ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {(amt / 1000).toLocaleString()}k
                </button>
              ))}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-200 mb-5">
            <div className="relative p-2 bg-white rounded-2xl shadow-sm border border-gray-200">
              <img
                src={qrUrl}
                alt="VietQR nạp tiền Nam Trung"
                className="w-56 h-56 object-contain rounded-xl"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center font-medium">
              Mở ứng dụng ngân hàng bất kỳ để quét mã QR chuyển khoản nhanh 24/7
            </p>
          </div>

          {/* Account Details with Copy Buttons */}
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <span className="text-xs text-gray-500 block">Ngân hàng thụ hưởng</span>
                <span className="font-bold text-gray-800">{bankName}</span>
              </div>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">Napas 247</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <span className="text-xs text-gray-500 block">Số tài khoản</span>
                <span className="font-mono font-bold text-brand-700 text-base">{accountNumber}</span>
              </div>
              <button
                onClick={() => copyToClipboard(accountNumber, "account")}
                className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 shadow-sm"
              >
                {copiedField === "account" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === "account" ? "Đã chép" : "Sao chép"}</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <span className="text-xs text-gray-500 block">Chủ tài khoản</span>
                <span className="font-semibold text-gray-800 text-xs">{accountName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div>
                <span className="text-xs text-amber-800 font-semibold block">Nội dung chuyển khoản (Bắt buộc)</span>
                <span className="font-mono font-extrabold text-amber-900 text-base">{memo}</span>
              </div>
              <button
                onClick={() => copyToClipboard(memo, "memo")}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                {copiedField === "memo" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === "memo" ? "Đã chép" : "Sao chép"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50/70 rounded-xl text-xs text-blue-800">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Hệ thống tự động cộng tiền khi nhận đúng nội dung <strong className="font-mono">{memo}</strong>. Tiền sẽ vào ví trong vòng 1-3 phút.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
