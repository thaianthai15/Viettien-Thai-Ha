import axiosClient from "../../api/axiosClient";

type LoginPayload = {
  username: string;
  password: string;
};

type LoginResponse = {
  access: string;
  refresh: string;
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await axiosClient.post("/auth/login/", payload);
  return response.data;
};