import { useState, useCallback } from "react";
import { imagesAPI } from "../services/api";

export const useImages = (token) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const fetchImages = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await imagesAPI.getAll(token);
      const imageList = (data.resources || []).map((resource) => ({
        id: resource.id,
        resourceId: resource.id,
        filename: resource.filename,
        prompt: resource.filename,
        createdAt: resource.createdAt,
      }));
      setImages(imageList);
      setError(null);
    } catch (err) {
      setError(err.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const generateImage = async (
    positivePrompt,
    negativePrompt,
    referenceImageResourceId
  ) => {
    try {
      setGenerating(true);
      setError(null);

      const data = await imagesAPI.generate(
        token,
        positivePrompt,
        negativePrompt,
        referenceImageResourceId
      );

      if (data.resource) {
        // Don't fetch here - let the caller handle state updates
        // This prevents duplication when Dashboard.jsx calls addImage()
        return { success: true, resource: data.resource };
      }
      return { success: false, error: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setGenerating(false);
    }
  };

  const deleteImage = async (imageId) => {
    try {
      // Optimistically remove from UI immediately
      setImages((prevImages) => prevImages.filter((img) => img.id !== imageId));

      const result = await imagesAPI.delete(token, imageId);
      if (result.success) {
        return { success: true };
      }
      // If delete failed, refetch to restore the deleted item
      await fetchImages();
      return { success: false, error: "Delete failed" };
    } catch (err) {
      // Refetch on error to restore UI
      await fetchImages();
      return { success: false, error: err.message };
    }
  };

  const addImage = (newImage) => {
    // For optimistically adding generated images
    const mappedImage = {
      id: newImage.id,
      resourceId: newImage.id,
      filename: newImage.filename,
      prompt: newImage.filename,
      createdAt: newImage.createdAt,
    };
    setImages((prevImages) => [mappedImage, ...prevImages]);
  };

  return {
    images,
    loading,
    generating,
    error,
    fetchImages,
    generateImage,
    deleteImage,
    addImage,
  };
};
