import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import type { SaleInvoice } from "../features/inventory/inventoryApi";

import {
  downloadSalesExcel,
  getSaleInvoices,
} from "../features/inventory/inventoryApi";

const formatCurrency = (value: string | number) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

const paymentMethodLabel = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
  CARD: "Thẻ",
  OTHER: "Khác",
};

export default function SaleInvoiceListPage() {
  const [invoices, setInvoices] = useState<SaleInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getSaleInvoices()
      .then(setInvoices)
      .catch((error) => {
        console.error(error);
        setErrorMessage("Không tải được danh sách hóa đơn.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AppLayout
      title="Hóa đơn bán hàng"
      subtitle="Theo dõi doanh thu và lịch sử bán hàng."
      action={
        <div className="flex gap-2">
          <button
            onClick={downloadSalesExcel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Xuất Excel
          </button>
          <Link
            to="/sales/new"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Tạo hóa đơn
          </Link>
        </div>
      }
    >
      {errorMessage && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="font-bold text-slate-900">
            Danh sách hóa đơn ({invoices.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-slate-500">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-6 py-3">Mã hóa đơn</th>
                  <th className="px-6 py-3">Khách hàng</th>
                  <th className="px-6 py-3">Ngày bán</th>
                  <th className="px-6 py-3">Số dòng</th>
                  <th className="px-6 py-3">Tổng tiền</th>
                  <th className="px-6 py-3">Giảm giá</th>
                  <th className="px-6 py-3">Thanh toán</th>
                  <th className="px-6 py-3">PTTT</th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-100 text-slate-700"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {invoice.invoice_code}
                    </td>
                    <td className="px-6 py-4">
                      {invoice.customer_name || "Khách lẻ"}
                      {invoice.customer_phone && (
                        <p className="mt-1 text-xs text-slate-500">
                          {invoice.customer_phone}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">{invoice.sale_date}</td>
                    <td className="px-6 py-4">{invoice.items.length}</td>
                    <td className="px-6 py-4">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(invoice.discount_amount)}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {formatCurrency(invoice.final_amount)}
                    </td>
                    <td className="px-6 py-4">
                      {paymentMethodLabel[invoice.payment_method]}
                    </td>
                  </tr>
                ))}

                {invoices.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      Chưa có hóa đơn nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppLayout>
  );
}