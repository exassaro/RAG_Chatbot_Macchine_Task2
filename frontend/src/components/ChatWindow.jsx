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
    <div className="flex flex-col lg:flex-row h-full w-full bg-white relative">
      
      {/* Left Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10 bg-white">
        
        {/* Premium Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">Knowledge Assistant</h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold uppercase tracking-wider">
                  <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                  Groq + FAISS Active
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">Ask questions from your uploaded documents</p>
            </div>
          </div>
          <button
            onClick={() => setShowUploadPanel(!showUploadPanel)}
            className={`p-2.5 rounded-full transition-all duration-200 flex-shrink-0 ${
              showUploadPanel 
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            }`}
            title={showUploadPanel ? "Close document manager" : "Open document manager"}
          >
            {showUploadPanel ? <ArrowRightToLine className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
          </button>
        </header>

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
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 scroll-smooth bg-slate-50/50">
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
        <div className="flex-shrink-0 bg-white border-t border-slate-100 p-4 sm:px-6">
          <InputBar onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>

      {/* Right Upload Panel (Responsive Slide-over / Side panel) */}
      <div 
        className={`
          absolute lg:relative right-0 top-0 h-full bg-white z-30
          border-l border-slate-200 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] lg:shadow-none
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
            <UploadPanel />
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
