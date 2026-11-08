import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrderStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCNY(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "¥0.00";
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "--/--/----";
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
}

export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  0: { label: "Chưa đặt cọc", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  1: { label: "Đã đặt cọc", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  2: { label: "Chờ mua hàng", color: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
  3: { label: "Đang mua hàng", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
  6: { label: "Đã mua hàng", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  7: { label: "Shop TQ phát hàng", color: "text-cyan-700", bg: "bg-cyan-50 border-cyan-200" },
  9: { label: "Kho TQ nhận hàng", color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
  10: { label: "Đang về Việt Nam", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  11: { label: "Kho VN nhận hàng", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  12: { label: "Chờ giao hàng", color: "text-blue-800", bg: "bg-blue-100 border-blue-300" },
  13: { label: "Đang giao hàng", color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  14: { label: "Hoàn thành", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  16: { label: "Đã hủy", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
};
