import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

import AppLayout from "../components/AppLayout";
import type { DashboardSummary } from "../features/inventory/inventoryApi";

import {
  downloadImportsExcel,
  downloadInventoryExcel,
  downloadMonthlyWord,
  downloadSalesExcel,
  getDashboardSummary,
} from "../features/inventory/inventoryApi";

const formatCurrency = (value: string | number) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Không tải được dữ liệu dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Tổng quan doanh thu, tồn kho và sản phẩm bán chạy."
      action={
        <div className="flex flex-wrap gap-2">
          <ExportButton label="Xuất báo cáo doanh số" onClick={downloadSalesExcel} />
          <ExportButton label="Xuất báo cáo nhập" onClick={downloadImportsExcel} />
          <ExportButton
            label="Xuất báo cáo tồn kho"
            onClick={downloadInventoryExcel}
          />
          <ExportButton label="Xuất báo cáo tháng" onClick={downloadMonthlyWord} />
          <Link
            to="/ai"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            <SmartToyOutlinedIcon fontSize="small" />
            Trợ lý ảo
          </Link>
        </div>
      }
    >
      {isLoading && <Loading />}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {summary && (
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Doanh thu hôm nay"
              value={formatCurrency(summary.today.revenue)}
              note={`${summary.today.invoice_count} hóa đơn`}
            />
            <StatCard
              title="Số lượng đã bán"
              value={summary.today.sold_quantity}
              note="Tổng sản phẩm bán hôm nay"
            />
            <StatCard
              title="Tổng tồn kho"
              value={summary.inventory.total_stock}
              note={`${summary.inventory.total_variants} biến thể`}
            />
            <StatCard
              title="Sắp hết hàng"
              value={summary.inventory.low_stock_count}
              note="Cần kiểm tra nhập thêm"
              danger
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Doanh thu 7 ngày
              </h3>

              <div className="mt-5 space-y-4">
                {summary.revenue_chart.map((item) => (
                  <div key={item.date}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {item.date}
                      </span>
                      <span className="text-slate-500">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900"
                        style={{
                          width: `${Math.min(
                            100,
                            Number(item.revenue) / 100000,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Sản phẩm bán chạy
              </h3>

              <div className="mt-5 space-y-4">
                {summary.top_products.length === 0 && (
                  <p className="text-sm text-slate-500">Chưa có dữ liệu.</p>
                )}

                {summary.top_products.map((item) => (
                  <div
                    key={`${item.product_code}-${item.product_name}`}
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.product_name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Mã: {item.product_code}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {item.total_quantity}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatCurrency(item.total_revenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              Sản phẩm sắp hết hàng
            </h3>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-4">Mã</th>
                    <th className="py-3 pr-4">Sản phẩm</th>
                    <th className="py-3 pr-4">Danh mục</th>
                    <th className="py-3 pr-4">Size</th>
                    <th className="py-3 pr-4">Màu</th>
                    <th className="py-3 pr-4">Tồn</th>
                    <th className="py-3 pr-4">Ngưỡng</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.low_stock_variants.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 text-slate-700"
                    >
                      <td className="py-4 pr-4 font-semibold">
                        {item.product_code}
                      </td>
                      <td className="py-4 pr-4">{item.product_name}</td>
                      <td className="py-4 pr-4">{item.category_name}</td>
                      <td className="py-4 pr-4">{item.size}</td>
                      <td className="py-4 pr-4">{item.color}</td>
                      <td className="py-4 pr-4 font-bold text-red-600">
                        {item.current_stock}
                      </td>
                      <td className="py-4 pr-4">{item.low_stock_threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </AppLayout>
  );
}

function StatCard({
  title,
  value,
  note,
  danger = false,
}: {
  title: string;
  value: string | number;
  note: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p
        className={[
          "mt-3 text-3xl font-bold",
          danger ? "text-red-600" : "text-slate-900",
        ].join(" ")}
      >
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </div>
  );
}

function ExportButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}

function Loading() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      Đang tải dữ liệu...
    </div>
  );
}
