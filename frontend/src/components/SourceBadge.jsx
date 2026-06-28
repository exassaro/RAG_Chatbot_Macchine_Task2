import { FileText } from "lucide-react";

export default function SourceBadge({ filename }) {
  return (
    <span 
      className="inline-flex items-center gap-1.5 bg-white text-slate-600 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide max-w-[200px] border border-slate-200 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md cursor-default"
      title={filename}
    >
      <FileText className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
      <span className="truncate">{filename}</span>
    </span>
  );
}
