import axiosClient from "../../api/axiosClient";

export type RegisterPayload = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  agency_name: string;
  agency_address: string;
  password: string;
  password_confirm: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access: string;
  refresh: string;
};

export type UserMe = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  agency_name: string;
  agency_address: string;
  role: "OWNER" | "STAFF";
  is_staff: boolean;
  is_superuser: boolean;
};

export const register = async (payload: RegisterPayload) => {
  const response = await axiosClient.post("/auth/register/", payload);
  return response.data;
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await axiosClient.post("/auth/login/", payload);
  return response.data;
};

export const getMe = async (): Promise<UserMe> => {
  const response = await axiosClient.get("/auth/me/");
  return response.data;
};