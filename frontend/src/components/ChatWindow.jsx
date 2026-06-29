import { useState, useRef, useEffect } from "react";
import { Paperclip, X, Zap, Bot, ArrowRightToLine } from "lucide-react";
import { sendMessage } from "../services/api";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";
import UploadPanel from "./UploadPanel";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "bot",
  content: "Hello! I'm your RAG Knowledge Assistant. Ask me anything about your uploaded documents, and I'll find the answers for you.",
  sources: [],
  isLoading: false,
};

export default function ChatWindow() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState(null);
  
  // Start with panel open on desktop, closed on mobile
  const [showUploadPanel, setShowUploadPanel] = useState(
    typeof window !== "undefined" && window.innerWidth >= 1024
  );
  
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const cleanup = () => {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      // navigator.sendBeacon sends a POST request
      const blob = new Blob([], { type: "application/json" });
      navigator.sendBeacon(`${baseUrl}/api/session/cleanup`, blob);
      
      // Since sendBeacon doesn't easily support custom headers like x-session-id,
      // wait, sendBeacon sends data, but we can't set headers easily. 
      // Actually fetch with keepalive is better for sending headers.
      fetch(`${baseUrl}/api/session/cleanup`, {
        method: 'POST',
        headers: { 'x-session-id': sessionId },
        keepalive: true
      }).catch(() => {});
    };

    window.addEventListener("beforeunload", cleanup);
    return () => {
      window.removeEventListener("beforeunload", cleanup);
    };
  }, [sessionId]);

  const handleSend = async (question) => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      sources: [],
      isLoading: false,
    };
    const loadingMessage = {
      id: "loading",
      role: "bot",
      content: "",
      sources: [],
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const result = await sendMessage(trimmed, sessionId);
      const botMessage = {
        id: Date.now() + 1,
        role: "bot",
        content: result.answer,
        sources: result.sources || [],
        isLoading: false,
      };
      setMessages((prev) =>
        prev.map((msg) => (msg.id === "loading" ? botMessage : msg))
      );
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        role: "bot",
        content: "I encountered an issue analyzing the documents. Please try again.",
        sources: [],
        isLoading: false,
      };
      setMessages((prev) =>
        prev.map((msg) => (msg.id === "loading" ? errorMessage : msg))
      );
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#FAFAFA] relative">
      
      {/* Left Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10 bg-[#FAFAFA] overflow-hidden">
        
        {/* Premium Header */}
        <header className="flex-shrink-0 flex items-center justify-between py-3 px-4 lg:px-8 bg-[#FAFAFA] z-20 sticky top-0">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="AI Assist" className="w-7 h-7 object-contain" />
            <h1 className="text-[16px] font-medium text-[#1A1A1A]">AI Assist</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadPanel(!showUploadPanel)}
              className="text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors"
              title="Toggle documents"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Suggested Prompt Chips */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 py-4 px-4 lg:px-8">
            {["Summarize the latest document", "What are the key takeaways?", "Find action items"].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="px-[18px] py-[8px] text-[13px] text-[#3A3A3A] bg-[#FAFAFA] border-[1.5px] border-[#C1C2C1] rounded-full hover:border-[#1BC237] hover:bg-[#DBE5DD] transition-all duration-200"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="px-5 py-3 bg-rose-50 border-b border-rose-100 flex items-center justify-between flex-shrink-0">
            <p className="text-sm text-rose-600 font-medium">{error}</p>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto py-4 px-4 lg:px-8 space-y-6 scroll-smooth bg-[#FAFAFA]">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              sources={msg.sources}
              isLoading={msg.isLoading}
            />
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 bg-[#FAFAFA] pt-4 pb-6 px-4 lg:px-8">
          <InputBar onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>

      {/* Right Upload Panel (Responsive Slide-over / Side panel) */}
      <div 
        className={`
          absolute lg:relative right-0 top-0 h-full bg-[#FAFAFA] z-30
          border-l border-[#C1C2C1] shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] lg:shadow-none
          transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) overflow-hidden
          ${showUploadPanel ? 'w-full sm:w-96 translate-x-0' : 'w-full sm:w-96 translate-x-full lg:w-0 lg:translate-x-0'}
        `}
      >
        <div className="w-full sm:w-96 h-full flex flex-col">
          {/* Mobile close button inside panel header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="text-md font-semibold text-slate-800">Documents</h2>
            <button onClick={() => setShowUploadPanel(false)} className="p-2 bg-slate-100 rounded-full text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <UploadPanel sessionId={sessionId} />
          </div>
        </div>
      </div>
      
      {/* Mobile backdrop */}
      {showUploadPanel && (
        <div 
          className="lg:hidden absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-20 transition-opacity"
          onClick={() => setShowUploadPanel(false)}
        />
      )}
      
    </div>
  );
}
