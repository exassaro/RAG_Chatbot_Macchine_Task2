import { FileX, FileText, Trash2, HardDrive, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function DocumentList({ documents, onDelete, isLoading }) {
  const [docToDelete, setDocToDelete] = useState(null);

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
            <div className="w-10 h-10 rounded-lg bg-[#DBE5DD]/50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#DBE5DD] transition-colors">
              <FileText className="w-5 h-5 text-[#1BC237]" />
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
            onClick={() => setDocToDelete(doc.name)}
            className="flex-shrink-0 p-2 text-[#9A9A9A] hover:text-[#1A1A1A] hover:bg-[#EBEDEC] rounded-lg transition-colors ml-4 opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Delete document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Custom Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-[#FAFAFA] rounded-[24px] p-6 max-w-sm w-full shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-[#C1C2C1]/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-[16px] font-medium text-[#1A1A1A]">Delete Document</h3>
            </div>
            <p className="text-[14px] text-[#3A3A3A] mb-6 leading-relaxed break-words">
              Are you sure you want to delete <strong>{docToDelete}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 text-[13px] font-medium text-[#3A3A3A] hover:bg-[#EBEDEC] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onDelete(docToDelete);
                  setDocToDelete(null);
                }}
                className="px-4 py-2 text-[13px] font-medium text-white bg-[#1BC237] hover:brightness-110 rounded-xl shadow-sm shadow-[#DBE5DD] transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
