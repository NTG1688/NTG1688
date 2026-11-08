"use client";

import React, { useState } from "react";
import { Search, MapPin, Package, Truck, CheckCircle2, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function TrackingPage() {
  const [trackingInput, setTrackingInput] = useState("773291884210");
  const [searched, setSearched] = useState(true);

  // Mẫu dữ liệu hành trình kiện hàng bóc tách
  const trackingData = {
    tracking_code: "773291884210",
    order_code: "MD2588",
    weight_kg: 4.86,
    big_package: "xachtay1708",
    destination: "Kho Hà Nội",
    status_text: "Đang trên đường vận chuyển về Việt Nam",
    timeline: [
      {
        title: "Đã xuất kho Trung Quốc (Đóng bao xachtay1708)",
        location: "Kho Quảng Châu, Trung Quốc",
        time: "18/10/2026 14:30",
        current: true,
      },
      {
        title: "Kho Trung Quốc đã nhận hàng & cân đo",
        location: "Kho Quảng Châu, Trung Quốc",
        time: "18/10/2026 09:15",
        current: false,
      },
      {
        title: "Shop Trung Quốc phát hàng qua chuyển phát nội địa",
        location: "Thâm Quyến, Trung Quốc",
        time: "16/10/2026 18:20",
        current: false,
      },
      {
        title: "Đơn hàng đã được mua thành công",
        location: "Hệ thống Nam Trung Logistics",
        time: "15/10/2026 10:00",
        current: false,
      },
    ],
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Tra Cứu Lộ Trình Kiện Hàng
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Theo dõi thời gian thực vị trí mã vận đơn Trung Quốc và hành trình về Việt Nam
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="Nhập mã vận đơn Trung Quốc..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            onClick={() => setSearched(true)}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all shrink-0"
          >
            Tra Cứu
          </button>
        </div>
      </div>

      {/* Tracking Result Card */}
      {searched && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6 animate-in fade-in">
          {/* Quick Info Grid */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            <div>
              <span className="text-xs font-semibold text-gray-400 block">Mã vận đơn TQ</span>
              <span className="font-mono font-extrabold text-xl text-brand-700">{trackingData.tracking_code}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-gray-400 block">Trọng lượng</span>
                <span className="font-bold text-gray-800">{trackingData.weight_kg} kg</span>
              </div>
              <div>
                <span className="text-gray-400 block">Bao hàng lớn</span>
                <span className="font-mono font-bold text-gray-800">{trackingData.big_package}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Đích đến</span>
                <span className="font-bold text-purple-700">{trackingData.destination}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-5">Hành Trình Chi Tiết</h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {trackingData.timeline.map((step, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      step.current
                        ? "bg-brand-600 border-brand-200 text-white shadow-sm ring-4 ring-brand-100"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>
                  <div>
                    <span
                      className={`text-xs sm:text-sm font-bold block ${
                        step.current ? "text-brand-700" : "text-gray-800"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-xs text-gray-500 block mt-0.5">{step.location}</span>
                    <span className="text-[11px] text-gray-400 block font-mono mt-0.5">{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
