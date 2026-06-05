import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import type { ProductVariant, Supplier } from "../features/inventory/inventoryApi";

import {
  createImportReceipt,
  getProductVariants,
  getSuppliers,
} from "../features/inventory/inventoryApi";

type ImportItemForm = {
  product_variant: string;
  quantity: string;
  import_price: string;
};

const createEmptyItem = (): ImportItemForm => ({
  product_variant: "",
  quantity: "1",
  import_price: "",
});

export default function ImportReceiptFormPage() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [formData, setFormData] = useState({
    receipt_code: `PN-${Date.now()}`,
    supplier: "",
    import_date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const [items, setItems] = useState<ImportItemForm[]>([createEmptyItem()]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    Promise.all([getSuppliers(), getProductVariants()])
      .then(([supplierData, variantData]) => {
        setSuppliers(supplierData);
        setVariants(variantData);
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage("Không tải được dữ liệu nhà cung cấp hoặc sản phẩm.");
      });
  }, []);

  const updateItem = (
    index: number,
    field: keyof ImportItemForm,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.import_price || 0),
    0
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage("");

      await createImportReceipt({
        receipt_code: formData.receipt_code,
        supplier: Number(formData.supplier),
        import_date: formData.import_date,
        note: formData.note,
        items: items.map((item) => ({
          product_variant: Number(item.product_variant),
          quantity: Number(item.quantity),
          import_price: Number(item.import_price),
        })),
      });

      navigate("/imports");
    } catch (error) {
      console.error(error);
      setErrorMessage("Không tạo được phiếu nhập. Kiểm tra lại dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout
      title="Lập phiếu nhập"
      subtitle="Nhập hàng từ nhà cung cấp và tự động tăng tồn kho."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Thông tin phiếu nhập
          </h3>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Mã phiếu"
              value={formData.receipt_code}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, receipt_code: value }))
              }
              required
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nhà cung cấp
              </label>
              <select
                value={formData.supplier}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    supplier: event.target.value,
                  }))
                }
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              >
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Ngày nhập"
              type="date"
              value={formData.import_date}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, import_date: value }))
              }
              required
            />

            <Input
              label="Ghi chú"
              value={formData.note}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, note: value }))
              }
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">
              Sản phẩm nhập
            </h3>
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, createEmptyItem()])}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              + Thêm dòng
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-12"
              >
                <div className="md:col-span-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Sản phẩm / biến thể
                  </label>
                  <select
                    value={item.product_variant}
                    onChange={(event) =>
                      updateItem(index, "product_variant", event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.product_code} - {variant.product_name} -{" "}
                        {variant.size} - {variant.color}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Số lượng"
                    type="number"
                    value={item.quantity}
                    onChange={(value) => updateItem(index, "quantity", value)}
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <Input
                    label="Giá nhập"
                    type="number"
                    value={item.import_price}
                    onChange={(value) =>
                      updateItem(index, "import_price", value)
                    }
                    required
                  />
                </div>

                <div className="flex items-end md:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <div className="rounded-2xl bg-slate-900 px-6 py-4 text-white">
              <p className="text-sm text-slate-300">Tổng tiền nhập</p>
              <p className="mt-1 text-2xl font-bold">
                {totalAmount.toLocaleString("vi-VN")} đ
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/imports")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            disabled={isLoading}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isLoading ? "Đang lưu..." : "Lưu phiếu nhập"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
      />
    </div>
  );
}