import { FileX, FileText, Trash2, HardDrive } from "lucide-react";

export default function DocumentList({ documents, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-40" />
                <div className="h-3 bg-slate-100 rounded w-16" />
              </div>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
          <FileX className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No documents yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
          Upload your first PDF or DOCX to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pr-1 pb-4">
      {documents.map((doc) => (
        <div
          key={doc.name}
          className="group flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-700 truncate" title={doc.name}>
                {doc.name}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <HardDrive className="w-3 h-3" /> {doc.size_kb} KB
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[11px] font-medium text-slate-400">
                  {new Date(doc.uploaded_at).toLocaleDateString(undefined, {
                    month: "short", day: "numeric"
                  })}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${doc.name}?`)) {
                onDelete(doc.name);
              }
            }}
            className="flex-shrink-0 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-4 opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
