// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Controllers = window.TorteriaApp.Controllers || {};

window.TorteriaApp.Controllers.CartController = (function() {
  
  // Modificar cantidad de un artículo en el carrito
  function handleUpdateQuantity(cartItemId, quantity) {
    window.TorteriaApp.Models.CartModel.updateQuantity(cartItemId, quantity);
  }

  // Eliminar un artículo del carrito
  function handleRemoveItem(cartItemId) {
    window.TorteriaApp.Models.CartModel.removeItem(cartItemId);
  }

  // Aplicar cupón de descuento
  function handleApplyCoupon(code) {
    return window.TorteriaApp.Models.CartModel.applyCoupon(code);
  }

  return {
    // Inicializar la página del Carrito de Compras
    init: function() {
      // 1. Inicializar barra y badge comunes
      window.TorteriaApp.Views.CommonView.init();

      // 2. Suscribir vistas a los cambios en el modelo del carrito
      window.TorteriaApp.Models.CartModel.subscribe(() => {
        // Actualizar el contador del menú superior
        window.TorteriaApp.Views.CommonView.updateCartBadge();
        // Volver a renderizar la grilla y el resumen de precios de la página del carrito
        window.TorteriaApp.Views.CartView.renderCart();
      });

      // 3. Renderizar el estado inicial del carrito
      window.TorteriaApp.Views.CartView.renderCart();

      // 4. Enlazar eventos de clicks del usuario
      window.TorteriaApp.Views.CartView.bindCartActions(
        handleUpdateQuantity,
        handleRemoveItem
      );

      // 5. Enlazar evento de validación del cupón
      window.TorteriaApp.Views.CartView.bindCoupon(handleApplyCoupon);
    }
  };
})();
