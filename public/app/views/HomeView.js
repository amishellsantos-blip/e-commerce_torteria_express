// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Views = window.TorteriaApp.Views || {};

window.TorteriaApp.Views.HomeView = (function() {
  const DOM = {
    featuredContainer: "#featured-products-container",
    categorySlider: ".categories-slider"
  };

  // Crear HTML para una tarjeta de producto
  function createProductCard(product) {
    const formatCOP = window.TorteriaApp.Views.CommonView.formatCOP;
    
    // Generar estrellas de calificación
    let starsHtml = "";
    const fullStars = Math.floor(product.rating || 4.5);
    const hasHalf = (product.rating || 4.5) % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        starsHtml += `<i class="bi bi-star-fill text-warning me-1"></i>`;
      } else if (i === fullStars + 1 && hasHalf) {
        starsHtml += `<i class="bi bi-star-half text-warning me-1"></i>`;
      } else {
        starsHtml += `<i class="bi bi-star text-warning me-1"></i>`;
      }
    }

    return `
      <div class="col-lg-3 col-md-6 col-sm-6" data-aos="fade-up">
        <div class="product-item card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative transition">
          <div class="img-wrapper position-relative overflow-hidden" style="height: 250px; background-color: #fff9f6;">
            <img src="${product.image}" class="card-img-top w-100 h-100 object-fit-cover transition-all" alt="${product.name}">
            <div class="product-actions-hover position-absolute top-50 start-50 translate-middle d-flex gap-2 opacity-0 transition">
              <a href="product-details.html?id=${product.id}" class="btn btn-light rounded-circle shadow p-3 btn-hover" title="Ver detalles">
                <i class="bi bi-eye-fill text-dark fs-5"></i>
              </a>
              <button class="btn btn-primary rounded-circle shadow p-3 btn-add-cart btn-hover" data-id="${product.id}" title="Agregar al carrito">
                <i class="bi bi-cart-plus-fill fs-5"></i>
              </button>
            </div>
            ${product.rating >= 4.9 ? `<span class="badge position-absolute top-3 start-3 bg-danger px-3 py-2 rounded-pill fs-7">Más Vendido</span>` : ""}
          </div>
          <div class="card-body p-4 d-flex flex-column justify-content-between">
            <div>
              <span class="text-uppercase text-muted fs-8 tracking-wider">${product.category}</span>
              <h5 class="card-title mt-1 mb-2 fw-semibold">
                <a href="product-details.html?id=${product.id}" class="text-decoration-none text-dark hover-accent">${product.name}</a>
              </h5>
              <div class="rating d-flex align-items-center mb-3">
                ${starsHtml}
                <span class="text-muted fs-8 ms-2">(${product.reviewsCount || 10})</span>
              </div>
            </div>
            <div class="d-flex align-items-center justify-content-between mt-auto">
              <span class="price text-accent fw-bold fs-4">${formatCOP(product.price)}</span>
              <a href="product-details.html?id=${product.id}" class="btn btn-outline-accent rounded-pill px-3 py-1 fs-7">Ver opciones</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return {
    // Renderizar los productos destacados (por ejemplo, los primeros 4)
    renderFeatured: function(products) {
      const container = document.querySelector(DOM.featuredContainer);
      if (!container) return;

      if (!products || products.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5"><p class="text-muted">Cargando tortas y delicias...</p></div>`;
        return;
      }

      // Tomar una selección de 4 productos estrella para el Home
      const featured = products.slice(0, 4);
      let html = "";
      featured.forEach(product => {
        html += createProductCard(product);
      });

      container.innerHTML = html;
    },

    // Enlazar eventos de clicks rápidos de adición
    bindCartEvents: function(onAddCart) {
      const container = document.querySelector(DOM.featuredContainer);
      if (!container) return;

      container.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-add-cart");
        if (btn) {
          const productId = btn.dataset.id;
          if (typeof onAddCart === "function") {
            onAddCart(productId);
          }
        }
      });
    }
  };
})();
