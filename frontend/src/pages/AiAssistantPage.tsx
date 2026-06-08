import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAIAnomalies,
  getAIImportSuggestions,
  sendAIMessage,
  type AIAnomaly,
  type AIImportSuggestion,
} from "../features/ai/aiApi";

type ChatMessage = {
  role: "USER" | "ASSISTANT";
  content: string;
};

const suggestedQuestions = [
  "Hôm nay doanh thu bao nhiêu?",
  "Tháng này bán được bao nhiêu?",
  "Sản phẩm nào sắp hết hàng?",
  "Mặt hàng nào bán chạy nhất?",
  "Nên nhập thêm hàng gì?",
  "Tồn kho hiện tại bao nhiêu?",
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ASSISTANT",
      content:
        "Xin chào! Mình là AI Assistant của đại lý Việt Tiến 👋\nBạn có thể hỏi mình về doanh thu, tồn kho, hàng sắp hết, sản phẩm bán chạy hoặc gợi ý nhập hàng.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [suggestions, setSuggestions] = useState<AIImportSuggestion[]>([]);
  const [anomalies, setAnomalies] = useState<AIAnomaly[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoadingInsights(true);

        const [suggestionData, anomalyData] = await Promise.all([
          getAIImportSuggestions(),
          getAIAnomalies(),
        ]);

        setSuggestions(suggestionData);
        setAnomalies(anomalyData);
      } catch (error: any) {
        console.error("AI insights error:", error);

        if (error.response?.status === 401) {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }

        setErrorMessage("Không thể tải dữ liệu gợi ý AI.");
      } finally {
        setIsLoadingInsights(false);
      }
    };

    fetchInsights();
  }, []);

  const handleSend = async (customMessage?: string) => {
    const message = customMessage || input;

    if (!message.trim()) return;

    try {
      setErrorMessage("");
      setIsSending(true);

      setMessages((prev) => [...prev, { role: "USER", content: message }]);

      setInput("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      const data = await sendAIMessage(message);

      setMessages((prev) => [
        ...prev,
        { role: "ASSISTANT", content: data.answer },
      ]);
    } catch (error: any) {
      console.error("AI chat error:", error);

      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      setErrorMessage("Không thể gửi câu hỏi tới AI Assistant.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const getAnomalyCardClass = (level: AIAnomaly["level"]) => {
    if (level === "HIGH") return "insight-item anomaly-high";
    if (level === "MEDIUM") return "insight-item anomaly-medium";
    return "insight-item anomaly-info";
  };

  const getAnomalyBadgeClass = (level: AIAnomaly["level"]) => {
    if (level === "HIGH") return "anomaly-badge badge-high";
    if (level === "MEDIUM") return "anomaly-badge badge-medium";
    return "anomaly-badge badge-info";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ai-page {
          min-height: 100vh;
          background: #f0f4f8;
          font-family: 'Be Vietnam Pro', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px 32px;
        }

        .ai-header {
          width: 100%;
          max-width: 780px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
        }

        .ai-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ai-avatar {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35);
          flex-shrink: 0;
        }

        .ai-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.4px;
          line-height: 1.2;
        }

        .ai-subtitle {
          font-size: 13px;
          color: #64748b;
          font-weight: 400;
          margin-top: 2px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          background: white;
          color: #475569;
          font-size: 13.5px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .back-btn:hover {
          border-color: #94a3b8;
          background: #f8fafc;
          color: #1e293b;
        }

        .insights-grid {
          width: 100%;
          max-width: 780px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 16px;
        }

        .insight-card {
          background: white;
          border-radius: 20px;
          padding: 16px;
          border: 1px solid rgba(226,232,240,0.9);
          box-shadow:
            0 1px 3px rgba(0,0,0,0.04),
            0 8px 24px rgba(15,23,42,0.06);
        }

        .insight-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .insight-title {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }

        .insight-desc {
          font-size: 12px;
          color: #64748b;
          margin-top: 3px;
          line-height: 1.45;
        }

        .insight-count {
          min-width: 30px;
          height: 26px;
          padding: 0 9px;
          border-radius: 999px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .insight-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .insight-item {
          border-radius: 14px;
          padding: 11px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .insight-item-title {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.4;
        }

        .insight-item-text {
          margin-top: 4px;
          font-size: 12.5px;
          color: #64748b;
          line-height: 1.55;
        }

        .insight-empty {
          font-size: 12.5px;
          color: #64748b;
          padding: 10px 0 2px;
        }

        .stock-danger {
          color: #dc2626;
          font-weight: 800;
        }

        .stock-strong {
          color: #0f172a;
          font-weight: 800;
        }

        .anomaly-high {
          background: #fef2f2;
          border-color: #fecaca;
        }

        .anomaly-medium {
          background: #fffbeb;
          border-color: #fde68a;
        }

        .anomaly-info {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .anomaly-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .anomaly-badge {
          flex-shrink: 0;
          border-radius: 999px;
          padding: 3px 8px;
          font-size: 10.5px;
          font-weight: 800;
        }

        .badge-high {
          background: #fee2e2;
          color: #b91c1c;
        }

        .badge-medium {
          background: #fef3c7;
          color: #b45309;
        }

        .badge-info {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .chat-card {
          width: 100%;
          max-width: 780px;
          background: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.06),
            0 8px 32px rgba(15,23,42,0.08),
            0 0 0 1px rgba(226,232,240,0.7);
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .chat-topbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border-bottom: 1px solid #f1f5f9;
          background: #fafcff;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.18);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.18); }
          50% { box-shadow: 0 0 0 5px rgba(34,197,94,0.08); }
        }

        .topbar-label {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
        }

        .topbar-badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 600;
          color: #6366f1;
          background: #eef2ff;
          padding: 3px 10px;
          border-radius: 20px;
        }

        .messages-area {
          flex: 1;
          min-height: 380px;
          max-height: 52vh;
          overflow-y: auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #f8fafc;
          scroll-behavior: smooth;
        }

        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

        .msg-row {
          display: flex;
          animation: msgIn 0.22s ease-out both;
        }

        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .msg-row.user { justify-content: flex-end; }
        .msg-row.assistant { justify-content: flex-start; }

        .msg-bubble-wrap {
          display: flex;
          flex-direction: column;
          max-width: 72%;
        }

        .msg-row.user .msg-bubble-wrap { align-items: flex-end; }
        .msg-row.assistant .msg-bubble-wrap { align-items: flex-start; }

        .msg-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14.5px;
          line-height: 1.65;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .msg-bubble.user {
          background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
          color: white;
          border-bottom-right-radius: 6px;
          box-shadow: 0 4px 14px rgba(79,70,229,0.25);
        }

        .msg-bubble.assistant {
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #e8edf3;
          border-bottom-left-radius: 6px;
          box-shadow: 0 2px 8px rgba(15,23,42,0.06);
        }

        .typing-row {
          display: flex;
          align-items: flex-start;
          animation: msgIn 0.22s ease-out both;
        }

        .typing-bubble {
          background: #ffffff;
          border: 1px solid #e8edf3;
          border-radius: 18px;
          border-bottom-left-radius: 6px;
          padding: 14px 18px;
          display: flex;
          gap: 5px;
          align-items: center;
          box-shadow: 0 2px 8px rgba(15,23,42,0.06);
        }

        .typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #94a3b8;
          animation: typingBounce 1.2s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); background: #94a3b8; }
          30% { transform: translateY(-5px); background: #6366f1; }
        }

        .input-area {
          padding: 16px 20px 20px;
          border-top: 1px solid #f1f5f9;
          background: white;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          color: #dc2626;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .suggestions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .suggestion-chip {
          padding: 6px 13px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .suggestion-chip:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1d4ed8;
          transform: translateY(-1px);
        }

        .input-row {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        .input-wrap {
          flex: 1;
          position: relative;
        }

        .chat-textarea {
          width: 100%;
          resize: none;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 12px 16px;
          font-size: 14.5px;
          font-family: inherit;
          color: #1e293b;
          line-height: 1.5;
          background: #f8fafc;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          outline: none;
          min-height: 48px;
          max-height: 120px;
          overflow-y: auto;
        }

        .chat-textarea:focus {
          border-color: #6366f1;
          background: white;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        .chat-textarea::placeholder { color: #94a3b8; }

        .send-btn {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          box-shadow: 0 4px 12px rgba(79,70,229,0.3);
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(79,70,229,0.4);
        }

        .send-btn:active:not(:disabled) { transform: translateY(0); }

        .send-btn:disabled {
          background: #e2e8f0;
          box-shadow: none;
          cursor: not-allowed;
        }

        .send-btn svg { transition: transform 0.15s; }
        .send-btn:hover:not(:disabled) svg { transform: translateX(1px) translateY(-1px); }

        @media (max-width: 780px) {
          .insights-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .ai-header { flex-wrap: wrap; }
          .ai-title { font-size: 17px; }
          .msg-bubble-wrap { max-width: 85%; }
          .suggestion-chip { font-size: 12px; padding: 5px 11px; }
        }
      `}</style>

      <div className="ai-page">
        <div className="ai-header">
          <div className="ai-header-left">
            <div className="ai-avatar">🤖</div>

            <div>
              <div className="ai-title">AI Assistant</div>

              <div className="ai-subtitle">
                Hỏi về doanh thu, tồn kho, nhập hàng và bán hàng
              </div>
            </div>
          </div>

          <Link to="/" className="back-btn">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Về Dashboard
          </Link>
        </div>

        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-head">
              <div>
                <div className="insight-title">Gợi ý nhập hàng</div>
                <div className="insight-desc">
                  Các mặt hàng nên nhập thêm dựa trên tồn kho thấp.
                </div>
              </div>

              <div className="insight-count">{suggestions.length}</div>
            </div>

            <div className="insight-list">
              {isLoadingInsights && (
                <div className="insight-empty">Đang tải gợi ý...</div>
              )}

              {!isLoadingInsights &&
                suggestions.slice(0, 3).map((item) => (
                  <div key={item.product_variant_id} className="insight-item">
                    <div className="insight-item-title">
                      {item.product_code} - {item.product_name}
                    </div>

                    <div className="insight-item-text">
                      Size {item.size}, màu {item.color}. Còn{" "}
                      <span className="stock-danger">{item.current_stock}</span>,
                      nên nhập khoảng{" "}
                      <span className="stock-strong">
                        {item.suggested_quantity}
                      </span>{" "}
                      sản phẩm.
                    </div>
                  </div>
                ))}

              {!isLoadingInsights && suggestions.length === 0 && (
                <div className="insight-empty">
                  Chưa có mặt hàng nào cần nhập gấp.
                </div>
              )}
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-head">
              <div>
                <div className="insight-title">Cảnh báo bất thường</div>
                <div className="insight-desc">
                  Các vấn đề được phát hiện từ dữ liệu bán hàng và tồn kho.
                </div>
              </div>

              <div className="insight-count">{anomalies.length}</div>
            </div>

            <div className="insight-list">
              {isLoadingInsights && (
                <div className="insight-empty">Đang kiểm tra dữ liệu...</div>
              )}

              {!isLoadingInsights &&
                anomalies.slice(0, 3).map((item, index) => (
                  <div
                    key={`${item.type}-${index}`}
                    className={getAnomalyCardClass(item.level)}
                  >
                    <div className="anomaly-title-row">
                      <div className="insight-item-title">{item.title}</div>
                      <span className={getAnomalyBadgeClass(item.level)}>
                        {item.level}
                      </span>
                    </div>

                    <div className="insight-item-text">{item.message}</div>
                  </div>
                ))}

              {!isLoadingInsights && anomalies.length === 0 && (
                <div className="insight-empty">Chưa phát hiện bất thường.</div>
              )}
            </div>
          </div>
        </div>

        <div className="chat-card">
          <div className="chat-topbar">
            <span className="status-dot" />
            <span className="topbar-label">AI đang sẵn sàng hỗ trợ</span>
            <span className="topbar-badge">Rule-based AI</span>
          </div>

          <div className="messages-area">
            {messages.map((message, index) => {
              const isUser = message.role === "USER";

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`msg-row ${isUser ? "user" : "assistant"}`}
                >
                  <div className="msg-bubble-wrap">
                    <div className={`msg-bubble ${isUser ? "user" : "assistant"}`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="typing-row">
                <div className="typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            {errorMessage && (
              <div className="error-banner">
                <span>⚠️</span>
                {errorMessage}
              </div>
            )}

            <div className="suggestions">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => handleSend(question)}
                  disabled={isSending}
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="input-row">
              <div className="input-wrap">
                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  placeholder="Nhập câu hỏi, ví dụ: Hôm nay doanh thu bao nhiêu?"
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
              </div>

              <button
                type="button"
                className="send-btn"
                onClick={() => handleSend()}
                disabled={isSending || !input.trim()}
                aria-label="Gửi câu hỏi"
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isSending || !input.trim() ? "#94a3b8" : "white"}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}