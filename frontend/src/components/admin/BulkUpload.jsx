import React, { useState } from "react";
import API from "../../utils/api.js";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Loader from "../common/Loader.jsx";
import toast from "react-hot-toast";

const BulkUpload = ({ quizId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        setMessage(null);
      } else {
        setFile(null);
        toast.error("Please select a valid CSV file (.csv)");
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a CSV file first");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setMessage(null);
    try {
      const response = await API.post(
        `/quizzes/${quizId}/bulk-upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.data.success) {
        setFile(null);{/* Clear file input manually */}document.getElementById("csv-file-input").value = "";
        toast.success(
          response.data.message || "Questions imported successfully!",
        );
        if (onUploadSuccess) {
          onUploadSuccess(response.data.quiz);
        }
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      toast.error(
        error.response?.data?.message ||
          "Error uploading file. Please check column formats.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant shadow-sm p-8 shadow-2xl">
      <h3 className="font-display text-lg font-bold text-slate-800">
        Bulk Question Import
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
        Upload a comma-separated values (.csv) spreadsheet to quickly import
        multiple MCQ questions.
      </p>

      {/* CSV Guidance requirements */}
      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <FileText className="h-4 w-4 text-slate-400" />
          CSV Header Template Format:
        </h4>
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-500 overflow-x-auto whitespace-nowrap bg-white border border-slate-200 rounded-lg p-2.5">
          question,optionA,optionB,optionC,optionD,correctOptionIndex,explanation,marks,negativeMark
        </p>
        <div className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span>
            Ensure the <strong>correctOptionIndex</strong> is between 0 and 3
            (0=A, 1=B, 2=C, 3=D). Option texts and questions must not contain
            unescaped double quotes.
          </span>
        </div>
      </div>

      <form onSubmit={handleUploadSubmit} className="mt-6 space-y-4">
        {/* Drag Drop Style File Input Area */}
        <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors p-6 bg-slate-50/20">
          <input
            type="file"
            id="csv-file-input"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <Upload className="h-8.5 w-8.5 text-slate-400" />
          <span className="mt-2 text-xs font-semibold text-slate-600">
            {file ? file.name : "Choose CSV file or drag here"}
          </span>
          {file && (
            <span className="mt-1 text-[9px] text-slate-400">
              Size: {(file.size / 1024).toFixed(1)} KB
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary-container py-4 text-sm font-bold text-white shadow-lg hover:shadow-primary/30 transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader size="sm" color="white" />
              Parsing CSV Spreadsheet...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Start Upload & Sync
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BulkUpload;
