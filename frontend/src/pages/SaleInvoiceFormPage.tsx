import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import type { Customer, ProductVariant } from "../features/inventory/inventoryApi";

import {
  createSaleInvoice,
  getCustomers,
  getProductVariants,
} from "../features/inventory/inventoryApi";
type SaleItemForm = {
  product_variant: string;
  quantity: string;
  sale_price: string;
};

const createEmptyItem = (): SaleItemForm => ({
  product_variant: "",
  quantity: "1",
  sale_price: "",
});

const paymentMethods = [
  { value: "CASH", label: "Tiền mặt" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản" },
  { value: "CARD", label: "Thẻ" },
  { value: "OTHER", label: "Khác" },
] as const;

export default function SaleInvoiceFormPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [formData, setFormData] = useState({
    invoice_code: `HD-${Date.now()}`,
    customer: "",
    sale_date: new Date().toISOString().slice(0, 10),
    note: "",
    discount_amount: "0",
    payment_method: "CASH" as "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER",
  });

  const [items, setItems] = useState<SaleItemForm[]>([createEmptyItem()]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    Promise.all([getCustomers(), getProductVariants()])
      .then(([customerData, variantData]) => {
        setCustomers(customerData);
        setVariants(variantData);
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage("Không tải được dữ liệu khách hàng hoặc sản phẩm.");
      });
  }, []);

  const updateItem = (
    index: number,
    field: keyof SaleItemForm,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleChooseVariant = (index: number, variantId: string) => {
    const variant = variants.find((item) => String(item.id) === variantId);

    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              product_variant: variantId,
              sale_price: variant?.sale_price || item.sale_price,
            }
          : item
      )
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.sale_price || 0),
    0
  );

  const finalAmount = totalAmount - Number(formData.discount_amount || 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage("");

      await createSaleInvoice({
        invoice_code: formData.invoice_code,
        customer: formData.customer ? Number(formData.customer) : null,
        sale_date: formData.sale_date,
        note: formData.note,
        discount_amount: Number(formData.discount_amount || 0),
        payment_method: formData.payment_method,
        items: items.map((item) => ({
          product_variant: Number(item.product_variant),
          quantity: Number(item.quantity),
          sale_price: Number(item.sale_price),
        })),
      });

      navigate("/sales");
    } catch (error) {
      console.error(error);
      setErrorMessage("Không tạo được hóa đơn. Kiểm tra tồn kho và dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout
      title="Tạo hóa đơn bán"
      subtitle="Bán hàng, tự động trừ tồn kho và ghi nhận doanh thu."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Thông tin hóa đơn
          </h3>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Mã hóa đơn"
              value={formData.invoice_code}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, invoice_code: value }))
              }
              required
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Khách hàng
              </label>
              <select
                value={formData.customer}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    customer: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              >
                <option value="">Khách lẻ</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name || customer.phone || `Khách #${customer.id}`}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Ngày bán"
              type="date"
              value={formData.sale_date}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, sale_date: value }))
              }
              required
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phương thức thanh toán
              </label>
              <select
                value={formData.payment_method}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    payment_method: event.target.value as
                      | "CASH"
                      | "BANK_TRANSFER"
                      | "CARD"
                      | "OTHER",
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Giảm giá"
              type="number"
              value={formData.discount_amount}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  discount_amount: value,
                }))
              }
            />

            <div className="lg:col-span-3">
              <Input
                label="Ghi chú"
                value={formData.note}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, note: value }))
                }
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">
              Sản phẩm bán
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
                      handleChooseVariant(index, event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.product_code} - {variant.product_name} -{" "}
                        {variant.size} - {variant.color} - Tồn:{" "}
                        {variant.current_stock}
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
                    label="Giá bán"
                    type="number"
                    value={item.sale_price}
                    onChange={(value) => updateItem(index, "sale_price", value)}
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

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <SummaryBox label="Tổng tiền" value={totalAmount} />
            <SummaryBox label="Giảm giá" value={Number(formData.discount_amount || 0)} />
            <SummaryBox label="Khách cần trả" value={finalAmount} dark />
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/sales")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            disabled={isLoading}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isLoading ? "Đang lưu..." : "Lưu hóa đơn"}
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

function SummaryBox({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: number;
  dark?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl px-6 py-4",
        dark ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900",
      ].join(" ")}
    >
      <p className={["text-sm", dark ? "text-slate-300" : "text-slate-500"].join(" ")}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">
        {value.toLocaleString("vi-VN")} đ
      </p>
    </div>
  );
}