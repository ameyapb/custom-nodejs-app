import { useState, useEffect } from "react";
import { api } from "../services/api";

export function Gallery({ resources, onDelete }) {
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clean up old object URLs when resources change
    return () => {
      Object.values(imageUrls).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      const urls = {};

      for (const resource of resources) {
        try {
          const response = await fetch(api.getResourceUrl(resource.id), {
            headers: api.getHeaders(),
          });

          if (response.ok) {
            const blob = await response.blob();
            urls[resource.id] = URL.createObjectURL(blob);
          }
        } catch (err) {
          console.error(`Failed to load image ${resource.id}:`, err);
        }
      }

      setImageUrls(urls);
      setLoading(false);
    };

    if (resources.length > 0) {
      loadImages();
    } else {
      setLoading(false);
    }
  }, [resources]);

  const handleDelete = async (resourceId) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      // Revoke the object URL for this image
      if (imageUrls[resourceId] && imageUrls[resourceId].startsWith("blob:")) {
        URL.revokeObjectURL(imageUrls[resourceId]);
      }
      await onDelete(resourceId);
    }
  };

  if (loading && resources.length > 0) {
    return (
      <div style={styles.empty}>
        <p>Loading images...</p>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No images yet. Generate your first image above!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Gallery</h2>

      <div style={styles.grid}>
        {resources.map((resource) => (
          <div key={resource.id} style={styles.card}>
            {imageUrls[resource.id] ? (
              <img
                src={imageUrls[resource.id]}
                alt={resource.filename}
                style={styles.image}
              />
            ) : (
              <div style={styles.imagePlaceholder}>Loading...</div>
            )}

            <div style={styles.cardFooter}>
              <span style={styles.filename}>{resource.filename}</span>
              <button
                onClick={() => handleDelete(resource.id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  title: {
    margin: "0 0 1.5rem 0",
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  empty: {
    backgroundColor: "white",
    padding: "3rem 2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    color: "#666",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  image: {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    display: "block",
  },
  imagePlaceholder: {
    width: "100%",
    height: "250px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
  cardFooter: {
    padding: "0.75rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.5rem",
  },
  filename: {
    fontSize: "0.75rem",
    color: "#666",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  deleteButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.875rem",
    cursor: "pointer",
    fontWeight: "500",
  },
};
