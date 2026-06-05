import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import type { Category, Product } from "../features/inventory/inventoryApi";

import {
  getCategories,
  getProducts,
} from "../features/inventory/inventoryApi";

const formatCurrency = (value: string | number) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

export default function ProductListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    size: "",
    color: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [categoryData, productData] = await Promise.all([
        getCategories(),
        getProducts(filters),
      ]);

      setCategories(categoryData);
      setProducts(productData);
    } catch (error) {
      console.error(error);
      setErrorMessage("Không tải được danh sách sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    fetchData();
  };

  return (
    <AppLayout
      title="Sản phẩm"
      subtitle="Quản lý danh sách sản phẩm, biến thể, size, màu và tồn kho."
      action={
        <Link
          to="/products/new"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          + Thêm sản phẩm
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-5">
            <input
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, search: event.target.value }))
              }
              placeholder="Tìm mã, tên sản phẩm..."
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 md:col-span-2"
            />

            <select
              value={filters.category}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  category: event.target.value,
                }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <input
              value={filters.size}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, size: event.target.value }))
              }
              placeholder="Size"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            />

            <div className="flex gap-3">
              <input
                value={filters.color}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, color: event.target.value }))
                }
                placeholder="Màu"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              />
              <button
                onClick={handleSearch}
                className="rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Lọc
              </button>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-bold text-slate-900">
              Danh sách sản phẩm ({products.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="p-6 text-sm text-slate-500">Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-6 py-3">Mã</th>
                    <th className="px-6 py-3">Tên sản phẩm</th>
                    <th className="px-6 py-3">Danh mục</th>
                    <th className="px-6 py-3">Biến thể</th>
                    <th className="px-6 py-3">Tồn kho</th>
                    <th className="px-6 py-3">Giá bán</th>
                    <th className="px-6 py-3">Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const totalStock = product.variants.reduce(
                      (sum, variant) => sum + variant.current_stock,
                      0
                    );

                    const firstPrice = product.variants[0]?.sale_price || 0;

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-slate-100 text-slate-700"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {product.code}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">
                            {product.name}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                            {product.description || "Không có mô tả"}
                          </p>
                        </td>
                        <td className="px-6 py-4">{product.category_name}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {product.variants.map((variant) => (
                              <span
                                key={variant.id}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                              >
                                {variant.size} / {variant.color}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold">{totalStock}</td>
                        <td className="px-6 py-4">
                          {formatCurrency(firstPrice)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              product.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500",
                            ].join(" ")}
                          >
                            {product.is_active ? "Đang bán" : "Ẩn"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {products.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-slate-500"
                      >
                        Chưa có sản phẩm nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}