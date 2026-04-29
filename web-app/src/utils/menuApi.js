// API configuration
// Using relative path to take advantage of Vite proxy in development
const API_BASE_URL = '/api';

// Helper function to get auth headers
export const getAuthHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    // Token already includes "Bearer " prefix from login, so use directly
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return headers;
};

// Helper function with error handling
const handleResponse = async (response, endpoint) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`API Error [${endpoint}]:`, {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    });
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Store API
export const storeApi = {
  // Get store by ID
  getStoreById: async (storeId = 1) => {
    try {
      console.log(`[Store API] Fetching store: ${storeId}`);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/store/${storeId}`, {
        headers: getAuthHeaders(token)
      });
      const data = await handleResponse(response, 'getStoreById');
      console.log('[Store API] Success:', data);
      return data.data;
    } catch (error) {
      console.error('[Store API] Error:', error);
      throw error;
    }
  },
};

// Menu API
export const menuApi = {
  // Get all menus by store
  getMenusByStore: async (storeId = 1) => {
    try {
      console.log(`[Menu API] Fetching menus for storeId: ${storeId}`);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/menu/search?storeId=${storeId}`, {
        headers: getAuthHeaders(token)
      });
      const data = await handleResponse(response, 'getMenusByStore');
      console.log('[Menu API] Success:', data);
      return data.data || [];
    } catch (error) {
      console.error('[Menu API] Error:', error);
      throw error;
    }
  },

  // Search menus by name and category
  searchMenus: async (storeId = 1, name, category) => {
    try {
      const params = new URLSearchParams({ storeId });
      if (name) params.append('name', name);
      if (category) params.append('category', category);
      
      console.log(`[Menu API] Searching menus: ${params.toString()}`);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/menu/search?${params}`, {
        headers: getAuthHeaders(token)
      });
      const data = await handleResponse(response, 'searchMenus');
      return data.data || [];
    } catch (error) {
      console.error('[Menu API] Search error:', error);
      throw error;
    }
  },

  // Get menu by ID
  getMenuById: async (id) => {
    try {
      console.log(`[Menu API] Fetching menu: ${id}`);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
        headers: getAuthHeaders(token)
      });
      const data = await handleResponse(response, 'getMenuById');
      return data.data;
    } catch (error) {
      console.error('[Menu API] Get by ID error:', error);
      throw error;
    }
  },
};

// Export API URL for debugging
export { API_BASE_URL };
