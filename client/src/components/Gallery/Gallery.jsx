import React, { useState } from "react";
import { AuthorizedImage } from "../Common/AuthorizedImage";
import { ImageModal } from "./ImageModal";

export const Gallery = ({ images, onDelete, loading, error, token }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No images generated yet. Create your first image to get started!
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="heading-secondary mb-6">Generated Images</h2>
      <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {images.map((image) => (
          <div key={image.id} className="flex flex-col h-full">
            <button
              onClick={() => setSelectedImage(image)}
              className="card p-0 overflow-hidden transition flex-1 flex flex-col hover:ring-2 hover:ring-blue-400"
              title={image.filename}
            >
              <AuthorizedImage
                token={token}
                resourceId={image.id}
                alt={image.filename}
                className="w-full h-24 object-cover flex-1"
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image.id);
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 text-xs font-semibold transition rounded-b-md"
              title="Delete image"
            >
              Delete
            </button>
          </div>
        ))}
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
