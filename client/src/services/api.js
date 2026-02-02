const API_BASE = '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async register(emailAddress, plainTextPassword, assignedApplicationRole = 'editor') {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailAddress, plainTextPassword, assignedApplicationRole }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    this.setToken(data.signedAuthenticationToken);
    return data;
  }

  async login(emailAddress, plainTextPassword) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailAddress, plainTextPassword }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    this.setToken(data.signedAuthenticationToken);
    return data;
  }

  logout() {
    this.setToken(null);
  }

  async generateImage(positivePrompt, negativePrompt = '') {
    const response = await fetch(`${API_BASE}/comfy/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ positivePrompt, negativePrompt }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Image generation failed');
    }
    
    return data;
  }

  async listResources() {
    const response = await fetch(`${API_BASE}/resources`, {
      headers: this.getHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch resources');
    }
    
    return data.resources;
  }

  async deleteResource(resourceId) {
    const response = await fetch(`${API_BASE}/resources/${resourceId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok && response.status !== 204) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete resource');
    }
  }

  getResourceUrl(resourceId) {
    return `${API_BASE}/resources/${resourceId}`;
  }
}

export const api = new ApiService();
