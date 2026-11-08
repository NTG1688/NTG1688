import React from "react";
import { OrderStatus } from "@/types";
import { ORDER_STATUS_MAP } from "@/lib/utils";

interface Props {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<Props> = ({ status, className = "" }) => {
  const conf = ORDER_STATUS_MAP[status] || {
    label: `Trạng thái ${status}`,
    color: "text-gray-700",
    bg: "bg-gray-50 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${conf.bg} ${conf.color} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {conf.label}
    </span>
  );
};
