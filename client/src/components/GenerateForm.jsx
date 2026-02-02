// node-app/client/src/components/GenerateForm.jsx
import { useState, useEffect } from "react";
import { api } from "../services/api";

export function GenerateForm({ onGenerateSuccess }) {
  const [positivePrompt, setPositivePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [referenceImageFile, setReferenceImageFile] = useState(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState(null);
  const [useExistingResource, setUseExistingResource] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [userResources, setUserResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load user's existing images
  useEffect(() => {
    const loadResources = async () => {
      try {
        const resources = await api.listResources();
        setUserResources(resources);
      } catch (err) {
        console.error("Failed to load resources for reference:", err);
      }
    };
    loadResources();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReferenceImageFile(file);
    setUseExistingResource(false);
    setSelectedResourceId("");

    const reader = new FileReader();
    reader.onloadend = () => setReferenceImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleResourceSelect = (resourceId) => {
    setSelectedResourceId(resourceId);
    setUseExistingResource(true);
    setReferenceImageFile(null);
    setReferenceImagePreview(null);
  };

  const clearReference = () => {
    setReferenceImageFile(null);
    setReferenceImagePreview(null);
    setSelectedResourceId("");
    setUseExistingResource(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!positivePrompt.trim()) {
      setError("Positive prompt is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // We use FormData because we may send a file
      const formData = new FormData();
      formData.append("positivePrompt", positivePrompt);
      if (negativePrompt.trim()) {
        formData.append("negativePrompt", negativePrompt);
      }

      if (referenceImageFile) {
        formData.append("referenceImage", referenceImageFile);
      } else if (selectedResourceId) {
        formData.append("referenceImageResourceId", selectedResourceId);
      }

      // You can either:
      // A) Use raw fetch (like your new component)
      // B) Extend api.js to support FormData uploads (recommended)

      const response = await fetch(`${api.API_BASE}/comfy/generate`, {
        method: "POST",
        headers: {
          // Important: Do NOT set Content-Type when using FormData
          Authorization: `Bearer ${api.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Generation failed");
      }

      // Success → refresh gallery
      await onGenerateSuccess?.();

      // Optional: clear form
      setPositivePrompt("");
      setNegativePrompt("");
      clearReference();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Generate Image</h2>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Positive Prompt *</label>
          <textarea
            value={positivePrompt}
            onChange={(e) => setPositivePrompt(e.target.value)}
            placeholder="Describe what you want to see..."
            style={styles.textarea}
            rows={4}
            required
            disabled={loading}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Negative Prompt (optional)</label>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Things to avoid..."
            style={styles.textarea}
            rows={2}
            disabled={loading}
          />
        </div>

        {/* Reference Image Section */}
        <div style={styles.referenceSection}>
          <h3 style={styles.subTitle}>Reference Image (optional)</h3>

          <div style={styles.toggleGroup}>
            <button
              type="button"
              onClick={() => {
                setUseExistingResource(false);
                clearReference();
              }}
              style={{
                ...styles.toggleButton,
                backgroundColor: !useExistingResource ? "#007bff" : "#e9ecef",
                color: !useExistingResource ? "white" : "#333",
              }}
              disabled={loading}
            >
              Upload New
            </button>

            <button
              type="button"
              onClick={() => {
                setUseExistingResource(true);
                clearReference();
              }}
              style={{
                ...styles.toggleButton,
                backgroundColor: useExistingResource ? "#007bff" : "#e9ecef",
                color: useExistingResource ? "white" : "#333",
              }}
              disabled={loading}
            >
              Use Existing
            </button>
          </div>

          {!useExistingResource && (
            <div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                disabled={loading}
                style={{ margin: "1rem 0" }}
              />
              {referenceImagePreview && (
                <div style={styles.previewContainer}>
                  <img
                    src={referenceImagePreview}
                    alt="Reference preview"
                    style={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={clearReference}
                    style={styles.clearButton}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {useExistingResource && (
            <div>
              {userResources.length === 0 ? (
                <p style={{ color: "#666", margin: "1rem 0" }}>
                  No previous images found.
                </p>
              ) : (
                <div style={styles.resourceGrid}>
                  {userResources.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => handleResourceSelect(res.id)}
                      style={{
                        ...styles.resourceCard,
                        borderColor:
                          selectedResourceId === res.id ? "#007bff" : "#ddd",
                      }}
                    >
                      <img
                        src={api.getResourceUrl(res.id)}
                        alt={res.filename}
                        style={styles.thumbnail}
                      />
                      <div style={styles.filename}>{res.filename}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedResourceId && (
                <button
                  type="button"
                  onClick={clearReference}
                  style={styles.clearButton}
                  disabled={loading}
                >
                  Clear selection
                </button>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !positivePrompt.trim()}
          style={{
            ...styles.button,
            backgroundColor: loading ? "#6c757d" : "#28a745",
          }}
        >
          {loading ? "Generating... (may take a minute)" : "Generate Image"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  title: { margin: "0 0 1.5rem", fontSize: "1.5rem", fontWeight: "600" },
  subTitle: { margin: "0 0 1rem", fontSize: "1.25rem", fontWeight: "500" },
  inputGroup: { marginBottom: "1.5rem" },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#333",
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    resize: "vertical",
    minHeight: "80px",
  },
  referenceSection: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    backgroundColor: "#f9f9f9",
  },
  toggleGroup: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  toggleButton: {
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  previewContainer: { marginTop: "1rem" },
  previewImage: {
    maxWidth: "240px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    display: "block",
    marginBottom: "0.75rem",
  },
  resourceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "1rem",
    marginBottom: "1rem",
  },
  resourceCard: {
    border: "2px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  thumbnail: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
  },
  filename: {
    padding: "0.5rem",
    fontSize: "0.8rem",
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    backgroundColor: "#fff",
  },
  clearButton: {
    color: "#dc3545",
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "0.9rem",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  button: {
    width: "100%",
    padding: "0.85rem",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "1.05rem",
    fontWeight: "500",
    cursor: "pointer",
  },
  error: {
    color: "#dc3545",
    marginBottom: "1rem",
    padding: "0.75rem",
    backgroundColor: "#f8d7da",
    borderRadius: "6px",
  },
};
