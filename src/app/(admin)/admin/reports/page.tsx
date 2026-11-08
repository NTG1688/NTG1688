"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Package, 
  Users, 
  Calendar, 
  Download,
  Loader2,
  Building,
  ArrowUpRight,
  Filter,
  User,
  RefreshCw,
  Percent,
  CheckCircle2
} from "lucide-react";
import { formatVND, formatCNY } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function AdminReportsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profit" | "revenue" | "warehouses">("profit");
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "thisMonth" | "thisYear">("thisMonth");

  // Bộ lọc cho Báo cáo lợi nhuận đặt hàng
  const [profitFilter, setProfitFilter] = useState({
    employeeType: "Mua hàng",
    employeeName: "Tất cả",
    startDate: "2026-10-01",
    endDate: "2026-10-31"
  });

  // Dữ liệu bảng lợi nhuận theo từng đơn hàng (Từ Auto_Gemini data)
  const orderProfitList = [
    {
      orderCode: "MD2596",
      customer: "Nguyễn Văn Trung (NT2820)",
      employee: "Lê Hoàng Thu",
      role: "Mua hàng",
      orderDate: "21/10/2026",
      revenueVnd: 42520111,
      costVnd: 36069900,
      profitVnd: 6450211,
      marginPercent: 15.2,
      commissionVnd: 645021, // 10% hoa hồng purchaser
      status: "Chờ cọc"
    },
    {
      orderCode: "MD2591",
      customer: "Nguyễn Văn Trung (NT2820)",
      employee: "Nguyễn Văn Hùng",
      role: "Mua hàng",
      orderDate: "20/10/2026",
      revenueVnd: 21950000,
      costVnd: 19100000,
      profitVnd: 2850000,
      marginPercent: 13.0,
      commissionVnd: 285000,
      status: "Đã cọc"
    },
    {
      orderCode: "MD2585",
      customer: "Phạm Hồng Quân (NT1920)",
      employee: "Lê Hoàng Thu",
      role: "Mua hàng",
      orderDate: "18/10/2026",
      revenueVnd: 28450000,
      costVnd: 24700000,
      profitVnd: 3750000,
      marginPercent: 13.2,
      commissionVnd: 375000,
      status: "Đang mua"
    },
    {
      orderCode: "MD2584",
      customer: "Trần Mai Anh (NT3005)",
      employee: "Trần Quốc Đạt",
      role: "Mua hàng",
      orderDate: "17/10/2026",
      revenueVnd: 54800000,
      costVnd: 48100000,
      profitVnd: 6700000,
      marginPercent: 12.2,
      commissionVnd: 670000,
      status: "Đã mua"
    },
    {
      orderCode: "MD2581",
      customer: "Thu Nguyễn (NT1102)",
      employee: "Lê Hoàng Thu",
      role: "Mua hàng",
      orderDate: "16/10/2026",
      revenueVnd: 27955642,
      costVnd: 24200000,
      profitVnd: 3755642,
      marginPercent: 13.4,
      commissionVnd: 375564,
      status: "Về VN"
    },
    {
      orderCode: "MD2529",
      customer: "Đỗ Gia Huy (NT2219)",
      employee: "Nguyễn Văn Hùng",
      role: "Mua hàng",
      orderDate: "10/10/2026",
      revenueVnd: 78500000,
      costVnd: 69200000,
      profitVnd: 9300000,
      marginPercent: 11.8,
      commissionVnd: 930000,
      status: "Kho VN"
    },
    {
      orderCode: "MD2398",
      customer: "Lê Minh Tuấn (NT1408)",
      employee: "Lê Hoàng Thu",
      role: "Mua hàng",
      orderDate: "25/09/2026",
      revenueVnd: 132400000,
      costVnd: 116500000,
      profitVnd: 15900000,
      marginPercent: 12.0,
      commissionVnd: 1590000,
      status: "Hoàn thành"
    },
    {
      orderCode: "MD2308",
      customer: "Hoàng Đức Duy (NT1888)",
      employee: "Nguyễn Văn Hùng",
      role: "Mua hàng",
      orderDate: "12/09/2026",
      revenueVnd: 104200000,
      costVnd: 91700000,
      profitVnd: 12500000,
      marginPercent: 12.0,
      commissionVnd: 1250000,
      status: "Hoàn thành"
    },
    {
      orderCode: "MD1986",
      customer: "Tinox Logistics (NT0401)",
      employee: "Lê Hoàng Thu",
      role: "Mua hàng",
      orderDate: "05/08/2026",
      revenueVnd: 178500000,
      costVnd: 157200000,
      profitVnd: 21300000,
      marginPercent: 11.9,
      commissionVnd: 2130000,
      status: "Hoàn thành"
    }
  ];

  // Lọc danh sách theo filter
  const filteredProfitList = orderProfitList.filter((item) => {
    if (profitFilter.employeeName !== "Tất cả" && item.employee !== profitFilter.employeeName) {
      return false;
    }
    return true;
  });

  const totalFilteredProfit = filteredProfitList.reduce(
    (acc, it) => {
      acc.revenue += it.revenueVnd;
      acc.cost += it.costVnd;
      acc.profit += it.profitVnd;
      acc.commission += it.commissionVnd;
      return acc;
    },
    { revenue: 0, cost: 0, profit: 0, commission: 0 }
  );

  // Số liệu tổng hợp báo cáo kho
  const reportData = {
    revenueGoodsVnd: 1245000000,
    feeBuyVnd: 37350000,
    feeShipVnd: 74200000,
    feeUtnkVnd: 28500000,
    grossProfitVnd: 140050000,
    totalWeightKg: 18450,
    totalVolumeCbm: 54.2,
    totalOrdersCount: 284,
    warehouseStats: [
      { name: "Kho Hà Nội (VN)", weightKg: 10240, ordersCount: 162, cbm: 30.1 },
      { name: "Kho TP. Hồ Chí Minh (VN)", weightKg: 8210, ordersCount: 122, cbm: 24.1 },
      { name: "Kho Quảng Châu (CN)", weightKg: 1450, ordersCount: 28, cbm: 4.5 },
      { name: "Kho Bằng Tường (CN)", weightKg: 3820, ordersCount: 65, cbm: 11.2 },
    ],
    dailyTrends: [
      { day: "Thứ 2", orders: 38, revenue: 185000000, weight: 2400 },
      { day: "Thứ 3", orders: 45, revenue: 215000000, weight: 2850 },
      { day: "Thứ 4", orders: 52, revenue: 248000000, weight: 3200 },
      { day: "Thứ 5", orders: 48, revenue: 230000000, weight: 2950 },
      { day: "Thứ 6", orders: 58, revenue: 285000000, weight: 3750 },
      { day: "Thứ 7", orders: 32, revenue: 155000000, weight: 2100 },
      { day: "Chủ Nhật", orders: 24, revenue: 112000000, weight: 1450 },
    ],
  };

  const handleExportCSV = () => {
    const csvContent = [
      "Mã Đơn\tKhách Hàng\tNhân Viên\tNgày Đặt\tDoanh Thu (VNĐ)\tGiá Vốn (VNĐ)\tLợi Nhuận Gộp (VNĐ)\tTỷ Suất (%)\tHoa Hồng (VNĐ)",
      ...filteredProfitList.map((o) => `${o.orderCode}\t${o.customer}\t${o.employee}\t${o.orderDate}\t${o.revenueVnd}\t${o.costVnd}\t${o.profitVnd}\t${o.marginPercent}%\t${o.commissionVnd}`),
      "",
      `Tổng Doanh Thu:\t${totalFilteredProfit.revenue}`,
      `Tổng Giá Vốn:\t${totalFilteredProfit.cost}`,
      `Tổng Lợi Nhuận Gộp:\t${totalFilteredProfit.profit}`,
      `Tổng Hoa Hồng Trả NV:\t${totalFilteredProfit.commission}`
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bao-cao-loi-nhuan-dat-hang-${profitFilter.startDate}-${profitFilter.endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
            Báo Cáo Quản Trị ERP Nam Trung Logistics
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <span>Báo Cáo Lợi Nhuận & Hiệu Quả Kinh Doanh</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Phân tích lợi nhuận gộp theo từng đơn hàng, nhân viên mua hàng (Purchaser), kinh doanh (Sale) và sản lượng kho
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab("profit")}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === "profit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <DollarSign className="w-4 h-4" /> Lợi Nhuận Đặt Hàng Theo Nhân Viên
        </button>

        <button
          onClick={() => setActiveTab("revenue")}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === "revenue"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Doanh Thu & Cước Vận Chuyển
        </button>

        <button
          onClick={() => setActiveTab("warehouses")}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === "warehouses"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Building className="w-4 h-4" /> Sản Lượng 4 Tổng Kho (VN - TQ)
        </button>
      </div>

      {/* TAB 1: BÁO CÁO LỢI NHUẬN ĐẶT HÀNG (TRÍCH TỪ AUTO_GEMINI) */}
      {activeTab === "profit" && (
        <div className="space-y-6">
          {/* THANH BỘ LỌC (FILTER BAR) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap gap-6 items-end">
            {/* Loại nhân viên */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Loại nhân viên</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1.5 w-48 bg-gray-50">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <select
                  value={profitFilter.employeeType}
                  onChange={(e) => setProfitFilter({ ...profitFilter, employeeType: e.target.value })}
                  className="w-full bg-transparent outline-none text-xs font-semibold text-gray-800"
                >
                  <option value="Mua hàng">Mua hàng (Purchaser)</option>
                  <option value="Kinh doanh">Kinh doanh (Sale)</option>
                  <option value="CSKH">CSKH</option>
                </select>
              </div>
            </div>

            {/* Chọn nhân viên cụ thể */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Nhân viên phụ trách</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1.5 w-52 bg-gray-50">
                <select
                  value={profitFilter.employeeName}
                  onChange={(e) => setProfitFilter({ ...profitFilter, employeeName: e.target.value })}
                  className="w-full bg-transparent outline-none text-xs font-medium text-gray-800"
                >
                  <option value="Tất cả">Tất cả nhân viên</option>
                  <option value="Lê Hoàng Thu">Lê Hoàng Thu (Purchaser Senior)</option>
                  <option value="Nguyễn Văn Hùng">Nguyễn Văn Hùng (Purchaser 1688)</option>
                  <option value="Trần Quốc Đạt">Trần Quốc Đạt (Purchaser Taobao)</option>
                </select>
              </div>
            </div>

            {/* Từ ngày */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Từ ngày</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1.5 w-44 bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="date"
                  value={profitFilter.startDate}
                  onChange={(e) => setProfitFilter({ ...profitFilter, startDate: e.target.value })}
                  className="w-full bg-transparent outline-none text-xs text-gray-800 font-medium"
                />
              </div>
            </div>

            {/* Đến ngày */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Đến ngày</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1.5 w-44 bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="date"
                  value={profitFilter.endDate}
                  onChange={(e) => setProfitFilter({ ...profitFilter, endDate: e.target.value })}
                  className="w-full bg-transparent outline-none text-xs text-gray-800 font-medium"
                />
              </div>
            </div>

            {/* Nút xem */}
            <button
              onClick={() => {}}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-xs"
            >
              LỌC BÁO CÁO
            </button>
          </div>

          {/* 4 CARDS TỔNG KẾT TÀI CHÍNH KỲ NÀY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-gray-500 uppercase block">Tổng Thu Khách</span>
              <div className="text-xl font-black text-gray-900 mt-1">
                {formatVND(totalFilteredProfit.revenue)}
              </div>
              <span className="text-[11px] text-gray-400">Tổng doanh thu {filteredProfitList.length} đơn</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-gray-500 uppercase block">Tổng Giá Vốn Thực Tế</span>
              <div className="text-xl font-bold text-slate-700 mt-1">
                {formatVND(totalFilteredProfit.cost)}
              </div>
              <span className="text-[11px] text-gray-400">Tiền mua thật + cước gốc</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 uppercase flex items-center justify-between">
                Lợi Nhuận Gộp Đặt Hàng
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                  {totalFilteredProfit.revenue > 0 ? ((totalFilteredProfit.profit / totalFilteredProfit.revenue) * 100).toFixed(1) : 0}%
                </span>
              </span>
              <div className="text-xl font-black text-emerald-600 mt-1">
                +{formatVND(totalFilteredProfit.profit)}
              </div>
              <span className="text-[11px] text-emerald-700/80">Lãi tỷ giá + đàm phán + cước</span>
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 shadow-xs">
              <span className="text-xs font-bold text-purple-800 uppercase block">Hoa Hồng Nhân Viên</span>
              <div className="text-xl font-black text-purple-700 mt-1">
                {formatVND(totalFilteredProfit.commission)}
              </div>
              <span className="text-[11px] text-purple-700/80">Chi trả cho Purchaser/Sale</span>
            </div>
          </div>

          {/* BẢNG CHI TIẾT LỢI NHUẬN TỪNG ĐƠN HÀNG */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                CHI TIẾT LỢI NHUẬN & HIỆU SUẤT ĐƠN HÀNG ({filteredProfitList.length} ĐƠN)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">Mã Đơn</th>
                    <th className="p-3">Khách Hàng</th>
                    <th className="p-3">Nhân Viên Phụ Trách</th>
                    <th className="p-3">Ngày Đặt</th>
                    <th className="p-3 text-right">Doanh Thu Thu Khách</th>
                    <th className="p-3 text-right">Giá Vốn Thực Tế</th>
                    <th className="p-3 text-right text-emerald-700">Lợi Nhuận Gộp</th>
                    <th className="p-3 text-right text-purple-700">Hoa Hồng NV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProfitList.map((item) => (
                    <tr key={item.orderCode} className="hover:bg-gray-50">
                      <td className="p-3">
                        <a
                          href={`/admin/orders/${item.orderCode}`}
                          className="font-mono font-bold text-blue-600 hover:underline"
                        >
                          {item.orderCode}
                        </a>
                        <span className="block text-[10px] text-gray-400">{item.status}</span>
                      </td>
                      <td className="p-3 font-medium text-gray-800">{item.customer}</td>
                      <td className="p-3 font-semibold text-gray-700">
                        {item.employee}
                        <span className="block text-[10px] text-gray-400 font-normal">{item.role}</span>
                      </td>
                      <td className="p-3 text-gray-500">{item.orderDate}</td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">
                        {formatVND(item.revenueVnd)}
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-slate-700">
                        {formatVND(item.costVnd)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">
                        +{formatVND(item.profitVnd)}
                        <span className="block text-[10px] text-emerald-700 font-normal">{item.marginPercent}%</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-purple-700">
                        {formatVND(item.commissionVnd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOANH THU & BIỂU ĐỒ */}
      {activeTab === "revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Doanh Số Tiền Hàng
              </span>
              <div className="text-2xl font-black text-gray-900 font-mono">
                {formatVND(reportData.revenueGoodsVnd)}
              </div>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> +16.2% so với kỳ trước
              </span>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1">
                Lợi Nhuận Gộp Dịch Vụ
              </span>
              <div className="text-2xl font-black text-purple-700 font-mono">
                {formatVND(reportData.grossProfitVnd)}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Gồm phí mua hàng, phí UTNK, chênh cước</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 block mb-1">
                Tổng Sản Lượng Về Kho
              </span>
              <div className="text-2xl font-black text-brand-700 font-mono">
                {(reportData.totalWeightKg / 1000).toFixed(2)} <span className="text-sm font-bold text-gray-400">Tấn</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Thể tích tương đương: {reportData.totalVolumeCbm} m³</p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                Số Lượng Đơn Hoàn Thành
              </span>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                {reportData.totalOrdersCount} <span className="text-sm font-bold text-gray-400">đơn</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Tỷ lệ giao đúng hạn: 98.4%</p>
            </div>
          </div>

          {/* Biểu đồ xu hướng */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900">Biến Động Doanh Số & Cân Nặng Trong Kỳ</h3>
            <div className="grid grid-cols-7 gap-2 pt-4 items-end h-48 border-b border-gray-100 pb-4">
              {reportData.dailyTrends.map((d, idx) => {
                const heightPercent = Math.round((d.revenue / 300000000) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-mono font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.weight} kg
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-purple-700 to-indigo-500 rounded-xl group-hover:from-purple-600 group-hover:to-indigo-400 transition-all shadow-sm"
                    />
                    <span className="text-[11px] font-bold text-gray-600 mt-1">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SẢN LƯỢNG KHO */}
      {activeTab === "warehouses" && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-base text-gray-900">Sản Lượng & Đơn Hàng Theo Từng Tổng Kho</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Tên Kho</th>
                  <th className="py-3.5 px-4">Sản Lượng Cân Nặng (kg)</th>
                  <th className="py-3.5 px-4">Thể Tích Tương Đương (m³)</th>
                  <th className="py-3.5 px-4">Số Lượng Đơn Xử Lý</th>
                  <th className="py-3.5 px-4 text-right">Tỷ Trọng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportData.warehouseStats.map((wh, idx) => {
                  const percent = Math.round((wh.weightKg / reportData.totalWeightKg) * 100);
                  return (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-900 flex items-center gap-2">
                        <Building className="w-4 h-4 text-purple-600" />
                        <span>{wh.name}</span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-brand-700 text-sm">
                        {wh.weightKg.toLocaleString()} kg
                      </td>
                      <td className="py-4 px-4 font-mono text-gray-700">{wh.cbm} m³</td>
                      <td className="py-4 px-4 font-bold text-gray-900">{wh.ordersCount} đơn</td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-black text-purple-700">{percent}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
