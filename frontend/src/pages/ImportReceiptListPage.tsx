import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import type { ImportReceipt } from "../features/inventory/inventoryApi";

import {
  downloadImportsExcel,
  getImportReceipts,
} from "../features/inventory/inventoryApi";

const formatCurrency = (value: string | number) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

export default function ImportReceiptListPage() {
  const [receipts, setReceipts] = useState<ImportReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getImportReceipts()
      .then(setReceipts)
      .catch((error) => {
        console.error(error);
        setErrorMessage("Không tải được danh sách phiếu nhập.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AppLayout
      title="Phiếu nhập"
      subtitle="Theo dõi lịch sử nhập hàng từ nhà cung cấp."
      action={
        <div className="flex gap-2">
          <button
            onClick={downloadImportsExcel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Xuất Excel
          </button>
          <Link
            to="/imports/new"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Lập phiếu nhập
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
            Danh sách phiếu nhập ({receipts.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-slate-500">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-6 py-3">Mã phiếu</th>
                  <th className="px-6 py-3">Nhà cung cấp</th>
                  <th className="px-6 py-3">Ngày nhập</th>
                  <th className="px-6 py-3">Số dòng</th>
                  <th className="px-6 py-3">Tổng tiền</th>
                  <th className="px-6 py-3">Ghi chú</th>
                </tr>
              </thead>

              <tbody>
                {receipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className="border-b border-slate-100 text-slate-700"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {receipt.receipt_code}
                    </td>
                    <td className="px-6 py-4">{receipt.supplier_name}</td>
                    <td className="px-6 py-4">{receipt.import_date}</td>
                    <td className="px-6 py-4">{receipt.items.length}</td>
                    <td className="px-6 py-4 font-bold">
                      {formatCurrency(receipt.total_amount)}
                    </td>
                    <td className="px-6 py-4">{receipt.note || "-"}</td>
                  </tr>
                ))}

                {receipts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      Chưa có phiếu nhập nào.
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