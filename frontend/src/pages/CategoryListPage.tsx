import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../features/inventory/inventoryApi";

import type { Category } from "../features/inventory/inventoryApi";

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Không tải được danh sách danh mục.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      is_active: true,
    });
    setEditingCategoryId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage("Tên danh mục không được để trống.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (editingCategoryId) {
        await updateCategory(editingCategoryId, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          is_active: formData.is_active,
        });

        setSuccessMessage("Cập nhật danh mục thành công.");
      } else {
        await createCategory({
          name: formData.name.trim(),
          description: formData.description.trim(),
          is_active: formData.is_active,
        });

        setSuccessMessage("Tạo danh mục thành công.");
      }

      resetForm();
      await fetchCategories();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        editingCategoryId
          ? "Cập nhật danh mục thất bại."
          : "Tạo danh mục thất bại. Có thể tên danh mục đã tồn tại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
      is_active: category.is_active,
    });

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa danh mục "${category.name}" không?`
    );

    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await deleteCategory(category.id);
      setSuccessMessage("Xóa danh mục thành công.");
      await fetchCategories();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Không thể xóa danh mục này. Có thể danh mục đang được dùng bởi sản phẩm."
      );
    }
  };

  return (
    <AppLayout
      title="Danh mục sản phẩm"
      subtitle="Tạo và quản lý các nhóm sản phẩm như áo sơ mi, quần âu, áo polo."
    >
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            {editingCategoryId ? "Sửa danh mục" : "Thêm danh mục"}
          </h3>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tên danh mục
              </label>
              <input
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="Ví dụ: Áo sơ mi"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={4}
                placeholder="Ghi chú ngắn cho danh mục này..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_active: event.target.checked,
                  }))
                }
              />
              <span className="text-sm font-semibold text-slate-700">
                Đang sử dụng
              </span>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Đang lưu..."
                  : editingCategoryId
                  ? "Cập nhật"
                  : "Thêm danh mục"}
              </button>

              {editingCategoryId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy sửa
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-bold text-slate-900">
              Danh sách danh mục ({categories.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="p-6 text-sm text-slate-500">Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-6 py-3">Tên danh mục</th>
                    <th className="px-6 py-3">Mô tả</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    <th className="px-6 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-slate-100 text-slate-700"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {category.name}
                      </td>

                      <td className="px-6 py-4">
                        {category.description || "Không có mô tả"}
                      </td>

                      <td className="px-6 py-4">
                        {category.is_active ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            Đang dùng
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                            Tạm ẩn
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(category)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {categories.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-slate-500"
                      >
                        Chưa có danh mục nào.
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