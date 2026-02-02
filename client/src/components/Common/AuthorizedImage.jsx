import React, { useState, useEffect } from "react";

// Simple cache to avoid multiple requests for same resource
const imageCache = new Map();

export const AuthorizedImage = ({ token, resourceId, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token || !resourceId) {
      setError(true);
      setLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = `${token}_${resourceId}`;
    if (imageCache.has(cacheKey)) {
      setImageSrc(imageCache.get(cacheKey));
      setLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        const response = await fetch(`/api/resources/${resourceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          setError(true);
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        imageCache.set(cacheKey, url);
        setImageSrc(url);
        setError(false);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();

    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [token, resourceId, imageSrc]);

  if (loading) {
    return (
      <div
        className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse`}
      ></div>
    );
  }

  if (error) {
    return (
      <div
        className={`${className} bg-gray-300 dark:bg-gray-600 flex items-center justify-center`}
      >
        <span className="text-gray-600 dark:text-gray-400 text-xs">
          Failed to load
        </span>
      </div>
    );
  }

  return <img src={imageSrc} alt={alt} className={className} />;
};
