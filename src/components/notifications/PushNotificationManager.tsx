"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle } from "lucide-react";

export const PushNotificationManager: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === "granted") {
        new Notification("Nam Trung Logistics", {
          body: "Đã bật thông báo trạng thái đơn hàng thành công trên thiết bị!",
          icon: "/favicon.ico",
        });
      }
    } catch (err) {
      console.error("Lỗi yêu cầu quyền thông báo:", err);
    }
  };

  if (!isSupported || permission === "granted") return null;

  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl mb-4 shadow-sm animate-in fade-in">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-blue-600 text-white rounded-xl">
          <Bell className="w-4 h-4 animate-bounce" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-blue-950">Bật thông báo đơn hàng</h4>
          <p className="text-xs text-blue-700">Nhận thông báo tức thì khi hàng về kho TQ/VN hoặc xuất kho</p>
        </div>
      </div>
      <button
        onClick={requestPermission}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
      >
        Cho phép
      </button>
    </div>
  );
};
