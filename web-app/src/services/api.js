const API_BASE_URL = 'http://localhost:8080/api';

// Menu API
export const menuApi = {
  // Get all menus by store
  getMenusByStore: (storeId = 1) => 
    fetch(`${API_BASE_URL}/menu/search?storeId=${storeId}`)
      .then(res => res.json())
      .then(data => data.data || []),

  // Search menus by name and category
  searchMenus: (storeId = 1, name, category) => {
    const params = new URLSearchParams({ storeId });
    if (name) params.append('name', name);
    if (category) params.append('category', category);
    return fetch(`${API_BASE_URL}/menu/search?${params}`)
      .then(res => res.json())
      .then(data => data.data || []);
  },

  // Get menu by ID
  getMenuById: (id) =>
    fetch(`${API_BASE_URL}/menu/${id}`)
      .then(res => res.json())
      .then(data => data.data),
};

// Order API
export const orderApi = {
  // Create order
  createOrder: (orderData) =>
    fetch(`${API_BASE_URL}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })
      .then(res => res.json())
      .then(data => data.data),

  // Get orders by customer
  getOrdersByCustomer: (customerId) =>
    fetch(`${API_BASE_URL}/orders/${customerId}`)
      .then(res => res.json())
      .then(data => data.data || []),
};
