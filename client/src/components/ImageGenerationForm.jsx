import React, { useState, useEffect } from "react";
import "./ImageGenerationForm.css";

/**
 * ImageGenerationForm Component
 *
 * Handles image generation with optional reference images.
 * Supports two modes for reference images:
 * 1. Upload a new file
 * 2. Select from existing resources
 */
const ImageGenerationForm = ({ apiBaseUrl, authToken }) => {
  const [positivePrompt, setPositivePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");

  // Reference image state
  const [referenceMode, setReferenceMode] = useState("none"); // 'none', 'upload', 'existing'
  const [referenceFile, setReferenceFile] = useState(null);
  const [referenceFilePreview, setReferenceFilePreview] = useState(null);
  const [selectedResourceId, setSelectedResourceId] = useState("");

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Resources for selection
  const [userResources, setUserResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Load user resources when switching to 'existing' mode
  useEffect(() => {
    if (referenceMode === "existing" && userResources.length === 0) {
      loadUserResources();
    }
  }, [referenceMode]);

  // Cleanup preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (referenceFilePreview) {
        URL.revokeObjectURL(referenceFilePreview);
      }
    };
  }, [referenceFilePreview]);

  const loadUserResources = async () => {
    setLoadingResources(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/resources`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load resources");
      }

      const data = await response.json();
      setUserResources(data.resources || []);
    } catch (err) {
      console.error("Error loading resources:", err);
      setError("Failed to load existing images");
    } finally {
      setLoadingResources(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    // Cleanup previous preview
    if (referenceFilePreview) {
      URL.revokeObjectURL(referenceFilePreview);
    }

    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Please upload JPEG, PNG, GIF, or WebP.");
        setReferenceFile(null);
        setReferenceFilePreview(null);
        return;
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("File too large. Maximum size is 10MB.");
        setReferenceFile(null);
        setReferenceFilePreview(null);
        return;
      }

      setReferenceFile(file);
      setReferenceFilePreview(URL.createObjectURL(file));
      setError(null);
    } else {
      setReferenceFile(null);
      setReferenceFilePreview(null);
    }
  };

  const handleReferenceModeChange = (mode) => {
    // Clear previous selections when changing mode
    setReferenceFile(null);
    setSelectedResourceId("");
    if (referenceFilePreview) {
      URL.revokeObjectURL(referenceFilePreview);
      setReferenceFilePreview(null);
    }
    setReferenceMode(mode);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!positivePrompt.trim()) {
      setError("Positive prompt is required");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("positivePrompt", positivePrompt.trim());

      if (negativePrompt.trim()) {
        formData.append("negativePrompt", negativePrompt.trim());
      }

      // Handle reference image based on mode
      if (referenceMode === "upload" && referenceFile) {
        formData.append("referenceImage", referenceFile);
      } else if (referenceMode === "existing" && selectedResourceId) {
        formData.append("referenceImageResourceId", selectedResourceId);
      }

      const response = await fetch(`${apiBaseUrl}/api/comfy/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate image");
      }

      setSuccess(
        `Image generated successfully! Resource ID: ${data.resource.id}`
      );

      // Reset form
      setPositivePrompt("");
      setNegativePrompt("");
      handleReferenceModeChange("none");
    } catch (err) {
      console.error("Generation error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="image-generation-form">
      <h2>Generate Image with ComfyUI</h2>

      <form onSubmit={handleSubmit}>
        {/* Positive Prompt */}
        <div className="form-group">
          <label htmlFor="positivePrompt">
            Positive Prompt <span className="required">*</span>
          </label>
          <textarea
            id="positivePrompt"
            value={positivePrompt}
            onChange={(e) => setPositivePrompt(e.target.value)}
            placeholder="Describe what you want to see..."
            rows={4}
            required
            disabled={isGenerating}
          />
        </div>

        {/* Negative Prompt */}
        <div className="form-group">
          <label htmlFor="negativePrompt">Negative Prompt (Optional)</label>
          <textarea
            id="negativePrompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Describe what you want to avoid..."
            rows={3}
            disabled={isGenerating}
          />
        </div>

        {/* Reference Image Section */}
        <div className="form-group">
          <label>Reference Image (Optional)</label>
          <p className="help-text">
            For face swap workflow. Choose to upload a new image or select an
            existing one.
          </p>

          {/* Reference Mode Selector */}
          <div className="reference-mode-selector">
            <button
              type="button"
              className={`mode-btn ${referenceMode === "none" ? "active" : ""}`}
              onClick={() => handleReferenceModeChange("none")}
              disabled={isGenerating}
            >
              No Reference
            </button>
            <button
              type="button"
              className={`mode-btn ${referenceMode === "upload" ? "active" : ""}`}
              onClick={() => handleReferenceModeChange("upload")}
              disabled={isGenerating}
            >
              Upload New
            </button>
            <button
              type="button"
              className={`mode-btn ${referenceMode === "existing" ? "active" : ""}`}
              onClick={() => handleReferenceModeChange("existing")}
              disabled={isGenerating}
            >
              Use Existing
            </button>
          </div>

          {/* Upload Mode */}
          {referenceMode === "upload" && (
            <div className="upload-section">
              <input
                type="file"
                id="referenceImage"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                disabled={isGenerating}
              />
              <label htmlFor="referenceImage" className="file-label">
                {referenceFile ? referenceFile.name : "Choose file..."}
              </label>

              {referenceFilePreview && (
                <div className="image-preview">
                  <img src={referenceFilePreview} alt="Reference preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setReferenceFile(null);
                      if (referenceFilePreview) {
                        URL.revokeObjectURL(referenceFilePreview);
                      }
                      setReferenceFilePreview(null);
                    }}
                    disabled={isGenerating}
                    className="clear-btn"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Existing Resource Mode */}
          {referenceMode === "existing" && (
            <div className="existing-section">
              {loadingResources ? (
                <p className="loading-text">Loading your images...</p>
              ) : userResources.length === 0 ? (
                <p className="help-text">
                  No images available. Upload some first!
                </p>
              ) : (
                <>
                  <select
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(e.target.value)}
                    disabled={isGenerating}
                  >
                    <option value="">Select an image...</option>
                    {userResources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.filename} (
                        {new Date(resource.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>

                  {selectedResourceId && (
                    <div className="selected-resource-preview">
                      <img
                        src={`${apiBaseUrl}/api/resources/${selectedResourceId}`}
                        alt="Selected resource"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Success Message */}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGenerating || !positivePrompt.trim()}
          className="submit-btn"
        >
          {isGenerating ? "Generating..." : "Generate Image"}
        </button>
      </form>
    </div>
  );
};

export default ImageGenerationForm;
