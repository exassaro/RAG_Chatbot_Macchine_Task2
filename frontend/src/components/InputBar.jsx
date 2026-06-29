import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";

export default function InputBar({ onSend, isLoading }) {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 && !isLoading;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2">
      <div 
        className={`
          relative flex items-center gap-3 bg-[#EBEDEC] rounded-[14px] px-4 py-3 transition-all duration-200
          ${isFocused ? "ring-2 ring-[#6ED987] shadow-sm" : ""}
        `}
      >
        
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask a question about your documents..."
          rows={1}
          className="flex-1 max-h-[200px] resize-none bg-transparent py-1 text-[14px] text-[#1A1A1A] placeholder-[#9A9A9A] focus:outline-none"
        />
        
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`
            flex-shrink-0 p-2.5 rounded-xl flex items-center justify-center transition-all duration-200
            ${canSend 
              ? "bg-[#1BC237] text-white shadow-md shadow-[#DBE5DD] hover:brightness-110 hover:scale-105 active:scale-95" 
              : "bg-[#C1C2C1] text-white cursor-not-allowed"}
          `}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 translate-x-[-1px] translate-y-[1px]" />
          )}
        </button>
      </div>
      
      <div className="flex justify-between items-center px-2">
        <span className="text-[11px] font-medium text-slate-400">
          Knowledge Assistant can make mistakes. Verify important information.
        </span>
        <span className="hidden sm:block text-[11px] font-medium text-slate-400">
          <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">Enter</kbd> to send, <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">Shift</kbd> + <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">Enter</kbd> for newline
        </span>
      </div>
    </div>
  );
}
