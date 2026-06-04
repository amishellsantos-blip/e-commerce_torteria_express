// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Controllers = window.TorteriaApp.Controllers || {};

window.TorteriaApp.Controllers.ProductDetailsController = (function() {
  
  // Manejador para agregar el producto personalizado al carrito
  function handleAddCart(product, quantity, options) {
    window.TorteriaApp.Models.CartModel.addItem(product, quantity, options);
  }

  return {
    // Inicializar la página de ficha de detalles
    init: async function() {
      // 1. Inicializar barra y badge comunes
      window.TorteriaApp.Views.CommonView.init();

      // 2. Suscribir barra de menú al carrito
      window.TorteriaApp.Models.CartModel.subscribe(() => {
        window.TorteriaApp.Views.CommonView.updateCartBadge();
      });

      // 3. Leer ID del producto de la URL (?id=2)
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get("id");

      if (!productId) {
        // Redirigir al catálogo si no se pasa un ID válido
        window.location.href = "catalog.html";
        return;
      }

      // Asegurarse de que los productos estén cargados en el Modelo
      await window.TorteriaApp.Models.ProductModel.loadProducts();

      // 4. Buscar detalles del producto
      const product = await window.TorteriaApp.Models.ProductModel.getProductById(productId);

      if (!product) {
        // Si el ID no existe en la base de datos, redirigir a catálogo
        window.location.href = "catalog.html";
        return;
      }

      // 5. Renderizar detalles del producto
      window.TorteriaApp.Views.ProductDetailsView.renderProduct(product);

      // 6. Obtener y renderizar productos relacionados (misma categoría, excluyendo el actual)
      const allProducts = window.TorteriaApp.Models.ProductModel.getAllProducts();
      const related = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4); // Mostrar máximo 4 relacionados
      
      window.TorteriaApp.Views.ProductDetailsView.renderRelated(related);

      // 7. Enlazar evento del botón de agregar al carrito
      window.TorteriaApp.Views.ProductDetailsView.bindAddCart(handleAddCart);
    }
  };
})();
