import { useState, useCallback } from "react";
import { resourcesAPI } from "../services/api";

export const useResources = (token) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResources = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await resourcesAPI.getReferences(token); // Changed from getAll
      setResources(data.resources || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResources([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [token]);

  const uploadResource = async (file) => {
    try {
      setLoading(true);
      const data = await resourcesAPI.upload(token, file);
      // Backend returns { message, resource }
      if (data.resource) {
        await fetchResources();
        return { success: true, resource: data.resource };
      }
      return { success: false, error: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteResource = async (resourceId) => {
    try {
      // Optimistically remove from UI immediately
      setResources((prevResources) =>
        prevResources.filter((res) => res.id !== resourceId)
      );

      const result = await resourcesAPI.delete(token, resourceId);
      if (result.success) {
        return { success: true };
      }
      // If delete failed, refetch to restore the deleted item
      await fetchResources();
      return { success: false, error: "Delete failed" };
    } catch (err) {
      // Refetch on error to restore UI
      await fetchResources();
      return { success: false, error: err.message };
    }
  };

  return {
    resources,
    loading,
    error,
    fetchResources,
    uploadResource,
    deleteResource,
  };
};
