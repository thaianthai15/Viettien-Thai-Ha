import axiosClient from "../../api/axiosClient";

export type AIChatResponse = {
  answer: string;
  conversation_id: number;
};

export type AIImportSuggestion = {
  product_variant_id: number;
  product_code: string;
  product_name: string;
  category_name: string;
  size: string;
  color: string;
  current_stock: number;
  low_stock_threshold: number;
  suggested_quantity: number;
  reason: string;
};

export type AIAnomaly = {
  type: string;
  level: "INFO" | "MEDIUM" | "HIGH";
  title: string;
  message: string;
};

type ImportSuggestionResponse = {
  count: number;
  suggestions: AIImportSuggestion[];
};

type AnomalyResponse = {
  count: number;
  anomalies: AIAnomaly[];
};

export const sendAIMessage = async (
  message: string,
): Promise<AIChatResponse> => {
  const response = await axiosClient.post("/ai/chat/", {
    message,
  });

  return response.data;
};

export const getAIImportSuggestions = async (): Promise<
  AIImportSuggestion[]
> => {
  const response = await axiosClient.get<ImportSuggestionResponse>(
    "/ai/import-suggestions/",
  );

  return response.data.suggestions || [];
};

export const getAIAnomalies = async (): Promise<AIAnomaly[]> => {
  const response = await axiosClient.get<AnomalyResponse>("/ai/anomalies/");

  return response.data.anomalies || [];
};