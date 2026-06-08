import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../features/auth/authApi";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await login(formData);

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      navigate("/");
    } catch (error) {
      console.error(error);
      setErrorMessage("Đăng nhập thất bại. Vui lòng kiểm tra tài khoản.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white">
            VT
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="mt-2 text-sm text-slate-500">
            Quản lý xuất nhập hàng cho đại lý bán lẻ.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tên đăng nhập
            </label>
            <input
              value={formData.username}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  username: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              placeholder="Nhập username"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Mật khẩu
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button
            disabled={isLoading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-semibold text-slate-900">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}