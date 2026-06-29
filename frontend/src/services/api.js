import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function sendMessage(question, sessionId = null) {
  try {
    const response = await api.post("/api/chat", {
      question,
      session_id: sessionId,
    }, {
      timeout: 120000, // 2 minutes — LLM + retrieval can take time
    });
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timed out. The server may be busy — please try again.");
    }
    if (error.response) {
      throw new Error(
        error.response.data.detail || "Server returned an error"
      );
    }
    throw new Error("Failed to get response from server. Is the backend running?");
  }
}

export async function checkHealth() {
  try {
    const response = await api.get("/api/health");
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.detail || "Health check failed"
      );
    }
    throw new Error("Failed to reach the server");
  }
}

export async function uploadDocument(file, sessionId, onProgress = () => {}) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/api/upload", formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        "x-session-id": sessionId
      },
      timeout: 300000, // 5 minutes — embedding + FAISS index build can be slow
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percent);
      },
    });
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error("Upload timed out. The file may be too large or the server is busy.");
    }
    if (error.response) {
      throw new Error(
        error.response.data.detail || "Upload failed"
      );
    }
    throw new Error("Failed to upload document. Is the backend running?");
  }
}

export async function getDocuments(sessionId) {
  try {
    const response = await api.get("/api/documents", {
      headers: { "x-session-id": sessionId }
    });
    return response.data.documents;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.detail || "Failed to fetch documents"
      );
    }
    throw new Error("Failed to reach the server");
  }
}

export async function deleteDocument(filename, sessionId) {
  try {
    const response = await api.delete(`/api/documents/${encodeURIComponent(filename)}`, {
      headers: { "x-session-id": sessionId }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.detail || "Delete failed"
      );
    }
    throw new Error("Failed to delete document");
  }
}
