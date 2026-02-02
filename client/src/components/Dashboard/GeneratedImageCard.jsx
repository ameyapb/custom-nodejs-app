import React, { useState } from "react";
import { imagesAPI } from "../../services/api";
import { AuthorizedImage } from "../Common/AuthorizedImage";
import { ConfirmDialog } from "../Common/ConfirmDialog";

export const GeneratedImageCard = ({ image, token, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await imagesAPI.delete(token, image.id);
      if (result.success) {
        onDelete(image.id);
        setShowConfirm(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="card p-0 overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col h-full aspect-square">
        <div className="flex-1 overflow-hidden">
          <AuthorizedImage
            token={token}
            resourceId={image.id}
            alt="Generated"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-2 space-y-1 bg-white dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-600 dark:text-gray-300 truncate font-medium">
            {image.filename || "Generated"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(image.createdAt).toLocaleDateString()}
          </p>
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white py-1.5 px-2 rounded text-xs font-semibold transition"
          >
            {isDeleting ? "..." : "Delete"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Image?"
        message="This action cannot be undone. The generated image will be permanently deleted."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
        confirmText="Delete"
        isDangerous={true}
      />
    </>
  );
};
