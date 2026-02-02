import React, { useState, useEffect } from "react";
import { imagesAPI } from "../../services/api";

export const ImageCard = ({ image, onDelete, onExpand, token }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        const blob = await imagesAPI.getImage(token, image.id);
        const url = URL.createObjectURL(blob);
        setImageSrc(url);
        setError(null);
      } catch (err) {
        console.error("Failed to load image:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && image.id) {
      fetchImage();
    }

    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [image.id, token]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {loading ? (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <p className="text-red-500 text-xs p-2">Failed: {error}</p>
        </div>
      ) : imageSrc ? (
        <img
          src={imageSrc}
          alt="Generated"
          onClick={() => onExpand({ ...image, displaySrc: imageSrc })}
          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
        />
      ) : null}
      <div className="p-4 space-y-2">
        <p className="text-xs text-gray-500 truncate">{image.prompt}</p>
        <button
          onClick={() => onDelete(image.id)}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 text-sm font-semibold"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
