import React, { useEffect, useState } from "react";
import { AuthorizedImage } from "../Common/AuthorizedImage";
import { ImageModal } from "../Gallery/ImageModal";

export const UsePrevious = ({
  token,
  resources,
  loading,
  error,
  onFetch,
  onSelect,
  selectedId,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    onFetch();
  }, [onFetch]);

  const handleDeleteClick = (e, resourceId) => {
    e.stopPropagation();
    onDelete(resourceId);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <button className="w-full text-left text-sm font-semibold text-gray-700 dark:text-gray-300 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          Use Previously Uploaded
        </button>
        <p className="text-gray-500 dark:text-gray-400 text-sm px-3">
          Loading...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <button className="w-full text-left text-sm font-semibold text-gray-700 dark:text-gray-300 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          Use Previously Uploaded
        </button>
        <p className="text-red-500 text-sm px-3">Error: {error}</p>
      </div>
    );
  }

  const selectedResource = resources.find((r) => r.id === selectedId);

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left text-sm font-semibold text-gray-700 dark:text-gray-300 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex justify-between items-center"
        >
          <span>
            Use Previously Uploaded{" "}
            {selectedResource && `(${selectedResource.filename})`}
          </span>
          <span className="text-xl">{isExpanded ? "▼" : "▶"}</span>
        </button>

        {isExpanded && (
          <>
            {!Array.isArray(resources) || resources.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm px-3">
                No previous images
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex flex-col h-full">
                    <button
                      onClick={() => setSelectedImage(resource)}
                      className={`card p-0 overflow-hidden transition flex-1 flex flex-col ${
                        selectedId === resource.id
                          ? "ring-2 ring-blue-500"
                          : "hover:ring-2 hover:ring-gray-400"
                      }`}
                      title="Click to view full size"
                    >
                      <AuthorizedImage
                        token={token}
                        resourceId={resource.id}
                        alt={resource.filename}
                        className="w-full h-24 object-cover flex-1"
                      />
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          onSelect(resource.id);
                          setIsExpanded(false);
                        }}
                        className={`flex-1 py-1.5 px-2 text-xs font-semibold transition rounded-bl-md ${
                          selectedId === resource.id
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                        title="Use as reference"
                      >
                        {selectedId === resource.id ? "Selected" : "Select"}
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, resource.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 text-xs font-semibold transition rounded-br-md"
                        title="Delete image"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          token={token}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};
