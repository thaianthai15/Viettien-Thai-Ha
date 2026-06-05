import axiosClient from "../../api/axiosClient";

export type AIChatResponse = {
  answer: string;
  conversation_id: number;
};

export const sendAIMessage = async (
  message: string
): Promise<AIChatResponse> => {
  const response = await axiosClient.post("/ai/chat/", {
    message,
  });

  return response.data;
};