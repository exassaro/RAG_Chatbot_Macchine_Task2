import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Library, Loader2 } from "lucide-react";
import { uploadDocument, getDocuments, deleteDocument } from "../services/api";
import UploadDropzone from "./UploadDropzone";
import DocumentList from "./DocumentList";

export default function UploadPanel({ sessionId }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await getDocuments(sessionId);
      setDocuments(docs);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch documents.");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [sessionId]);

  const handleFileSelect = async (file) => {
    setIsUploading(true);
    setIsProcessing(false);
    setUploadProgress(0);
    setError(null);
    setSuccessMessage(null);

    try {
      await uploadDocument(file, sessionId, (pct) => {
        setUploadProgress(pct);
        // When file bytes are fully sent, switch to processing state
        if (pct >= 100) {
          setIsProcessing(true);
        }
      });
      setIsProcessing(false);
      setSuccessMessage(`'${file.name}' indexed successfully!`);
      await fetchDocuments();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDelete = async (filename) => {
    try {
      await deleteDocument(filename, sessionId);
      await fetchDocuments();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  const isBusy = isUploading || isProcessing;

  return (
    <div className="p-6 space-y-8">
      {/* Upload Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Add Documents</h2>
          <p className="text-sm text-slate-500 font-medium">Upload files to update the knowledge base.</p>
        </div>

        <div className="space-y-4">
          <UploadDropzone onFileSelect={handleFileSelect} isUploading={isBusy} />

          {/* Upload Progress */}
          {isBusy && (
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-fade-in-up">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-[#1BC237]" />
                      Indexing document...
                    </>
                  ) : (
                    "Uploading"
                  )}
                </span>
                {!isProcessing && (
                  <span className="text-xs font-bold text-[#1BC237]">{uploadProgress}%</span>
                )}
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                {isProcessing ? (
                  <div className="bg-[#1BC237] h-1.5 rounded-full w-full animate-pulse" />
                ) : (
                  <div
                    className="bg-[#1BC237] h-1.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                )}
              </div>
              {isProcessing && (
                <p className="text-[11px] text-slate-500 mt-2 font-medium">
                  Parsing and embedding document — this may take a moment...
                </p>
              )}
            </div>
          )}

          {/* Feedback Messages */}
          {successMessage && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 animate-fade-in-up">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800 font-medium leading-relaxed">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-xl p-4 animate-fade-in-up">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-800 font-medium leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <hr className="border-slate-100" />

      {/* Document List Section */}
      <section className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Library className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700">Knowledge Base</h3>
          </div>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">
            {documents?.length || 0} files
          </span>
        </div>
        
        <DocumentList
          documents={documents}
          onDelete={handleDelete}
          isLoading={isLoadingDocs}
        />
      </section>
    </div>
  );
}
