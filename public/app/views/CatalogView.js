// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Views = window.TorteriaApp.Views || {};

window.TorteriaApp.Views.CatalogView = (function() {
  const DOM = {
    productsGrid: "#products-grid",
    categoryFilters: ".category-filter", // Botones de categorías
    searchBar: "#catalog-search-input",
    searchBtn: "#catalog-search-btn",
    sortSelect: "#catalog-sort-select",
    resultsCount: "#catalog-results-count",
    categoryTitle: "#catalog-category-title"
  };

  // Reutiliza la función del Home para consistencia, o la define localmente
  function createProductCard(product) {
    const formatCOP = window.TorteriaApp.Views.CommonView.formatCOP;
    
    // Calificación
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
      <div class="col-xl-4 col-md-6 col-sm-6 mb-4" data-aos="fade-up">
        <div class="product-item card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative transition">
          <div class="img-wrapper position-relative overflow-hidden" style="height: 230px; background-color: #fff9f6;">
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
              <p class="card-text text-muted fs-7 mb-4 line-clamp-2">${product.description}</p>
            </div>
            <div class="d-flex align-items-center justify-content-between mt-auto pt-2 border-top border-light">
              <span class="price text-accent fw-bold fs-4">${formatCOP(product.price)}</span>
              <a href="product-details.html?id=${product.id}" class="btn btn-outline-accent rounded-pill px-3 py-1 fs-7">Ver opciones</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return {
    // Renderizar la lista de productos
    renderProducts: function(products) {
      const grid = document.querySelector(DOM.productsGrid);
      const countEl = document.querySelector(DOM.resultsCount);
      if (!grid) return;

      if (countEl) {
        countEl.textContent = `${products.length} delicias encontradas`;
      }

      if (!products || products.length === 0) {
        grid.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="bi bi-emoji-frown text-muted fs-1 mb-3 d-block"></i>
            <h5 class="fw-semibold">No encontramos lo que buscas</h5>
            <p class="text-muted">Prueba con otra palabra clave o categoría.</p>
          </div>
        `;
        return;
      }

      let html = "";
      products.forEach(product => {
        html += createProductCard(product);
      });
      grid.innerHTML = html;
    },

    // Actualizar los textos de títulos de categoría
    updateHeaderInfo: function(categoryLabel) {
      const titleEl = document.querySelector(DOM.categoryTitle);
      if (titleEl) {
        titleEl.textContent = categoryLabel;
      }
    },

    // Activar visualmente el botón de la categoría seleccionada
    setActiveCategoryButton: function(categoryValue) {
      const buttons = document.querySelectorAll(DOM.categoryFilters);
      buttons.forEach(btn => {
        if (btn.dataset.category === categoryValue) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    },

    // Configurar el valor de búsqueda en la barra (si viene de una búsqueda global)
    setSearchValue: function(query) {
      const searchInput = document.querySelector(DOM.searchBar);
      if (searchInput) {
        searchInput.value = query;
      }
    },

    // Enlazar los filtros del catálogo (clicks en categorías, ordenar, buscar)
    bindFilters: function(onFilterChange) {
      const categoryButtons = document.querySelectorAll(DOM.categoryFilters);
      const searchInput = document.querySelector(DOM.searchBar);
      const searchButton = document.querySelector(DOM.searchBtn);
      const sortSelect = document.querySelector(DOM.sortSelect);

      const triggerChange = () => {
        const activeBtn = document.querySelector(`${DOM.categoryFilters}.active`);
        const category = activeBtn ? activeBtn.dataset.category : "todos";
        const searchQuery = searchInput ? searchInput.value.trim() : "";
        const sortBy = sortSelect ? sortSelect.value : "default";

        if (typeof onFilterChange === "function") {
          onFilterChange({ category, searchQuery, sortBy });
        }
      };

      // Clics en categoría
      categoryButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          categoryButtons.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          
          const label = btn.textContent.trim();
          this.updateHeaderInfo(label);
          
          triggerChange();
        });
      });

      // Búsqueda por entrada o botón
      if (searchButton && searchInput) {
        searchButton.addEventListener("click", triggerChange);
        searchInput.addEventListener("keyup", (e) => {
          if (e.key === "Enter") triggerChange();
        });
      }

      // Ordenar por precio/calificación
      if (sortSelect) {
        sortSelect.addEventListener("change", triggerChange);
      }
    },

    // Clic rápido en agregar al carrito desde el catálogo
    bindCartEvents: function(onAddCart) {
      const grid = document.querySelector(DOM.productsGrid);
      if (!grid) return;

      grid.addEventListener("click", (e) => {
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
