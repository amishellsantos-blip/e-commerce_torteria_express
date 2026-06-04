// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Views = window.TorteriaApp.Views || {};

window.TorteriaApp.Views.CartView = (function() {
  const DOM = {
    cartTableBody: "#cart-table-body",
    cartSummaryContainer: "#cart-summary-container",
    cartContainer: "#cart-main-container",
    couponInput: "#cart-coupon-input",
    couponBtn: "#cart-coupon-btn",
    couponMsg: "#cart-coupon-message",
    checkoutBtn: "#cart-btn-checkout"
  };

  // Formateador de COP
  function getFormatCOP() {
    return window.TorteriaApp.Views.CommonView.formatCOP;
  }

  // Generar HTML para una fila del carrito de compra
  function createCartRow(item) {
    const formatCOP = getFormatCOP();
    
    // Generar texto descriptivo de personalizaciones
    let detailsHtml = "";
    if (item.size) {
      const sizeLabel = item.category === "tortas" ? "Porciones" : "Presentación";
      detailsHtml += `<span class="badge bg-light text-secondary me-2 border fs-8">${sizeLabel}: ${item.size}</span>`;
    }
    if (item.flavor) detailsHtml += `<span class="badge bg-light text-secondary me-2 border fs-8">Sabor: ${item.flavor}</span>`;
    if (item.customMessage) detailsHtml += `<div class="mt-1 fs-8 text-accent fw-bold"><i class="bi bi-chat-left-text me-1"></i>Dedicatoria: "${item.customMessage}"</div>`;

    return `
      <tr data-cart-item-id="${item.cartItemId}">
        <td class="align-middle py-3">
          <div class="d-flex align-items-center">
            <img src="${item.image}" alt="${item.name}" class="rounded-3 me-3 object-fit-cover" style="width: 70px; height: 70px; background-color: #fff9f6;">
            <div>
              <h6 class="mb-1 fw-semibold text-dark">${item.name}</h6>
              <div class="d-flex flex-wrap">${detailsHtml}</div>
            </div>
          </div>
        </td>
        <td class="align-middle text-center py-3">${formatCOP(item.unitPrice)}</td>
        <td class="align-middle py-3" style="width: 130px;">
          <div class="input-group input-group-sm border rounded-pill overflow-hidden">
            <button class="btn btn-link px-2 text-dark btn-qty-dec" type="button"><i class="bi bi-minus"></i></button>
            <input type="number" class="form-control border-0 text-center fs-7 bg-transparent input-qty" value="${item.quantity}" min="1" readonly>
            <button class="btn btn-link px-2 text-dark btn-qty-inc" type="button"><i class="bi bi-plus"></i></button>
          </div>
        </td>
        <td class="align-middle text-end fw-semibold text-dark py-3">${formatCOP(item.totalPrice)}</td>
        <td class="align-middle text-center py-3">
          <button class="btn btn-link text-danger p-0 btn-remove-item" title="Eliminar del carrito">
            <i class="bi bi-trash-fill fs-5"></i>
          </button>
        </td>
      </tr>
    `;
  }

  return {
    // Renderizar la página del carrito completo
    renderCart: function() {
      const items = window.TorteriaApp.Models.CartModel.getItems();
      const container = document.querySelector(DOM.cartContainer);
      const tableBody = document.querySelector(DOM.cartTableBody);

      if (!container) return;

      // 1. Si el carrito está vacío, mostrar pantalla de aviso
      if (!items || items.length === 0) {
        container.innerHTML = `
          <div class="text-center py-5" data-aos="fade-up">
            <div class="display-1 text-muted mb-4"><i class="bi bi-cart-x"></i></div>
            <h3 class="fw-bold text-dark">Tu carrito está vacío</h3>
            <p class="text-muted mb-4">¡Parece que aún no has agregado ninguna delicia al carrito!</p>
            <a href="catalog.html" class="btn btn-primary btn-lg rounded-pill px-5">Ir al catálogo de productos</a>
          </div>
        `;
        return;
      }

      // 2. Renderizar filas de la tabla
      if (tableBody) {
        tableBody.innerHTML = items.map(item => createCartRow(item)).join("");
      }

      // 3. Renderizar resumen de costos
      this.renderSummary();
    },

    // Renderizar el bloque lateral con el resumen de la compra
    renderSummary: function() {
      const summaryEl = document.querySelector(DOM.cartSummaryContainer);
      if (!summaryEl) return;

      const formatCOP = getFormatCOP();
      const subtotal = window.TorteriaApp.Models.CartModel.getSubtotal();
      const discount = window.TorteriaApp.Models.CartModel.getDiscountAmount();
      const deliveryFee = window.TorteriaApp.Models.CartModel.getDeliveryFee();
      const total = window.TorteriaApp.Models.CartModel.getTotal();
      const appliedCoupon = window.TorteriaApp.Models.CartModel.getAppliedCoupon();

      let discountRow = "";
      if (appliedCoupon) {
        discountRow = `
          <div class="d-flex justify-content-between mb-3 text-success fw-medium">
            <span>Descuento (${appliedCoupon.code} - ${appliedCoupon.percent * 100}%)</span>
            <span>-${formatCOP(discount)}</span>
          </div>
        `;
      }

      summaryEl.innerHTML = `
        <h5 class="fw-semibold mb-4 text-dark border-bottom pb-2">Resumen de Compra</h5>
        <div class="d-flex justify-content-between mb-3">
          <span class="text-muted">Subtotal</span>
          <span class="text-dark fw-semibold">${formatCOP(subtotal)}</span>
        </div>
        ${discountRow}
        <div class="d-flex justify-content-between mb-3">
          <span class="text-muted">Domicilio (Aguachica)</span>
          <span class="text-dark fw-semibold">${deliveryFee > 0 ? formatCOP(deliveryFee) : "Gratis"}</span>
        </div>
        <div class="border-top my-4"></div>
        <div class="d-flex justify-content-between align-items-center mb-5">
          <span class="fs-5 fw-bold text-dark">Total a pagar</span>
          <span class="fs-4 fw-extrabold text-accent">${formatCOP(total)}</span>
        </div>
      `;
    },

    // Enlazar cambios del carrito (botones de sumar, restar o eliminar productos)
    bindCartActions: function(onUpdateQty, onRemoveItem) {
      const tableBody = document.querySelector(DOM.cartTableBody);
      if (!tableBody) return;

      tableBody.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        if (!row) return;
        const cartItemId = row.dataset.cartItemId;

        // Clic en Incrementar Cantidad (+)
        if (e.target.closest(".btn-qty-inc")) {
          const input = row.querySelector(".input-qty");
          let val = parseInt(input.value) || 1;
          const newVal = val + 1;
          input.value = newVal;
          if (typeof onUpdateQty === "function") onUpdateQty(cartItemId, newVal);
        }

        // Clic en Decrementar Cantidad (-)
        if (e.target.closest(".btn-qty-dec")) {
          const input = row.querySelector(".input-qty");
          let val = parseInt(input.value) || 1;
          if (val > 1) {
            const newVal = val - 1;
            input.value = newVal;
            if (typeof onUpdateQty === "function") onUpdateQty(cartItemId, newVal);
          }
        }

        // Clic en Eliminar (Tacho de basura)
        if (e.target.closest(".btn-remove-item")) {
          if (typeof onRemoveItem === "function") onRemoveItem(cartItemId);
        }
      });
    },

    // Enlazar la aplicación del cupón promocional
    bindCoupon: function(onApplyCoupon) {
      const couponInput = document.querySelector(DOM.couponInput);
      const couponBtn = document.querySelector(DOM.couponBtn);
      const couponMsg = document.querySelector(DOM.couponMsg);

      if (!couponBtn || !couponInput) return;

      // Cargar cupón si ya está aplicado
      const currentCoupon = window.TorteriaApp.Models.CartModel.getAppliedCoupon();
      if (currentCoupon) {
        couponInput.value = currentCoupon.code;
        couponInput.disabled = true;
        couponBtn.textContent = "Aplicado";
        couponBtn.className = "btn btn-success rounded-end-pill px-4";
      }

      couponBtn.onclick = () => {
        const code = couponInput.value.trim();
        if (!code) return;

        if (typeof onApplyCoupon === "function") {
          const result = onApplyCoupon(code);
          if (couponMsg) {
            if (result.success) {
              couponMsg.className = "form-text text-success fs-8 mt-2";
              couponMsg.textContent = `¡Cupón aplicado! Descuento del ${result.discount * 100}% activo.`;
              couponInput.disabled = true;
              couponBtn.textContent = "Aplicado";
              couponBtn.className = "btn btn-success rounded-end-pill px-4";
            } else {
              couponMsg.className = "form-text text-danger fs-8 mt-2";
              couponMsg.textContent = "El cupón ingresado no es válido o ha expirado.";
            }
          }
        }
      };
    }
  };
})();
