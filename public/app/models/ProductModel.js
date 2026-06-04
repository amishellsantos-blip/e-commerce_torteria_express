// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Models = window.TorteriaApp.Models || {};

window.TorteriaApp.Models.ProductModel = (function() {
  let cachedProducts = [];

  return {
    // Cargar todos los productos del servicio API y guardarlos en caché
    loadProducts: async function() {
      try {
        cachedProducts = await window.TorteriaApp.Services.ApiService.getProducts();
        return cachedProducts;
      } catch (error) {
        console.error("Error cargando productos en el Modelo:", error);
        return [];
      }
    },

    // Obtener todos los productos cargados
    getAllProducts: function() {
      return [...cachedProducts];
    },

    // Buscar y obtener un solo producto por su ID
    getProductById: async function(id) {
      // Buscar primero en caché
      let product = cachedProducts.find(p => p.id === parseInt(id));
      if (product) return { ...product };
      
      // Si no está en caché (acceso directo por URL), consultar a la API
      try {
        return await window.TorteriaApp.Services.ApiService.getProductById(id);
      } catch (error) {
        console.error(`Error cargando producto ${id} en el Modelo:`, error);
        return null;
      }
    },

    // Obtener productos filtrados por categoría, búsqueda y ordenados
    getProductsFiltered: function({ category = "todos", searchQuery = "", sortBy = "default" } = {}) {
      let result = [...cachedProducts];

      // 1. Filtrar por categoría
      if (category && category !== "todos") {
        result = result.filter(p => p.category === category);
      }

      // 2. Filtrar por texto de búsqueda
      if (searchQuery && searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        result = result.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query)
        );
      }

      // 3. Ordenamiento
      if (sortBy === "price-asc") {
        result.sort((a, b) => a.price - b.price);
      } else if (sortBy === "price-desc") {
        result.sort((a, b) => b.price - a.price);
      } else if (sortBy === "rating") {
        result.sort((a, b) => b.rating - a.rating);
      }

      return result;
    }
  };
})();
