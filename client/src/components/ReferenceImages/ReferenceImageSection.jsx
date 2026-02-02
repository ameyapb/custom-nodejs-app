import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useResources } from "../../hooks/useResources";
import { UploadNew } from "./UploadNew";
import { UsePrevious } from "./UsePrevious";

export const ReferenceImageSection = ({
  onResourceSelect,
  onUploadComplete,
}) => {
  const { token } = useAuth();
  const {
    resources,
    loading,
    error,
    fetchResources,
    uploadResource,
    deleteResource,
  } = useResources(token);
  const [selectedResourceId, setSelectedResourceId] = useState(null);

  const handleUpload = async (file) => {
    const result = await uploadResource(file);
    if (result.success) {
      if (result.resource && result.resource.id) {
        setSelectedResourceId(result.resource.id);
        onResourceSelect(result.resource.id);
      }
      if (onUploadComplete) {
        onUploadComplete(true, result.resource);
      }
    } else {
      if (onUploadComplete) {
        onUploadComplete(false, null, result.error);
      }
    }
  };

  const handleSelectResource = (resourceId) => {
    setSelectedResourceId(resourceId);
    onResourceSelect(resourceId);
  };

  const handleDeleteResource = async (resourceId) => {
    // If deleting the currently selected resource, clear selection
    if (selectedResourceId === resourceId) {
      setSelectedResourceId(null);
      onResourceSelect(null);
    }
    await deleteResource(resourceId);
  };

  const handleClearSelection = () => {
    setSelectedResourceId(null);
    onResourceSelect(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Reference Image{" "}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            (Optional - for face swap)
          </span>
        </h2>
        {selectedResourceId && (
          <button
            onClick={handleClearSelection}
            className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold"
          >
            Clear Selection
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadNew onUpload={handleUpload} loading={loading} />
        <UsePrevious
          token={token}
          resources={resources}
          loading={loading}
          error={error}
          onFetch={fetchResources}
          onSelect={handleSelectResource}
          onDelete={handleDeleteResource}
          selectedId={selectedResourceId}
        />
      </div>

      {selectedResourceId && (
        <div className="p-3 bg-green-50 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            ✓ Selected Resource ID:{" "}
            <span className="font-semibold">{selectedResourceId}</span>
          </p>
        </div>
      )}
    </div>
  );
};
