// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Controllers = window.TorteriaApp.Controllers || {};

window.TorteriaApp.Controllers.HomeController = (function() {
  
  // Manejador del botón rápido "Agregar al carrito" en el Home
  async function handleAddCart(productId) {
    try {
      const product = await window.TorteriaApp.Models.ProductModel.getProductById(productId);
      if (product) {
        // En el home, se añade la opción base sin personalizaciones
        let defaultOptions = {};
        if (product.sizes && product.sizes.length > 0) {
          defaultOptions.size = product.sizes[0];
        }
        if (product.flavors && product.flavors.length > 0) {
          defaultOptions.flavor = product.flavors[0];
        }

        window.TorteriaApp.Models.CartModel.addItem(product, 1, defaultOptions);
        
        // Alerta visual de éxito (Toast o alert simple)
        alert(`¡"${product.name}" agregada con éxito al carrito!`);
      }
    } catch (error) {
      console.error("Error al añadir producto rápido al carrito:", error);
    }
  }

  return {
    // Inicializar el Home
    init: async function() {
      // 1. Inicializar componentes comunes (NavBar, buscadores)
      window.TorteriaApp.Views.CommonView.init();

      // 2. Suscribir vistas a cambios del carrito de compras
      window.TorteriaApp.Models.CartModel.subscribe(() => {
        window.TorteriaApp.Views.CommonView.updateCartBadge();
      });

      // 3. Renderizar productos destacados
      // Cargar productos desde el API Service
      const products = await window.TorteriaApp.Models.ProductModel.loadProducts();
      window.TorteriaApp.Views.HomeView.renderFeatured(products);

      // 4. Enlazar eventos de click
      window.TorteriaApp.Views.HomeView.bindCartEvents(handleAddCart);
    }
  };
})();
