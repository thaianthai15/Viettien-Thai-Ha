import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProductListPage from "./pages/ProductListPage";
import ProductFormPage from "./pages/ProductFormPage";
import ImportReceiptListPage from "./pages/ImportReceiptListPage";
import ImportReceiptFormPage from "./pages/ImportReceiptFormPage";
import SaleInvoiceListPage from "./pages/SaleInvoiceListPage";
import SaleInvoiceFormPage from "./pages/SaleInvoiceFormPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AiAssistantPage from "./pages/AiAssistantPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/imports" element={<ImportReceiptListPage />} />
          <Route path="/imports/new" element={<ImportReceiptFormPage />} />
          <Route path="/sales" element={<SaleInvoiceListPage />} />
          <Route path="/sales/new" element={<SaleInvoiceFormPage />} />
          <Route path="/ai" element={<AiAssistantPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;