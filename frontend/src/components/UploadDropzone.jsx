import { useState, useRef } from "react";
import { UploadCloud, FileUp } from "lucide-react";

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

export default function UploadDropzone({ onFileSelect, isUploading }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!validateFile(file)) {
      alert("Only PDF and DOCX files are supported");
      return;
    }
    onFileSelect(file);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) {
      alert("Only PDF and DOCX files are supported");
      e.target.value = "";
      return;
    }
    onFileSelect(file);
    e.target.value = "";
  };

  return (
    <div
      onClick={() => !isUploading && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative overflow-hidden group flex flex-col items-center justify-center gap-4
        border-2 border-dashed rounded-2xl p-8 text-center
        cursor-pointer transition-all duration-300
        ${isDragging
          ? "border-indigo-500 bg-indigo-50/50 scale-[1.02] shadow-inner"
          : "border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-white hover:shadow-sm"
        }
        ${isUploading ? "opacity-60 cursor-not-allowed pointer-events-none grayscale-[0.2]" : ""}
      `}
    >
      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
        ${isDragging ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110" : "bg-white text-indigo-500 shadow-sm border border-slate-100 group-hover:scale-105 group-hover:shadow-md"}
      `}>
        {isDragging ? <FileUp className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
      </div>

      <div className="relative z-10">
        <p className={`text-sm font-semibold transition-colors ${isDragging ? "text-indigo-700" : "text-slate-700"}`}>
          Drag & drop document here
        </p>
        <p className="text-xs text-slate-400 mt-1.5">or click to browse from computer</p>
      </div>

      <div className="flex items-center gap-2 mt-2 relative z-10">
        <span className="text-[10px] font-bold tracking-wider text-slate-500 bg-white border border-slate-200 rounded-md px-2 py-1 shadow-sm">
          PDF
        </span>
        <span className="text-[10px] font-bold tracking-wider text-slate-500 bg-white border border-slate-200 rounded-md px-2 py-1 shadow-sm">
          DOCX
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
