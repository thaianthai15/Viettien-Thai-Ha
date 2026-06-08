import axiosClient from "../../api/axiosClient";

export type Category = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
};

export type CreateCategoryPayload = {
  name: string;
  description: string;
  is_active: boolean;
};

export type ProductVariant = {
  id: number;
  product: number;
  product_name: string;
  product_code: string;
  size: string;
  color: string;
  barcode: string;
  import_price: string;
  sale_price: string;
  current_stock: number;
  low_stock_threshold: number;
  is_active: boolean;
};

export type Product = {
  id: number;
  category: number;
  category_name: string;
  code: string;
  name: string;
  description: string;
  image?: string | null;
  is_active: boolean;
  created_by?: number;
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
};

export type CreateProductPayload = {
  category: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
};

export type ProductFilters = {
  search?: string;
  category?: string;
  size?: string;
  color?: string;
};

export type CreateProductVariantPayload = {
  product: number;
  size: string;
  color: string;
  barcode: string;
  import_price: number;
  sale_price: number;
  current_stock: number;
  low_stock_threshold: number;
  is_active: boolean;
};

export type Supplier = {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  is_active: boolean;
};

export type ImportReceiptItem = {
  id: number;
  product_variant: number;
  product_variant_name: string;
  product_code: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  import_price: string;
  subtotal: string;
  created_at: string;
};

export type ImportReceipt = {
  id: number;
  receipt_code: string;
  supplier: number;
  supplier_name: string;
  import_date: string;
  note: string;
  total_amount: string;
  created_by: number;
  items: ImportReceiptItem[];
  created_at: string;
  updated_at: string;
};

export type CreateSupplierPayload = {
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  is_active: boolean;
};

export type CreateImportReceiptPayload = {
  receipt_code: string;
  supplier: number;
  import_date: string;
  note: string;
  items: {
    product_variant: number;
    quantity: number;
    import_price: number;
  }[];
};

export type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
};

export type SaleInvoiceItem = {
  id: number;
  product_variant: number;
  product_code: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  sale_price: string;
  subtotal: string;
  created_at: string;
};

export type SaleInvoice = {
  id: number;
  invoice_code: string;
  customer: number | null;
  customer_name: string;
  customer_phone: string;
  sale_date: string;
  note: string;
  total_amount: string;
  discount_amount: string;
  final_amount: string;
  payment_method: "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER";
  created_by: number;
  items: SaleInvoiceItem[];
  created_at: string;
  updated_at: string;
};

export type CreateCustomerPayload = {
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
};

export type DashboardSummary = {
  today: {
    revenue: string | number;
    invoice_count: number;
    sold_quantity: number;
  };
  inventory: {
    total_products: number;
    total_variants: number;
    total_stock: number;
    low_stock_count: number;
  };
  low_stock_variants: {
    id: number;
    product_code: string;
    product_name: string;
    category_name: string;
    size: string;
    color: string;
    current_stock: number;
    low_stock_threshold: number;
  }[];
  top_products: {
    product_code: string;
    product_name: string;
    total_quantity: number;
    total_revenue: string | number;
  }[];
  revenue_chart: {
    date: string;
    revenue: string | number;
    invoice_count: number;
  }[];
};

export type CreateSaleInvoicePayload = {
  invoice_code: string;
  customer: number | null;
  sale_date: string;
  note: string;
  discount_amount: number;
  payment_method: "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER";
  items: {
    product_variant: number;
    quantity: number;
    sale_price: number;
  }[];
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosClient.get("/inventory/categories/");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results;
};

export const createCategory = async (
  payload: CreateCategoryPayload
): Promise<Category> => {
  const response = await axiosClient.post("/inventory/categories/", payload);
  return response.data;
};

export const updateCategory = async (
  id: number,
  payload: CreateCategoryPayload
): Promise<Category> => {
  const response = await axiosClient.put(`/inventory/categories/${id}/`, payload);
  return response.data;
};

export const deleteCategory = async (id: number) => {
  const response = await axiosClient.delete(`/inventory/categories/${id}/`);
  return response.data;
};

export const getProducts = async (
  filters?: ProductFilters
): Promise<Product[]> => {
  const response = await axiosClient.get<PaginatedResponse<Product> | Product[]>(
    "/inventory/products/",
    {
      params: {
        search: filters?.search || undefined,
        category: filters?.category || undefined,
        size: filters?.size || undefined,
        color: filters?.color || undefined,
      },
    }
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results;
};

export const createProduct = async (
  payload: CreateProductPayload
): Promise<Product> => {
  const response = await axiosClient.post("/inventory/products/", payload);
  return response.data;
};

export const createProductVariant = async (
  payload: CreateProductVariantPayload
): Promise<ProductVariant> => {
  const response = await axiosClient.post(
    "/inventory/product-variants/",
    payload
  );
  return response.data;
};

export const getSuppliers = async (): Promise<Supplier[]> => {
  const response = await axiosClient.get<PaginatedResponse<Supplier> | Supplier[]>(
    "/inventory/suppliers/"
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results;
};

export const createSupplier = async (
  payload: CreateSupplierPayload
): Promise<Supplier> => {
  const response = await axiosClient.post("/inventory/suppliers/", payload);
  return response.data;
};

export const getProductVariants = async (): Promise<ProductVariant[]> => {
  const response = await axiosClient.get<
    PaginatedResponse<ProductVariant> | ProductVariant[]
  >("/inventory/product-variants/");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results;
};

export const getImportReceipts = async (): Promise<ImportReceipt[]> => {
  const response = await axiosClient.get<
    PaginatedResponse<ImportReceipt> | ImportReceipt[]
  >("/inventory/import-receipts/");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results;
};

export const createImportReceipt = async (
  payload: CreateImportReceiptPayload
): Promise<ImportReceipt> => {
  const response = await axiosClient.post(
    "/inventory/import-receipts/",
    payload
  );

  return response.data;
};

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await axiosClient.get<PaginatedResponse<Customer> | Customer[]>(
    "/inventory/customers/"
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results;
};

export const createCustomer = async (
  payload: CreateCustomerPayload
): Promise<Customer> => {
  const response = await axiosClient.post("/inventory/customers/", payload);
  return response.data;
};

export const getSaleInvoices = async (): Promise<SaleInvoice[]> => {
  const response = await axiosClient.get<
    PaginatedResponse<SaleInvoice> | SaleInvoice[]
  >("/inventory/sale-invoices/");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results;
};

export const createSaleInvoice = async (
  payload: CreateSaleInvoicePayload
): Promise<SaleInvoice> => {
  const response = await axiosClient.post("/inventory/sale-invoices/", payload);
  return response.data;
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await axiosClient.get("/inventory/dashboard/summary/");
  return response.data;
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadSalesExcel = async () => {
  const response = await axiosClient.get("/inventory/exports/sales/", {
    responseType: "blob",
  });

  downloadFile(response.data, "bao_cao_ban_hang.xlsx");
};

export const downloadImportsExcel = async () => {
  const response = await axiosClient.get("/inventory/exports/imports/", {
    responseType: "blob",
  });

  downloadFile(response.data, "bao_cao_nhap_hang.xlsx");
};

export const downloadInventoryExcel = async () => {
  const response = await axiosClient.get("/inventory/exports/inventory/", {
    responseType: "blob",
  });

  downloadFile(response.data, "bao_cao_ton_kho.xlsx");
};

export const downloadMonthlyWord = async () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const response = await axiosClient.get("/inventory/exports/monthly-word/", {
    responseType: "blob",
    params: {
      month,
      year,
    },
  });

  downloadFile(response.data, `bao_cao_thang_${month}_${year}.docx`);
};