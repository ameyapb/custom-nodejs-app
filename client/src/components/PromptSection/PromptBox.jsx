import React, { useState } from "react";

export const PromptBox = ({ onGenerate, selectedResourceId, loading }) => {
  const [positivePrompt, setPositivePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    if (!positivePrompt.trim()) {
      setError("Please enter a positive prompt");
      return;
    }
    if (positivePrompt.trim().length < 5) {
      setError("Positive prompt must be at least 5 characters");
      return;
    }
    await onGenerate(positivePrompt, negativePrompt);
    // Don't clear prompts - let user modify and regenerate
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Positive Prompt <span className="text-red-500">*</span>
        </label>
        <textarea
          value={positivePrompt}
          onChange={(e) => {
            setPositivePrompt(e.target.value);
            setError("");
          }}
          placeholder="Describe what you want to generate..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none"
          rows="3"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {positivePrompt.length} characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Negative Prompt <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="Describe what you don't want in the image..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none"
          rows="2"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">⚠️ {error}</p>
        </div>
      )}

      {selectedResourceId && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            ✓ Reference image selected for face swap
          </p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !positivePrompt.trim()}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition transform hover:scale-105 disabled:hover:scale-100"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="loading-spinner"></div>
            Generating...
          </span>
        ) : (
          "Generate Image"
        )}
      </button>
    </div>
  );
};
