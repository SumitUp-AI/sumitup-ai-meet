import { Send, Bot, User } from "lucide-react";
import { useState } from "react";

const AIChatPage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot" as const,
      content:
        "Hello! I'm your AI assistant. I can help you analyze your meetings, extract insights, and answer questions about your meeting data. How can I help you today?",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      type: "user" as const,
      content:
        "Can you summarize the key decisions from yesterday's product meeting?",
      timestamp: "10:32 AM",
    },
    {
      id: 3,
      type: "bot" as const,
      content:
        "Based on yesterday's Q3 Product Roadmap meeting, here are the key decisions:\n\n1. **Feature Prioritization**: Decided to prioritize the mobile app redesign over the web dashboard updates\n2. **Timeline**: Set Q4 2024 as the target for the new user onboarding flow\n3. **Resources**: Allocated 2 additional developers to the core platform team\n4. **Budget**: Approved $50K additional budget for user research\n\nWould you like me to dive deeper into any of these decisions?",
      timestamp: "10:32 AM",
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: "user" as const,
        content: message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setMessage("");

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          type: "bot" as const,
          content:
            "I understand your question. Let me analyze your meeting data and provide you with relevant insights...",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
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
      <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
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
                    msg.type === "user" ? "bg-blue-600" : "bg-gray-100"
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
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.type === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about your meetings..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
