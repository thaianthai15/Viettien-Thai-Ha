import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";

const cards = [
  {
    title: "Quản lý sản phẩm",
    desc: "Thêm sản phẩm, biến thể, size, màu, giá nhập, giá bán và tồn kho.",
    to: "/products",
  },
  {
    title: "Lập phiếu nhập",
    desc: "Ghi nhận hàng nhập từ nhà cung cấp và tự động tăng tồn kho.",
    to: "/imports/new",
  },
  {
    title: "Tạo hóa đơn bán",
    desc: "Bán hàng, trừ tồn kho, lưu lịch sử giao dịch và doanh thu.",
    to: "/sales/new",
  },
  {
    title: "Báo cáo",
    desc: "Xuất Excel bán hàng, nhập hàng, tồn kho và báo cáo Word theo tháng.",
    to: "/",
  },
];

export default function HomePage() {
  return (
    <AppLayout
      title="Trang chủ"
      subtitle="Các chức năng chính của hệ thống quản lý đại lý."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {card.desc}
            </p>
            <span className="mt-5 inline-block text-sm font-semibold text-slate-900">
              Đi tới →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Gợi ý sử dụng</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Step number="1" title="Tạo sản phẩm" />
          <Step number="2" title="Nhập hàng để có tồn kho" />
          <Step number="3" title="Bán hàng và xuất báo cáo" />
        </div>
      </div>
    </AppLayout>
  );
}

function Step({ number, title }: { number: string; title: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
        {number}
      </div>
      <p className="font-semibold text-slate-800">{title}</p>
    </div>
  );
}