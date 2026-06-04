// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Views = window.TorteriaApp.Views || {};

window.TorteriaApp.Views.CommonView = (function() {
  // Selectores comunes en todas las páginas
  const DOM = {
    cartBadges: ".header-actions .bi-cart3 + .badge, .header-action-btn .badge", // Selector para el badge del carrito
    mobileCartBadge: ".header-actions .bi-cart3 + .badge",
    logoText: ".logo .sitename",
    searchForms: ".search-form"
  };

  // Formateador de moneda colombiana (COP) para uso global en vistas
  function formatCOP(value) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(value);
  }

  return {
    // Inicializar elementos comunes
    init: function() {
      this.updateCartBadge();
      this.bindEvents();
    },

    // Formateador global de COP para que las demás vistas lo utilicen
    formatCOP: formatCOP,

    // Actualizar el contador del carrito en el header
    updateCartBadge: function() {
      const cartCount = window.TorteriaApp.Models.CartModel.getCartCount();
      const badges = document.querySelectorAll(DOM.cartBadges);
      
      badges.forEach(badge => {
        badge.textContent = cartCount;
        // Ocultar si está en 0 para mejorar la estética, o mantener visible
        if (cartCount === 0) {
          badge.style.display = "none";
        } else {
          badge.style.display = "flex";
        }
      });
    },

    // Enlazar eventos globales (como la búsqueda en el header)
    bindEvents: function() {
      const searchForms = document.querySelectorAll(DOM.searchForms);
      searchForms.forEach(form => {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const input = form.querySelector("input");
          const query = input ? input.value.trim() : "";
          if (query) {
            // Redirigir al catálogo con el parámetro de búsqueda
            window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
          }
        });
      });
    }
  };
})();
