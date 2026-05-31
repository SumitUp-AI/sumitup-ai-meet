import { Send, Bot, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../utils/apiHeaders";

interface ChatMessage {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: string;
  isLoading?: boolean;
}

const AIChatPage: React.FC = () => {
  const [message, setMessage] = useState("");
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI assistant. I can help you analyze your meetings, extract insights, and answer questions about your meeting data. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => crypto.randomUUID?.() || Date.now().toString());

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  

  const sendMessageToAPI = async (userMessage: string) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
    
    try {
      
      if (!user || !token) {
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: getAuthHeaders(token, user?.tenant_id),
        body: JSON.stringify({
          query: userMessage,
          session_id: sessionId, // Optional: for tracking conversation
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get response");
      }

      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");

    // Add user message to chat
    const userChatMessage: ChatMessage = {
      id: messages.length + 1,
      type: "user",
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userChatMessage]);

    // Add loading message
    const loadingMessageId = messages.length + 2;
    const loadingMessage: ChatMessage = {
      id: loadingMessageId,
      type: "bot",
      content: "Thinking...",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);
    setIsLoading(true);

    try {
      // Call API
      const aiResponse = await sendMessageToAPI(userMessage);

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                content: aiResponse,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      // Replace loading message with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                content: "Sorry, I encountered an error. Please try again.",
                isLoading: false,
              }
            : msg
        )
      );
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          AI Chat Assistant
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Ask questions about your meetings and get AI-powered insights
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col min-h-0">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                SumItUp AI Assistant
              </h3>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-3 max-w-3xl ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.type === "user" ? "bg-cyan-600" : "bg-gray-100"
                  }`}
                >
                  {msg.type === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    msg.type === "user"
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  } ${msg.isLoading ? "opacity-70" : ""}`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      msg.type === "user" ? "text-cyan-100" : "text-gray-500"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your meetings..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;