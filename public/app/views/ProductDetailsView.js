// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Views = window.TorteriaApp.Views || {};

window.TorteriaApp.Views.ProductDetailsView = (function() {
  const DOM = {
    breadcrumbCategory: "#details-breadcrumb-category",
    breadcrumbName: "#details-breadcrumb-name",
    productName: "#details-product-name",
    productPrice: "#details-product-price",
    productDescription: "#details-product-description",
    productImage: "#details-product-image",
    featuresContainer: "#details-features-container",
    optionsContainer: "#details-options-container",
    quantityInput: "#details-quantity-input",
    quantityDec: "#details-quantity-dec",
    quantityInc: "#details-quantity-inc",
    addCartBtn: "#details-btn-add-cart",
    relatedContainer: "#details-related-container"
  };

  let currentProduct = null;
  let selectedSizeIndex = 0;

  // Formateador de COP
  function getFormatCOP() {
    return window.TorteriaApp.Views.CommonView.formatCOP;
  }

  // Actualizar precio en pantalla basado en el tamaño seleccionado
  function updatePriceDisplay() {
    const priceEl = document.querySelector(DOM.productPrice);
    if (!priceEl || !currentProduct) return;

    let price = currentProduct.price;
    if (currentProduct.sizes && currentProduct.sizes.length > 0) {
      const sizeOffset = currentProduct.sizes[selectedSizeIndex].priceOffset;
      price += sizeOffset;
    }

    priceEl.textContent = getFormatCOP()(price);
  }

  return {
    // Renderizar detalles del producto
    renderProduct: function(product) {
      currentProduct = product;
      selectedSizeIndex = 0; // Reiniciar al tamaño base

      // 1. Actualizar textos de breadcrumbs y básicos
      const breadCategory = document.querySelector(DOM.breadcrumbCategory);
      const breadName = document.querySelector(DOM.breadcrumbName);
      const nameEl = document.querySelector(DOM.productName);
      const descEl = document.querySelector(DOM.productDescription);
      const imgEl = document.querySelector(DOM.productImage);
      
      if (breadCategory) {
        breadCategory.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
        breadCategory.href = `catalog.html?category=${product.category}`;
      }
      if (breadName) breadName.textContent = product.name;
      if (nameEl) nameEl.textContent = product.name;
      if (descEl) descEl.textContent = product.description;
      if (imgEl) {
        imgEl.src = product.image;
        imgEl.alt = product.name;
      }

      // 2. Renderizar características especiales (Tags)
      const featuresEl = document.querySelector(DOM.featuresContainer);
      if (featuresEl) {
        featuresEl.innerHTML = (product.features || ["Artesanal", "Fresco del Día"])
          .map(f => `<span class="badge bg-light text-secondary border px-3 py-2 rounded-pill me-2 mb-2 fs-7"><i class="bi bi-patch-check text-accent me-1"></i>${f}</span>`)
          .join("");
      }

      // 3. Renderizar las opciones personalizables del producto (Sabor, Tamaño, Mensaje)
      const optionsEl = document.querySelector(DOM.optionsContainer);
      if (optionsEl) {
        let html = "";

        // Opción de Tamaño (Si tiene varios tamaños)
        if (product.sizes && product.sizes.length > 0) {
          const defaultSizeLabel = product.category === "tortas" ? "Selecciona el Tamaño (Porciones):" : "Selecciona la Presentación:";
          const sizeLabel = product.sizeLabel || defaultSizeLabel;
          html += `
            <div class="mb-4">
              <label class="form-label fw-semibold text-dark mb-2">${sizeLabel}</label>
              <div class="row g-2">
                ${product.sizes.map((s, idx) => `
                  <div class="col-md-4">
                    <input type="radio" class="btn-check size-select" name="size" id="size-${idx}" value="${idx}" ${idx === 0 ? "checked" : ""}>
                    <label class="btn btn-outline-accent w-100 rounded-3 py-2 fs-7 text-start d-flex flex-column" for="size-${idx}">
                      <span class="fw-bold">${s.name}</span>
                      <span class="fs-8 opacity-75">${s.priceOffset > 0 ? `+ ${getFormatCOP()(s.priceOffset)}` : "Precio Base"}</span>
                    </label>
                  </div>
                `).join("")}
              </div>
            </div>
          `;
        }

        // Opción de Base de preparación (para jugos o bebidas)
        if (product.bases && product.bases.length > 0) {
          html += `
            <div class="mb-4">
              <label class="form-label fw-semibold text-dark mb-2" for="select-base">${product.baseLabel || "Selecciona la Preparación:"}</label>
              <select class="form-select rounded-3 py-2" id="select-base">
                ${product.bases.map(b => `<option value="${b}">${b}</option>`).join("")}
              </select>
            </div>
          `;
        }

        // Opción de Sabores (Si tiene sabores)
        if (product.flavors && product.flavors.length > 0) {
          html += `
            <div class="mb-4">
              <label class="form-label fw-semibold text-dark mb-2" for="select-flavor">${product.flavorLabel || "Elige el Sabor del Relleno:"}</label>
              <select class="form-select rounded-3 py-2" id="select-flavor">
                ${product.flavors.map(f => `<option value="${f}">${f}</option>`).join("")}
              </select>
            </div>
          `;
        }

        // Campo de Texto para Tortas (Únicamente para la categoría de tortas)
        if (product.category === "tortas") {
          html += `
            <div class="mb-4">
              <label class="form-label fw-semibold text-dark mb-2" for="input-custom-message">
                Mensaje personalizado en la torta (Opcional):
              </label>
              <input type="text" class="form-control rounded-3 py-2" id="input-custom-message" 
                     placeholder="Ej: ¡Feliz Cumpleaños Mamá! (Máx. 35 letras)" maxlength="35">
              <div class="form-text fs-8">Escribiremos este mensaje con crema sobre tu torta sin costo adicional.</div>
            </div>
          `;
        }

        optionsEl.innerHTML = html;
        updatePriceDisplay();
        this.bindOptionsEvents();
      }
    },

    // Enlazar los eventos internos de cambio de opciones
    bindOptionsEvents: function() {
      const sizeRadios = document.querySelectorAll(".size-select");
      sizeRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
          selectedSizeIndex = parseInt(e.target.value);
          updatePriceDisplay();
        });
      });

      // Eventos de control de cantidad (+/-)
      const decBtn = document.querySelector(DOM.quantityDec);
      const incBtn = document.querySelector(DOM.quantityInc);
      const qtyInput = document.querySelector(DOM.quantityInput);

      if (decBtn && incBtn && qtyInput) {
        decBtn.onclick = () => {
          let val = parseInt(qtyInput.value) || 1;
          qtyInput.value = Math.max(1, val - 1);
        };
        incBtn.onclick = () => {
          let val = parseInt(qtyInput.value) || 1;
          qtyInput.value = val + 1;
        };
      }
    },

    // Enlazar el botón de agregar al carrito de compra
    bindAddCart: function(onAddCart) {
      const btn = document.querySelector(DOM.addCartBtn);
      if (!btn) return;

      btn.onclick = () => {
        if (!currentProduct) return;

        // Obtener tamaño seleccionado
        let selectedSize = null;
        if (currentProduct.sizes && currentProduct.sizes.length > 0) {
          selectedSize = currentProduct.sizes[selectedSizeIndex];
        }

        // Obtener sabor y base (si existen)
        const flavorEl = document.querySelector("#select-flavor");
        const selectedFlavor = flavorEl ? flavorEl.value : "";
        const baseEl = document.querySelector("#select-base");
        const selectedBase = baseEl ? baseEl.value : "";

        let finalFlavor = selectedFlavor;
        if (selectedBase && selectedFlavor) {
          finalFlavor = `${selectedBase} - Sabor: ${selectedFlavor}`;
        } else if (selectedBase) {
          finalFlavor = selectedBase;
        }

        // Obtener mensaje personalizado
        const messageEl = document.querySelector("#input-custom-message");
        const customMessage = messageEl ? messageEl.value.trim() : "";

        // Cantidad
        const qtyInput = document.querySelector(DOM.quantityInput);
        const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

        if (typeof onAddCart === "function") {
          onAddCart(currentProduct, quantity, {
            size: selectedSize,
            flavor: finalFlavor,
            customMessage: customMessage
          });

          // Animación visual de éxito en el botón
          const originalText = btn.innerHTML;
          btn.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>¡Agregado con éxito!`;
          btn.classList.replace("btn-primary", "btn-success");
          btn.disabled = true;

          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.replace("btn-success", "btn-primary");
            btn.disabled = false;
            if (qtyInput) qtyInput.value = 1; // Reset a 1
          }, 1500);
        }
      };
    },

    // Renderizar productos relacionados
    renderRelated: function(relatedProducts) {
      const container = document.querySelector(DOM.relatedContainer);
      if (!container) return;

      if (!relatedProducts || relatedProducts.length === 0) {
        container.innerHTML = `<p class="text-muted">No hay delicias sugeridas en este momento.</p>`;
        return;
      }

      const formatCOP = getFormatCOP();
      let html = "";
      
      relatedProducts.forEach(product => {
        html += `
          <div class="col-lg-3 col-md-6 col-sm-6">
            <div class="product-item card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative transition">
              <div style="height: 180px; background-color: #fff9f6;" class="overflow-hidden">
                <img src="${product.image}" class="card-img-top w-100 h-100 object-fit-cover" alt="${product.name}">
              </div>
              <div class="card-body p-3 d-flex flex-column justify-content-between">
                <div>
                  <h6 class="fw-bold mb-1">
                    <a href="product-details.html?id=${product.id}" class="text-decoration-none text-dark hover-accent">${product.name}</a>
                  </h6>
                  <span class="price text-accent fw-bold fs-6">${formatCOP(product.price)}</span>
                </div>
                <a href="product-details.html?id=${product.id}" class="btn btn-outline-accent w-100 rounded-pill btn-sm mt-3">Ver opciones</a>
              </div>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }
  };
})();
