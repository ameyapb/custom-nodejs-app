// Use relative URLs to leverage Vite's proxy configuration
const API_BASE = "/api";

export const authAPI = {
  register: (emailAddress, plainTextPassword) =>
    fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailAddress,
        plainTextPassword,
      }),
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Registration failed");
      return data;
    }),

  login: (emailAddress, plainTextPassword) =>
    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailAddress, plainTextPassword }),
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Login failed");
      return data;
    }),
};

export const imagesAPI = {
  // Generate using ComfyUI workflow
  generate: (
    token,
    positivePrompt,
    negativePrompt,
    referenceImageResourceId
  ) => {
    const formData = new FormData();
    formData.append("positivePrompt", positivePrompt);
    if (negativePrompt) formData.append("negativePrompt", negativePrompt);
    if (referenceImageResourceId) {
      formData.append("referenceImageResourceId", referenceImageResourceId);
    }

    return fetch(`${API_BASE}/comfy/generate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Generation failed");
      return data;
    });
  },

  // List only generated images (ComfyUI outputs)
  getAll: (token) =>
    fetch(`${API_BASE}/resources/generated`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Failed to fetch images");
      return data;
    }),

  // Get single image as blob
  getImage: (token, resourceId) =>
    fetch(`${API_BASE}/resources/${resourceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (r) => {
      if (!r.ok) {
        const data = await r
          .json()
          .catch(() => ({ message: "Failed to fetch image" }));
        throw new Error(data.message || "Failed to fetch image");
      }
      return await r.blob();
    }),

  // Get single image URL
  getImageUrl: (token, resourceId) => `${API_BASE}/resources/${resourceId}`,

  // Delete image
  delete: (token, resourceId) =>
    fetch(`${API_BASE}/resources/${resourceId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (r) => {
      if (r.status === 204) return { success: true };
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Delete failed");
      return data;
    }),
};

export const resourcesAPI = {
  // Upload reference image
  upload: (token, file) => {
    const formData = new FormData();
    formData.append("image", file);
    return fetch(`${API_BASE}/resources`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Upload failed");
      return data;
    });
  },

  // List only reference images (uploaded, not generated)
  getReferences: (token) =>
    fetch(`${API_BASE}/resources/references`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Failed to fetch references");
      return data;
    }),

  // Delete resource
  delete: (token, resourceId) =>
    fetch(`${API_BASE}/resources/${resourceId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (r) => {
      if (r.status === 204) return { success: true };
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Delete failed");
      return data;
    }),

  // Get resource URL with token for img src
  getResourceUrl: (token, resourceId) =>
    `${API_BASE}/resources/${resourceId}?token=${token}`,
};

export const adminAPI = {
  // Get all users
  getAllUsers: (token) =>
    fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Failed to fetch users");
      return data;
    }),

  // Update user role
  updateUserRole: (token, userId, newRole) =>
    fetch(`${API_BASE}/admin/users/role`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        newRole,
      }),
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Failed to update user role");
      return data;
    }),
};
