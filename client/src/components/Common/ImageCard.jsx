import React, { useState } from "react";
import { AuthorizedImage } from "./AuthorizedImage";
import { ConfirmDialog } from "./ConfirmDialog";

/**
 * Unified ImageCard component with variant support
 * @param {Object} props
 * @param {Object} props.image - Image data { id, filename?, createdAt?, fileSizeBytes? }
 * @param {string} props.token - Auth token for image fetching
 * @param {'gallery' | 'generated' | 'reference'} props.variant - Display variant
 * @param {Function} props.onClick - Click handler (for gallery modal)
 * @param {Function} props.onSelect - Selection handler (for reference images)
 * @param {Function} props.onDelete - Delete handler
 * @param {boolean} props.showMetadata - Show filename/date/size (default based on variant)
 * @param {boolean} props.showDeleteButton - Show delete button (default based on variant)
 * @param {boolean} props.confirmDelete - Show confirm dialog before delete (default: true)
 * @param {string} props.className - Additional CSS classes
 */
export const ImageCard = ({
  image,
  token,
  variant = "gallery",
  onClick,
  onSelect,
  onDelete,
  showMetadata,
  showDeleteButton,
  confirmDelete = true,
  className = "",
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine defaults based on variant
  const defaults = {
    gallery: {
      showMetadata: false,
      showDeleteButton: true,
      imageHeight: "h-24",
    },
    generated: {
      showMetadata: true,
      showDeleteButton: true,
      imageHeight: "h-full",
    },
    reference: {
      showMetadata: true,
      showDeleteButton: false,
      imageHeight: "h-48",
    },
  };

  const variantDefaults = defaults[variant] || defaults.gallery;
  const shouldShowMetadata = showMetadata ?? variantDefaults.showMetadata;
  const shouldShowDelete = showDeleteButton ?? variantDefaults.showDeleteButton;
  const imageHeight = variantDefaults.imageHeight;

  const handleClick = () => {
    if (onClick) {
      onClick(image);
    } else if (onSelect) {
      onSelect(image.id);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      setShowConfirm(true);
    } else {
      handleDelete();
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(image.id);
      setShowConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Gallery variant - compact card with separate delete button
  if (variant === "gallery") {
    return (
      <>
        <div className={`flex flex-col h-full ${className}`}>
          <button
            onClick={handleClick}
            className="card p-0 overflow-hidden transition flex-1 flex flex-col hover:ring-2 hover:ring-blue-400"
            title={image.filename}
          >
            <AuthorizedImage
              token={token}
              resourceId={image.id}
              alt={image.filename || "Image"}
              className={`w-full ${imageHeight} object-cover flex-1`}
            />
          </button>
          {shouldShowDelete && (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white py-1.5 px-2 text-xs font-semibold transition rounded-b-md"
              title="Delete image"
            >
              {isDeleting ? "..." : "Delete"}
            </button>
          )}
        </div>

        {confirmDelete && (
          <ConfirmDialog
            isOpen={showConfirm}
            title="Delete Image?"
            message="This action cannot be undone. The image will be permanently deleted."
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
            confirmText="Delete"
            isDangerous={true}
          />
        )}
      </>
    );
  }

  // Generated variant - square aspect with metadata footer
  if (variant === "generated") {
    return (
      <>
        <div
          onClick={handleClick}
          className={`card p-0 overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col h-full aspect-square ${className}`}
        >
          <div className="flex-1 overflow-hidden">
            <AuthorizedImage
              token={token}
              resourceId={image.id}
              alt={image.filename || "Generated"}
              className="w-full h-full object-cover"
            />
          </div>
          {shouldShowMetadata && (
            <div className="p-2 space-y-1 bg-white dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate font-medium">
                {image.filename || "Generated"}
              </p>
              {image.createdAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
              )}
              {shouldShowDelete && (
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white py-1.5 px-2 rounded text-xs font-semibold transition"
                >
                  {isDeleting ? "..." : "Delete"}
                </button>
              )}
            </div>
          )}
        </div>

        {confirmDelete && (
          <ConfirmDialog
            isOpen={showConfirm}
            title="Delete Image?"
            message="This action cannot be undone. The generated image will be permanently deleted."
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
            confirmText="Delete"
            isDangerous={true}
          />
        )}
      </>
    );
  }

  // Reference variant - taller image with file info
  return (
    <div
      onClick={handleClick}
      className={`card p-0 overflow-hidden cursor-pointer hover:shadow-lg transition ${className}`}
    >
      <AuthorizedImage
        token={token}
        resourceId={image.id}
        alt={image.filename || "Reference"}
        className={`w-full ${imageHeight} object-cover`}
      />
      {shouldShowMetadata && (
        <div className="p-3">
          <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
            {image.filename || "Reference"}
          </p>
          {image.fileSizeBytes && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(image.fileSizeBytes / 1024).toFixed(2)} KB
            </p>
          )}
        </div>
      )}
    </div>
  );
};
