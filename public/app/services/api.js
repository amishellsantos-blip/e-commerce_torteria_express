const API_URL = 'api/products.php'; // Esta es la ruta a tu servidor local. Puedes ajustarla si la carpeta se llama diferente.

let cachedProducts = null;

const api = {
  getProducts: async () => {
    if (cachedProducts) return cachedProducts;
    
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al conectar con la base de datos');
      
      const data = await response.json();
      cachedProducts = data;
      return cachedProducts;
    } catch (error) {
      console.error("Error cargando productos de MySQL:", error);
      return [];
    }
  },
  
  getProductById: async (id) => {
    const allProducts = await api.getProducts();
    return allProducts.find(p => p.id === parseInt(id));
  },
  
  getProductsByCategory: async (category) => {
    const allProducts = await api.getProducts();
    return allProducts.filter(p => p.category === category);
  },
  
  createOrder: async (orderData) => {
    try {
      const response = await fetch('api/orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al crear pedido');
      return data;
    } catch (error) {
      throw error;
    }
  },

  getOrders: async () => {
    try {
      const response = await fetch('api/orders.php');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al obtener pedidos');
      return data;
    } catch (error) {
      throw error;
    }
  },

  getCustomers: async () => {
    try {
      const response = await fetch('api/auth/users.php');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al obtener clientes');
      return data;
    } catch (error) {
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await fetch('api/orders.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al actualizar estado');
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  login: async (email, password) => {
    try {
      const response = await fetch('api/auth/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error de conexión');
      return data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await fetch('api/auth/logout.php', { method: 'POST' });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: "Error al cerrar sesión" };
    }
  },

  getProfile: async () => {
    try {
      const response = await fetch('api/auth/profile.php');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al obtener perfil');
      return data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await fetch('api/auth/update_profile.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al actualizar perfil');
      return data;
    } catch (error) {
      throw error;
    }
  },

  getCustomers: async () => {
    try {
      const response = await fetch('api/auth/users.php');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al obtener clientes');
      return data;
    } catch (error) {
      throw error;
    }
  },


  register: async (userData) => {
    try {
      const response = await fetch('api/auth/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error de conexión');
      return data;
    } catch (error) {
      throw error;
    }
  }
};

window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Services = window.TorteriaApp.Services || {};
window.TorteriaApp.Services.ApiService = api;
window.TorteriaApp.Services.api = api; // fallback
