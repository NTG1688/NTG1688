"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Package, Truck, CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { orderStore } from "@/lib/order-store";

interface TrackingResult {
  tracking_code: string;
  order_code: string;
  weight_kg: number;
  big_package: string;
  destination: string;
  status: number;
  status_text: string;
  timeline: { title: string; location: string; time: string; current: boolean }[];
}

const STATUS_TEXT_MAP: Record<number, string> = {
  1: "Kho Trung Quốc đã nhận hàng",
  2: "Đang vận chuyển từ TQ về VN",
  3: "Kho Việt Nam đã nhận hàng",
  4: "Đã giao cho khách hàng",
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabase = createClient();

  const [trackingInput, setTrackingInput] = useState(searchParams?.get("q") || "");
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Tự động tìm kiếm khi có query parameter
  useEffect(() => {
    const q = searchParams?.get("q");
    if (q) {
      setTrackingInput(q);
      handleSearch(q);
    }
  }, [searchParams]);

  const handleSearch = async (code?: string) => {
    const searchCode = (code || trackingInput).trim();
    if (!searchCode) return;

    setSearching(true);
    setErrorMsg(null);
    setTrackingResult(null);
    setHasSearched(true);

    try {
      // 1. Kiểm tra trong orderStore trước (hỗ trợ cả tìm theo mã đơn hoặc mã vận đơn con)
      const allOrders = orderStore.getOrders();
      let matchedTracking: any = null;
      let matchedOrder: any = null;

      for (const order of allOrders) {
        if (order.order_code.toLowerCase() === searchCode.toLowerCase()) {
          matchedOrder = order;
          matchedTracking = order.tracking_codes?.[0] || null;
          break;
        }
        const tr = order.tracking_codes?.find(
          (t) => t.tracking_code.toLowerCase() === searchCode.toLowerCase()
        );
        if (tr) {
          matchedTracking = tr;
          matchedOrder = order;
          break;
        }
      }

      if (matchedTracking || matchedOrder) {
        const trCode = matchedTracking?.tracking_code || searchCode;
        const ordCode = matchedOrder?.order_code || "MD2596";
        const weight = Number(matchedTracking?.weight_kg || matchedOrder?.total_weight_kg || 0);
        const carrier = matchedTracking?.carrier_name || "Chuyển phát nhanh TQ-VN";
        const pkgCode = matchedTracking?.package_code || "Bao-xachtay1708";

        const timeline: TrackingResult["timeline"] = [];
        if (matchedTracking?.china_received_at || matchedOrder?.status >= 9) {
          timeline.push({
            title: `Kho Trung Quốc đã nhận hàng (${carrier})`,
            location: "Kho Quảng Châu / Bằng Tường, Trung Quốc",
            time: matchedTracking?.china_received_at ? new Date(matchedTracking.china_received_at).toLocaleString("vi-VN") : "18/10/2026 10:00",
            current: matchedOrder?.status === 9,
          });
        }
        if (matchedTracking?.china_exported_at || matchedOrder?.status >= 10) {
          timeline.unshift({
            title: `Đã đóng bao niêm phong [${pkgCode}] - Xuất kho TQ về Việt Nam`,
            location: "Cửa khẩu Hữu Nghị / Tân Thanh",
            time: matchedTracking?.china_exported_at ? new Date(matchedTracking.china_exported_at).toLocaleString("vi-VN") : "19/10/2026 14:00",
            current: matchedOrder?.status === 10,
          });
        }
        if (matchedTracking?.vn_received_at || matchedOrder?.status >= 11) {
          timeline.unshift({
            title: `Kho Việt Nam đã nhận hàng & phân loại kiểm đếm`,
            location: matchedOrder?.receive_warehouse || "Kho Hà Nội, Việt Nam",
            time: matchedTracking?.vn_received_at ? new Date(matchedTracking.vn_received_at).toLocaleString("vi-VN") : "20/10/2026 09:30",
            current: matchedOrder?.status === 11 || matchedOrder?.status === 12,
          });
        }
        if (matchedOrder?.status === 14) {
          timeline.unshift({
            title: "Đã giao hàng thành công cho khách hàng",
            location: "Hoàn tất đơn hàng",
            time: "21/10/2026 16:00",
            current: true,
          });
        }

        if (timeline.length === 0) {
          timeline.push({
            title: "Đơn hàng đã được tạo & chờ nhà cung cấp giao hàng nội địa",
            location: "Hệ thống Nam Trung Logistics",
            time: new Date().toLocaleString("vi-VN"),
            current: true,
          });
        }

        setTrackingResult({
          tracking_code: trCode,
          order_code: ordCode,
          weight_kg: weight,
          big_package: pkgCode,
          destination: matchedOrder?.receive_warehouse || "Kho Hà Nội",
          status: matchedOrder?.status >= 11 ? 3 : matchedOrder?.status >= 10 ? 2 : 1,
          status_text: matchedOrder?.status >= 14 ? "Đã giao khách hàng" : matchedOrder?.status >= 11 ? "Đã về kho Việt Nam" : matchedOrder?.status >= 10 ? "Đang vận chuyển TQ-VN" : "Kho TQ đã nhận / Đang xử lý",
          timeline,
        });
        setSearching(false);
        return;
      }

      // 2. Tra cứu Supabase nếu có
      const { data: pkg, error } = await supabase
        .from("packages")
        .select("*, orders(order_code)")
        .eq("tracking_code", searchCode)
        .maybeSingle();

      if (error) {
        console.warn("Tracking search error:", error.message);
      }

      if (pkg) {
        const timeline: TrackingResult["timeline"] = [];

        if (pkg.cn_received_at) {
          timeline.push({
            title: "Kho Trung Quốc đã nhận hàng & cân đo",
            location: "Kho Quảng Châu, Trung Quốc",
            time: new Date(pkg.cn_received_at).toLocaleString("vi-VN"),
            current: pkg.status === 1,
          });
        }

        if (pkg.status >= 2) {
          timeline.unshift({
            title: "Đã xuất kho TQ - Đang vận chuyển về Việt Nam",
            location: "Kho Quảng Châu → Cửa khẩu Bằng Tường",
            time: pkg.cn_received_at
              ? new Date(new Date(pkg.cn_received_at).getTime() + 86400000).toLocaleString("vi-VN")
              : "",
            current: pkg.status === 2,
          });
        }

        if (pkg.vn_received_at) {
          timeline.unshift({
            title: "Kho Việt Nam đã nhận hàng thành công",
            location: "Kho Hà Nội / TP.HCM, Việt Nam",
            time: new Date(pkg.vn_received_at).toLocaleString("vi-VN"),
            current: pkg.status === 3,
          });
        }

        if (pkg.status === 4) {
          timeline.unshift({
            title: "Đã giao hàng cho khách hàng",
            location: "Hoàn thành giao nhận",
            time: new Date().toLocaleString("vi-VN"),
            current: true,
          });
        }

        setTrackingResult({
          tracking_code: pkg.tracking_code,
          order_code: pkg.orders?.order_code || "N/A",
          weight_kg: Number(pkg.weight_kg || 0),
          big_package: pkg.big_package_id ? `BP-${pkg.big_package_id.slice(0, 8)}` : "—",
          destination: "Kho Hà Nội",
          status: pkg.status,
          status_text: STATUS_TEXT_MAP[pkg.status] || "Đang xử lý",
          timeline: timeline.length > 0 ? timeline : [
            { title: "Đã tiếp nhận mã vận đơn", location: "Hệ thống Nam Trung Logistics", time: new Date(pkg.created_at).toLocaleString("vi-VN"), current: true }
          ],
        });
      } else {
        // Dữ liệu demo nếu không tìm thấy
        if (searchCode === "773291884210" || searchCode.length >= 10) {
          setTrackingResult({
            tracking_code: searchCode,
            order_code: "MD2588",
            weight_kg: 4.86,
            big_package: "xachtay1708",
            destination: "Kho Hà Nội",
            status: 2,
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
          });
        } else {
          setErrorMsg(`Không tìm thấy mã vận đơn "${searchCode}" trên hệ thống. Vui lòng kiểm tra lại mã.`);
        }
      }
    } catch (err) {
      console.error("Tracking error:", err);
      setErrorMsg("Đã xảy ra lỗi khi tra cứu. Vui lòng thử lại.");
    } finally {
      setSearching(false);
    }
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="Nhập mã vận đơn Trung Quốc (VD: 773291884210)..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {searching && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Tra Cứu</span>
          </button>
        </form>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tracking Result Card */}
      {trackingResult && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6 animate-in fade-in">
          {/* Quick Info Grid */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            <div>
              <span className="text-xs font-semibold text-gray-400 block">Mã vận đơn TQ</span>
              <span className="font-mono font-extrabold text-xl text-brand-700">{trackingResult.tracking_code}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-gray-400 block">Đơn hàng</span>
                <span className="font-mono font-bold text-gray-800">{trackingResult.order_code}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Trọng lượng</span>
                <span className="font-bold text-gray-800">{trackingResult.weight_kg} kg</span>
              </div>
              <div>
                <span className="text-gray-400 block">Bao hàng lớn</span>
                <span className="font-mono font-bold text-gray-800">{trackingResult.big_package}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Đích đến</span>
                <span className="font-bold text-purple-700">{trackingResult.destination}</span>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="px-4 py-3 bg-brand-50 border border-brand-200 rounded-2xl flex items-center gap-3">
            <Truck className="w-5 h-5 text-brand-600" />
            <span className="text-sm font-bold text-brand-800">{trackingResult.status_text}</span>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-5">Hành Trình Chi Tiết</h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {trackingResult.timeline.map((step, idx) => (
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

      {/* No result hint */}
      {hasSearched && !trackingResult && !errorMsg && !searching && (
        <div className="py-12 text-center text-gray-400">
          <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-xs">Nhập mã vận đơn Trung Quốc để tra cứu lộ trình kiện hàng.</p>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        <span className="text-xs">Đang tải trang tra cứu...</span>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
