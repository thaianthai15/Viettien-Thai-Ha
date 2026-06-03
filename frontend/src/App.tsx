import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProductListPage from "./pages/ProductListPage";
import ProductFormPage from "./pages/ProductFormPage";
import ImportReceiptFormPage from "./pages/ImportReceiptFormPage";
import ImportReceiptListPage from "./pages/ImportReceiptListPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import SaleInvoiceListPage from "./pages/SaleInvoiceListPage";
import SaleInvoiceFormPage from "./pages/SaleInvoiceFormPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/imports" element={<ImportReceiptListPage />} />
          <Route path="/imports/new" element={<ImportReceiptFormPage />} />
          <Route path="/sales" element={<SaleInvoiceListPage />} />
          <Route path="/sales/new" element={<SaleInvoiceFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;