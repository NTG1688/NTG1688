"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Wallet, 
  AlertTriangle, 
  Loader2, 
  CheckCheck,
  ShieldCheck
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      try {
        if (user) {
          const { data } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            setNotifications(data.map((d: any) => ({
              id: d.id,
              title: d.title,
              content: d.content || d.message,
              type: d.type || "system",
              is_read: !!d.is_read,
              created_at: d.created_at,
            })));
            setLoading(false);
            return;
          }
        }

        // Demo fallback
        setNotifications([
          {
            id: "notif-1",
            title: "Nạp tiền tự động thành công (+50,000,000 VNĐ)",
            content: "Hệ thống đã tự động ghi nhận giao dịch nạp tiền qua VietinBank với cú pháp NTG NT2820. Số dư hiện tại: 24,500,000 VNĐ.",
            type: "wallet",
            is_read: false,
            created_at: "2026-10-21T05:00:00.000Z",
          },
          {
            id: "notif-2",
            title: "Kiện hàng MD2588 đã xuất kho Trung Quốc",
            content: "Bao hàng xachtay1708 chứa kiện hàng của bạn đã được niêm phong và khởi hành về Việt Nam qua Cửa Khẩu Hữu Nghị.",
            type: "shipping",
            is_read: false,
            created_at: "2026-10-18T14:30:00.000Z",
          },
          {
            id: "notif-3",
            title: "Tờ khai hải quan MD2596-1 đã thông quan",
            content: "Lô hàng linh kiện thiết bị cơ khí nhập khẩu chính ngạch đã hoàn tất kiểm tra hồ sơ và được cơ quan hải quan chấp thuận thông quan.",
            type: "customs",
            is_read: true,
            created_at: "2026-10-21T04:45:00.000Z",
          },
          {
            id: "notif-4",
            title: "Cập nhật tỷ giá Tệ mới: 1 CNY = 4,015 VNĐ",
            content: "Tỷ giá áp dụng cho các đơn hàng mua hộ và thanh toán hộ từ 00:00 hôm nay.",
            type: "system",
            is_read: true,
            created_at: "2026-10-15T00:00:00.000Z",
          },
        ]);
      } catch (err) {
        console.error("Load notifications error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [user]);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "wallet":
        return <Wallet className="w-5 h-5 text-emerald-600" />;
      case "shipping":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "customs":
        return <ShieldCheck className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-600" />
            <span>Trung Tâm Thông Báo</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Cập nhật biến động đơn hàng, lộ trình vận chuyển, biến động số dư và thông báo hệ thống
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4 text-brand-600" />
          <span>Đánh dấu tất cả đã đọc</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          <span className="text-xs">Đang tải thông báo...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-3xl border transition-all flex items-start gap-3.5 ${
                item.is_read
                  ? "bg-white border-gray-200 shadow-xs"
                  : "bg-blue-50/60 border-blue-200 shadow-sm"
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-white border border-gray-100 shadow-xs shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900">{item.title}</h4>
                  <span className="text-[11px] text-gray-400 shrink-0 font-medium">
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.content}</p>
              </div>

              {!item.is_read && (
                <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-2"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
