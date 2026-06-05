import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import type { Category } from "../features/inventory/inventoryApi";

import {
  createProduct,
  createProductVariant,
  getCategories,
} from "../features/inventory/inventoryApi";

export default function ProductFormPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [productForm, setProductForm] = useState({
    category: "",
    code: "",
    name: "",
    description: "",
    is_active: true,
  });

  const [variantForm, setVariantForm] = useState({
    size: "",
    color: "",
    barcode: "",
    import_price: "",
    sale_price: "",
    current_stock: "",
    low_stock_threshold: "5",
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => {
        console.error(error);
        setErrorMessage("Không tải được danh mục.");
      });
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage("");

      const product = await createProduct({
        category: Number(productForm.category),
        code: productForm.code,
        name: productForm.name,
        description: productForm.description,
        is_active: productForm.is_active,
      });

      if (variantForm.size && variantForm.color) {
        await createProductVariant({
          product: product.id,
          size: variantForm.size,
          color: variantForm.color,
          barcode: variantForm.barcode,
          import_price: Number(variantForm.import_price || 0),
          sale_price: Number(variantForm.sale_price || 0),
          current_stock: Number(variantForm.current_stock || 0),
          low_stock_threshold: Number(variantForm.low_stock_threshold || 5),
          is_active: variantForm.is_active,
        });
      }

      navigate("/products");
    } catch (error) {
      console.error(error);
      setErrorMessage("Không tạo được sản phẩm. Kiểm tra lại dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout
      title="Thêm sản phẩm"
      subtitle="Tạo sản phẩm mới và biến thể ban đầu."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Thông tin sản phẩm
          </h3>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Danh mục
              </label>
              <select
                value={productForm.category}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Mã sản phẩm"
              value={productForm.code}
              onChange={(value) =>
                setProductForm((prev) => ({ ...prev, code: value }))
              }
              required
            />

            <Input
              label="Tên sản phẩm"
              value={productForm.name}
              onChange={(value) =>
                setProductForm((prev) => ({ ...prev, name: value }))
              }
              required
            />

            <div className="flex items-end">
              <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={productForm.is_active}
                  onChange={(event) =>
                    setProductForm((prev) => ({
                      ...prev,
                      is_active: event.target.checked,
                    }))
                  }
                />
                <span className="text-sm font-medium text-slate-700">
                  Đang kinh doanh
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Mô tả
              </label>
              <textarea
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Biến thể ban đầu
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Có thể bỏ trống nếu chỉ muốn tạo sản phẩm trước.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Size"
              value={variantForm.size}
              onChange={(value) =>
                setVariantForm((prev) => ({ ...prev, size: value }))
              }
            />
            <Input
              label="Màu"
              value={variantForm.color}
              onChange={(value) =>
                setVariantForm((prev) => ({ ...prev, color: value }))
              }
            />
            <Input
              label="Barcode"
              value={variantForm.barcode}
              onChange={(value) =>
                setVariantForm((prev) => ({ ...prev, barcode: value }))
              }
            />
            <Input
              label="Tồn kho"
              type="number"
              value={variantForm.current_stock}
              onChange={(value) =>
                setVariantForm((prev) => ({
                  ...prev,
                  current_stock: value,
                }))
              }
            />
            <Input
              label="Giá nhập"
              type="number"
              value={variantForm.import_price}
              onChange={(value) =>
                setVariantForm((prev) => ({
                  ...prev,
                  import_price: value,
                }))
              }
            />
            <Input
              label="Giá bán"
              type="number"
              value={variantForm.sale_price}
              onChange={(value) =>
                setVariantForm((prev) => ({ ...prev, sale_price: value }))
              }
            />
            <Input
              label="Ngưỡng tồn thấp"
              type="number"
              value={variantForm.low_stock_threshold}
              onChange={(value) =>
                setVariantForm((prev) => ({
                  ...prev,
                  low_stock_threshold: value,
                }))
              }
            />
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            disabled={isLoading}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isLoading ? "Đang lưu..." : "Lưu sản phẩm"}
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
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
      />
    </div>
  );
}