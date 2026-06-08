import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../features/auth/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    agency_name: "",
    agency_address: "",
    password: "",
    password_confirm: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage("");

      await register(formData);

      navigate("/login");
    } catch (error) {
      console.error(error);
      setErrorMessage("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản</h1>
          <p className="mt-2 text-sm text-slate-500">
            Đăng ký tài khoản chủ đại lý để bắt đầu quản lý kho.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <Input
            label="Username"
            value={formData.username}
            onChange={(value) => handleChange("username", value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => handleChange("email", value)}
            required
          />
          <Input
            label="Họ"
            value={formData.first_name}
            onChange={(value) => handleChange("first_name", value)}
          />
          <Input
            label="Tên"
            value={formData.last_name}
            onChange={(value) => handleChange("last_name", value)}
          />
          <Input
            label="Số điện thoại"
            value={formData.phone}
            onChange={(value) => handleChange("phone", value)}
          />
          <Input
            label="Tên đại lý"
            value={formData.agency_name}
            onChange={(value) => handleChange("agency_name", value)}
          />

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Địa chỉ đại lý
            </label>
            <textarea
              value={formData.agency_address}
              onChange={(event) =>
                handleChange("agency_address", event.target.value)
              }
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              placeholder="Nhập địa chỉ đại lý"
            />
          </div>

          <Input
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={(value) => handleChange("password", value)}
            required
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            value={formData.password_confirm}
            onChange={(value) => handleChange("password_confirm", value)}
            required
          />

          <div className="md:col-span-2">
            <button
              disabled={isLoading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-semibold text-slate-900">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
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
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
      />
    </div>
  );
}