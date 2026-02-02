import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useImages } from "../../hooks/useImages";
import { DashboardLayout } from "./DashboardLayout";
import { PromptBox } from "../PromptSection/PromptBox";
import { ReferenceImageSection } from "../ReferenceImages/ReferenceImageSection";
import { Gallery } from "../Gallery/Gallery";
import { AdminPanel } from "../Admin/AdminPanel";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, token, user } = useAuth();
  const {
    images,
    loading,
    generating,
    error,
    generateImage,
    deleteImage,
    fetchImages,
    addImage,
  } = useImages(token);
  const [selectedResourceId, setSelectedResourceId] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    if (token) {
      fetchImages();
    }
  }, [token, fetchImages]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGenerate = async (positivePrompt, negativePrompt) => {
    setErrorMessage("");
    setSuccessMessage("");

    const result = await generateImage(
      positivePrompt,
      negativePrompt,
      selectedResourceId
    );

    if (result.success) {
      // Optimistically add the generated image to the gallery
      if (result.resource) {
        addImage(result.resource);
      }
      setSuccessMessage("Image generated successfully!");
    } else {
      setErrorMessage(result.error || "Generation failed. Please try again.");
    }
  };

  const handleDelete = async (imageId) => {
    // No confirmation dialog - delete immediately
    const result = await deleteImage(imageId);
    if (!result.success) {
      setErrorMessage(result.error || "Delete failed. Please try again.");
    } else {
      setSuccessMessage("Image deleted successfully!");
    }
  };

  const handleUploadComplete = (success, resource, error) => {
    if (success) {
      setSuccessMessage("Reference image uploaded successfully!");
    } else {
      setErrorMessage(error || "Upload failed. Please try again.");
    }
  };

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div className="space-y-6">
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-4 flex justify-between items-center shadow-sm animate-fadeIn">
            <p className="text-green-700 dark:text-green-300 font-medium">
              ✓ {successMessage}
            </p>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-bold transition"
            >
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 flex justify-between items-center shadow-sm animate-fadeIn">
            <p className="text-red-700 dark:text-red-300 font-medium">
              ⚠️ {errorMessage}
            </p>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-bold transition"
            >
              ✕
            </button>
          </div>
        )}

        {generating && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-4 flex items-center gap-3 shadow-sm animate-fadeIn">
            <div className="loading-spinner"></div>
            <p className="text-blue-700 dark:text-blue-300 font-medium">
              Generating image... This may take a minute.
            </p>
          </div>
        )}

        <PromptBox
          onGenerate={handleGenerate}
          selectedResourceId={selectedResourceId}
          loading={generating}
        />

        <ReferenceImageSection
          onResourceSelect={setSelectedResourceId}
          onUploadComplete={handleUploadComplete}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <Gallery
            images={images}
            onDelete={handleDelete}
            loading={loading}
            error={error}
            token={token}
          />
        </div>

        {user?.role === "admin" && (
          <AdminPanel token={token} userRole={user.role} />
        )}
      </div>
    </DashboardLayout>
  );
};
