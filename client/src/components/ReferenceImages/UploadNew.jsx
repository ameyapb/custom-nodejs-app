import React, { useState, useRef } from "react";

export const UploadNew = ({ onUpload, loading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }
    await onUpload(selectedFile);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        Upload New Reference Image
      </label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 dark:text-gray-400"
      />
      {selectedFile && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Selected: {selectedFile.name}
        </p>
      )}
      <button
        onClick={handleUpload}
        disabled={loading || !selectedFile}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold transition"
      >
        {loading ? "Uploading..." : "Upload New"}
      </button>
    </div>
  );
};
