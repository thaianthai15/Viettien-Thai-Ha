import axiosClient from "../../api/axiosClient";

export type Category = {
  id: number;
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

export const getProducts = async (): Promise<Product[]> => {
  const response = await axiosClient.get<PaginatedResponse<Product> | Product[]>(
    "/inventory/products/"
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