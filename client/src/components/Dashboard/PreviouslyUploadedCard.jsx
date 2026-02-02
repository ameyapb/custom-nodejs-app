import React from "react";
import { AuthorizedImage } from "../Common/AuthorizedImage";

export const PreviouslyUploadedCard = ({ resource, token, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(resource.id)}
      className="card p-0 overflow-hidden cursor-pointer hover:shadow-lg transition"
    >
      <AuthorizedImage
        token={token}
        resourceId={resource.id}
        alt={resource.filename}
        className="w-full h-48 object-cover"
      />
      <div className="p-3">
        <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
          {resource.filename}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {(resource.fileSizeBytes / 1024).toFixed(2)} KB
        </p>
      </div>
    </div>
  );
};
