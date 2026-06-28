import SourceBadge from "./SourceBadge";
import { Bot, User } from "lucide-react";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <span className="typing-dot w-2 h-2 bg-indigo-400 rounded-full" />
      <span className="typing-dot w-2 h-2 bg-indigo-400 rounded-full" />
      <span className="typing-dot w-2 h-2 bg-indigo-400 rounded-full" />
    </div>
  );
}

export default function MessageBubble({ role, content, sources = [], isLoading = false }) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full group animate-fade-in-up ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Bot className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`
              relative px-5 py-3.5 text-[15px] leading-relaxed shadow-sm
              ${isUser 
                ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm" 
                : "bg-white text-slate-700 rounded-2xl rounded-tl-sm border border-slate-100"
              }
            `}
          >
            {isLoading ? (
              <TypingIndicator />
            ) : (
              <div className="whitespace-pre-wrap break-words">{content}</div>
            )}
          </div>

          {/* Sources Section */}
          {!isUser && sources.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                Sources
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sources.map((src, idx) => (
                  <SourceBadge key={idx} filename={src} />
                ))}
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
