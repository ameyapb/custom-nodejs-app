import React, { useEffect } from "react";
import { AuthorizedImage } from "../Common/AuthorizedImage";

export const ImageModal = ({ image, token, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Support both image objects (with resourceId) and resource objects (with id)
  const resourceId = image.resourceId || image.id;
  const displayName = image.filename || "Image";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
        title="Close (ESC)"
        aria-label="Close modal"
      >
        ✕
      </button>
      <div className="max-w-7xl max-h-[95vh] w-full h-full flex items-center justify-center">
        <AuthorizedImage
          token={token}
          resourceId={resourceId}
          alt={displayName}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};
