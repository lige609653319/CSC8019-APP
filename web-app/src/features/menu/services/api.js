// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper function to get auth headers
export const getAuthHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
      const response = await fetch(`${API_BASE_URL}/store/${storeId}`);
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
      const response = await fetch(`${API_BASE_URL}/menu/search?storeId=${storeId}`);
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
      const response = await fetch(`${API_BASE_URL}/menu/search?${params}`);
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
      const response = await fetch(`${API_BASE_URL}/menu/${id}`);
      const data = await handleResponse(response, 'getMenuById');
      return data.data;
    } catch (error) {
      console.error('[Menu API] Get by ID error:', error);
      throw error;
    }
  },
};

// Order API
export const orderApi = {
  // Create order
  createOrder: async (orderData) => {
    try {
      console.log('[Order API] Creating order:', orderData);
      const response = await fetch(`${API_BASE_URL}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      const data = await handleResponse(response, 'createOrder');
      console.log('[Order API] Order created successfully:', data);
      return data.data;
    } catch (error) {
      console.error('[Order API] Create order error:', error);
      throw error;
    }
  },

  // Get orders by customer
  getOrdersByCustomer: async (customerId) => {
    try {
      console.log(`[Order API] Fetching orders for customer: ${customerId}`);
      const response = await fetch(`${API_BASE_URL}/orders/${customerId}`);
      const data = await handleResponse(response, 'getOrdersByCustomer');
      return data.data || [];
    } catch (error) {
      console.error('[Order API] Get orders error:', error);
      throw error;
    }
  },
};

// Export API URL for debugging
export { API_BASE_URL };
