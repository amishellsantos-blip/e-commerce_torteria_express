// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Controllers = window.TorteriaApp.Controllers || {};

window.TorteriaApp.Controllers.CatalogController = (function() {
  
  // Filtrar y renderizar los productos según el estado actual de los inputs
  function filterAndRender() {
    // Obtener valores actuales desde la vista
    const activeBtn = document.querySelector(".category-filter.active");
    const category = activeBtn ? activeBtn.dataset.category : "todos";
    
    const searchInput = document.querySelector("#catalog-search-input");
    const searchQuery = searchInput ? searchInput.value.trim() : "";
    
    const sortSelect = document.querySelector("#catalog-sort-select");
    const sortBy = sortSelect ? sortSelect.value : "default";

    // Obtener productos procesados por el modelo
    const filteredProducts = window.TorteriaApp.Models.ProductModel.getProductsFiltered({
      category,
      searchQuery,
      sortBy
    });

    // Renderizar en la cuadrícula
    window.TorteriaApp.Views.CatalogView.renderProducts(filteredProducts);
  }

  // Manejador del botón rápido "Agregar al carrito"
  async function handleAddCart(productId) {
    try {
      const product = await window.TorteriaApp.Models.ProductModel.getProductById(productId);
      if (product) {
        let defaultOptions = {};
        if (product.sizes && product.sizes.length > 0) {
          defaultOptions.size = product.sizes[0];
        }
        if (product.flavors && product.flavors.length > 0) {
          defaultOptions.flavor = product.flavors[0];
        }

        window.TorteriaApp.Models.CartModel.addItem(product, 1, defaultOptions);
        alert(`¡"${product.name}" agregada con éxito al carrito!`);
      }
    } catch (error) {
      console.error("Error agregando al carrito desde catálogo:", error);
    }
  }

  return {
    // Inicializar la página del catálogo
    init: async function() {
      // 1. Inicializar barra y badge comunes
      window.TorteriaApp.Views.CommonView.init();

      // 2. Suscribir barra de menú al carrito
      window.TorteriaApp.Models.CartModel.subscribe(() => {
        window.TorteriaApp.Views.CommonView.updateCartBadge();
      });

      // 3. Cargar todos los productos de la API
      const products = await window.TorteriaApp.Models.ProductModel.loadProducts();

      // 4. Leer parámetros URL (ej: ?category=bebidas o ?search=oreo)
      const urlParams = new URLSearchParams(window.location.search);
      const urlCategory = urlParams.get("category") || "todos";
      const urlSearch = urlParams.get("search") || "";

      // 5. Configurar filtros en la Vista basado en la URL antes de renderizar
      window.TorteriaApp.Views.CatalogView.setActiveCategoryButton(urlCategory);
      window.TorteriaApp.Views.CatalogView.setSearchValue(urlSearch);

      // Mapear nombre estético para el título principal de la vista
      const categoryLabels = {
        "todos": "Todo el Menú",
        "tortas": "Tortas Artesanales",
        "hojaldres": "Hojaldres y Salados",
        "postres": "Postres y Galletas",
        "bebidas": "Bebidas Frías y Calientes"
      };
      window.TorteriaApp.Views.CatalogView.updateHeaderInfo(categoryLabels[urlCategory] || "Nuestros Productos");

      // 6. Primera renderización de productos filtrados
      filterAndRender();

      // 7. Enlazar eventos de filtros de usuario
      window.TorteriaApp.Views.CatalogView.bindFilters(() => {
        // En cada cambio, se vuelve a filtrar y renderizar
        filterAndRender();
      });

      // 8. Enlazar evento de añadir al carrito
      window.TorteriaApp.Views.CatalogView.bindCartEvents(handleAddCart);
    }
  };
})();
