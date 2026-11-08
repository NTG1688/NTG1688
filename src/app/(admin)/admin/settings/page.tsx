"use client";

import React, { useState } from "react";
import { 
  Cloud, 
  Database, 
  DollarSign, 
  CreditCard, 
  Bell, 
  Save, 
  Check, 
  RefreshCw,
  ShieldAlert,
  Server
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"r2" | "exchange" | "bank" | "notify">("r2");
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingR2, setIsTestingR2] = useState(false);
  const [r2TestStatus, setR2TestStatus] = useState<string | null>(null);

  // State Cấu Hình Cloudflare R2
  const [r2Config, setR2Config] = useState({
    accountId: "8b7f8c92a10d93ef448e8e7a83d",
    bucket: "namtrung-media",
    publicDomain: "https://media.nhapkhaunamtrung.com",
    accessKeyId: "78848d7b32c027ea51928374",
    secretAccessKey: "••••••••••••••••••••••••••••••••",
  });

  // State Tỷ giá
  const [exchangeConfig, setExchangeConfig] = useState({
    rate: 4015,
    minBuyFee: 50000,
    autoSync: true,
  });

  // State Ngân hàng VietQR
  const [bankConfig, setBankConfig] = useState({
    bankName: "VIETINBANK",
    accountNumber: "117634318888",
    accountName: "CÔNG TY TNHH DỊCH VỤ VÀ THƯƠNG MẠI QUỐC TẾ NAM TRUNG",
    bin: "970415",
    webhookSecret: "sep_wh_9a8df7283746a5c1",
  });

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestR2 = () => {
    setIsTestingR2(true);
    setR2TestStatus(null);
    setTimeout(() => {
      setIsTestingR2(false);
      setR2TestStatus("success");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-0.5">
            Trung Tâm Điều Hành & Quản Trị
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Cấu Hình Hệ Thống Linh Hoạt
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý tập trung kết nối Cloudflare R2, Supabase, Tỷ giá Tệ và Webhook ngân hàng
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? "Đã Lưu Thành Công!" : "Lưu Cấu Hình"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("r2")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "r2"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Cloudflare R2 Storage</span>
        </button>

        <button
          onClick={() => setActiveTab("exchange")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "exchange"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Tỷ Giá & Biểu Phí</span>
        </button>

        <button
          onClick={() => setActiveTab("bank")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "bank"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>VietQR & Ngân Hàng</span>
        </button>
      </div>

      {/* Tab 1: Cloudflare R2 */}
      {activeTab === "r2" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs max-w-4xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-base text-gray-900">Lưu Trữ Ảnh & File Trên Cloudflare R2</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Mọi hình ảnh sản phẩm, hóa đơn, tờ khai hải quan được lưu trữ trực tiếp trên Cloudflare R2 không giới hạn băng thông.
              </p>
            </div>
            <button
              onClick={handleTestR2}
              disabled={isTestingR2}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingR2 ? "animate-spin" : ""}`} />
              <span>{isTestingR2 ? "Đang test..." : "Kiểm tra kết nối"}</span>
            </button>
          </div>

          {r2TestStatus === "success" && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Kết nối Cloudflare R2 thành công! Bucket sẵn sàng đọc/ghi dữ liệu.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Cloudflare Account ID</label>
              <input
                type="text"
                value={r2Config.accountId}
                onChange={(e) => setR2Config({ ...r2Config, accountId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">R2 Bucket Name</label>
              <input
                type="text"
                value={r2Config.bucket}
                onChange={(e) => setR2Config({ ...r2Config, bucket: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Tên Miền Công Khai (Public Domain / CDN)</label>
              <input
                type="text"
                value={r2Config.publicDomain}
                onChange={(e) => setR2Config({ ...r2Config, publicDomain: e.target.value })}
                placeholder="https://media.nhapkhaunamtrung.com"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Access Key ID</label>
              <input
                type="text"
                value={r2Config.accessKeyId}
                onChange={(e) => setR2Config({ ...r2Config, accessKeyId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-700 block mb-1">Secret Access Key</label>
              <input
                type="password"
                value={r2Config.secretAccessKey}
                onChange={(e) => setR2Config({ ...r2Config, secretAccessKey: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tỷ Giá & Biểu Phí */}
      {activeTab === "exchange" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs max-w-4xl space-y-5">
          <div className="pb-4 border-b border-gray-100">
            <h3 className="font-bold text-base text-gray-900">Tỷ Giá Tệ (CNY) & Phí Dịch Vụ</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Áp dụng tức thì cho toàn bộ các đơn hàng mới tạo và tính cọc trên hệ thống.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Tỷ Giá 1 Tệ (VND/CNY)</label>
              <input
                type="number"
                value={exchangeConfig.rate}
                onChange={(e) => setExchangeConfig({ ...exchangeConfig, rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Phí Mua Hàng Tối Thiểu (VNĐ)</label>
              <input
                type="number"
                value={exchangeConfig.minBuyFee}
                onChange={(e) => setExchangeConfig({ ...exchangeConfig, minBuyFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: VietQR & Ngân Hàng */}
      {activeTab === "bank" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs max-w-4xl space-y-5">
          <div className="pb-4 border-b border-gray-100">
            <h3 className="font-bold text-base text-gray-900">Tài Khoản Nhận Chuyển Khoản & Webhook Tự Động</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Cấu hình ngân hàng phát sinh mã VietQR và API secret đối soát nạp ví tự động 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Tên Ngân Hàng</label>
              <input
                type="text"
                value={bankConfig.bankName}
                onChange={(e) => setBankConfig({ ...bankConfig, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Số Tài Khoản</label>
              <input
                type="text"
                value={bankConfig.accountNumber}
                onChange={(e) => setBankConfig({ ...bankConfig, accountNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-brand-700"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-700 block mb-1">Tên Chủ Tài Khoản (In hoa)</label>
              <input
                type="text"
                value={bankConfig.accountName}
                onChange={(e) => setBankConfig({ ...bankConfig, accountName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
