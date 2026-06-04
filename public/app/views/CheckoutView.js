// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Views = window.TorteriaApp.Views || {};

window.TorteriaApp.Views.CheckoutView = (function() {
  const DOM = {
    checkoutForm: "#checkout-form",
    orderSummaryList: "#checkout-summary-list",
    pricingSummary: "#checkout-pricing-summary",
    deliveryMethodRadios: "input[name='deliveryMethod']",
    addressFieldsContainer: "#checkout-address-fields",
    placeOrderBtn: "#checkout-btn-place-order",
    mainContainer: "#checkout-main-container",
    errorFields: {
      name: "#error-customer-name",
      phone: "#error-customer-phone",
      address: "#error-customer-address",
      neighborhood: "#error-customer-neighborhood",
      paymentMethod: "#error-payment-method"
    }
  };

  // Formateador de COP
  function getFormatCOP() {
    return window.TorteriaApp.Views.CommonView.formatCOP;
  }

  // Generar HTML de productos para el checkout
  function createSummaryItemRow(item) {
    const formatCOP = getFormatCOP();
    let details = [];
    if (item.size) details.push(item.size);
    if (item.flavor) details.push(item.flavor);
    const detailsStr = details.length > 0 ? ` (${details.join(" - ")})` : "";

    return `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 class="my-0 fw-semibold text-dark">${item.name} <span class="text-accent">x${item.quantity}</span></h6>
          <small class="text-muted">${detailsStr}</small>
          ${item.customMessage ? `<div class="fs-9 text-accent italic">"Dedicatoria: ${item.customMessage}"</div>` : ""}
        </div>
        <span class="text-dark fw-medium">${formatCOP(item.totalPrice)}</span>
      </div>
    `;
  }

  return {
    // Inicializar la vista de checkout
    init: function() {
      this.renderSummary();
      this.bindDeliveryToggle();
    },

    // Renderizar los resúmenes en el checkout (productos y precios)
    renderSummary: function() {
      const items = window.TorteriaApp.Models.CartModel.getItems();
      const listEl = document.querySelector(DOM.orderSummaryList);
      const pricingEl = document.querySelector(DOM.pricingSummary);

      if (listEl) {
        listEl.innerHTML = items.map(item => createSummaryItemRow(item)).join("");
      }

      if (pricingEl) {
        const formatCOP = getFormatCOP();
        const subtotal = window.TorteriaApp.Models.CartModel.getSubtotal();
        const discount = window.TorteriaApp.Models.CartModel.getDiscountAmount();
        const deliveryFee = window.TorteriaApp.Models.CartModel.getDeliveryFee();
        const total = window.TorteriaApp.Models.CartModel.getTotal();
        const appliedCoupon = window.TorteriaApp.Models.CartModel.getAppliedCoupon();

        // Verificar el método de envío actualmente seleccionado
        const selectedMethodEl = document.querySelector("input[name='deliveryMethod']:checked");
        const method = selectedMethodEl ? selectedMethodEl.value : "domicilio";

        let discountRow = "";
        if (appliedCoupon) {
          discountRow = `
            <li class="list-group-item d-flex justify-content-between bg-light text-success fs-7">
              <div>
                <h6 class="my-0">Descuento (${appliedCoupon.code})</h6>
                <small>Cupón promocional</small>
              </div>
              <span class="fw-semibold">-${formatCOP(discount)}</span>
            </li>
          `;
        }

        pricingEl.innerHTML = `
          <ul class="list-group list-group-flush mb-4">
            <li class="list-group-item d-flex justify-content-between fs-7 py-3">
              <span class="text-muted">Subtotal del pedido</span>
              <span class="text-dark fw-semibold">${formatCOP(subtotal)}</span>
            </li>
            ${discountRow}
            <li class="list-group-item d-flex justify-content-between fs-7 py-3">
              <span class="text-muted">Costo de Domicilio</span>
              <span class="text-dark fw-semibold">${method === "domicilio" ? formatCOP(deliveryFee) : "Gratis ($0)"}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between py-3 border-top border-dark-subtle">
              <span class="fs-6 fw-bold text-dark">Total</span>
              <strong class="fs-5 text-accent">${formatCOP(method === "domicilio" ? total : total - deliveryFee)}</strong>
            </li>
          </ul>
        `;
      }
    },

    // Mostrar/ocultar campos de dirección si elige Domicilio o Retirar en tienda
    bindDeliveryToggle: function() {
      const radios = document.querySelectorAll(DOM.deliveryMethodRadios);
      const addressContainer = document.querySelector(DOM.addressFieldsContainer);

      radios.forEach(radio => {
        radio.addEventListener("change", (e) => {
          if (addressContainer) {
            if (e.target.value === "domicilio") {
              addressContainer.style.display = "block";
              // Activar validación visual
              addressContainer.querySelectorAll("input").forEach(input => input.required = true);
            } else {
              addressContainer.style.display = "none";
              // Desactivar requeridos para que deje enviar el formulario
              addressContainer.querySelectorAll("input").forEach(input => input.required = false);
            }
          }
          this.renderSummary(); // Recalcular total (restando/sumando costo de envío)
        });
      });
    },

    // Capturar inputs del formulario
    getFormData: function() {
      const form = document.querySelector(DOM.checkoutForm);
      if (!form) return null;

      const selectedMethodEl = form.querySelector("input[name='deliveryMethod']:checked");
      const selectedPaymentEl = form.querySelector("input[name='paymentMethod']:checked");

      return {
        name: form.querySelector("#customer-name").value.trim(),
        phone: form.querySelector("#customer-phone").value.trim(),
        deliveryMethod: selectedMethodEl ? selectedMethodEl.value : "domicilio",
        address: form.querySelector("#customer-address").value.trim(),
        neighborhood: form.querySelector("#customer-neighborhood").value.trim(),
        paymentMethod: selectedPaymentEl ? selectedPaymentEl.value : "",
        notes: form.querySelector("#order-notes").value.trim()
      };
    },

    // Renderizar errores de validación en pantalla
    renderValidationErrors: function(errors) {
      // Limpiar errores previos
      Object.keys(DOM.errorFields).forEach(field => {
        const errorEl = document.querySelector(DOM.errorFields[field]);
        if (errorEl) {
          errorEl.textContent = "";
          errorEl.style.display = "none";
        }
      });

      // Pintar nuevos errores
      Object.keys(errors).forEach(field => {
        const errorEl = document.querySelector(DOM.errorFields[field]);
        if (errorEl) {
          errorEl.textContent = errors[field];
          errorEl.style.display = "block";
        }
      });
    },

    // Bloquear/desbloquear botón al enviar pedido
    setSubmitState: function(isLoading) {
      const btn = document.querySelector(DOM.placeOrderBtn);
      if (!btn) return;

      if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Procesando delicias...`;
      } else {
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-bag-check-fill me-2"></i>Realizar Pedido`;
      }
    },

    // Renderizar la pantalla de éxito final
    renderSuccess: function(order, whatsappUrl) {
      const container = document.querySelector(DOM.mainContainer);
      if (!container) return;

      const formatCOP = getFormatCOP();

      container.innerHTML = `
        <div class="row justify-content-center py-5">
          <div class="col-lg-7 text-center" data-aos="zoom-in">
            <div class="success-icon-wrapper mb-4">
              <i class="bi bi-check2-circle text-success" style="font-size: 5rem;"></i>
            </div>
            
            <h2 class="fw-bold text-dark mb-2">¡Tu pedido ha sido recibido!</h2>
            <p class="text-muted mb-4 fs-6">Hemos registrado tu pedido en el sistema asíncronamente con éxito. Tu código es: <strong class="text-dark">${order.orderId}</strong></p>
            
            <div class="card border-0 shadow-sm rounded-4 p-4 mb-5 text-start bg-white">
              <h5 class="fw-semibold mb-3 text-dark border-bottom pb-2">Resumen del Pedido</h5>
              <div class="row mb-2">
                <div class="col-sm-5 text-muted">Cliente:</div>
                <div class="col-sm-7 fw-medium text-dark">${order.customer.name}</div>
              </div>
              <div class="row mb-2">
                <div class="col-sm-5 text-muted">Teléfono de contacto:</div>
                <div class="col-sm-7 fw-medium text-dark">${order.customer.phone}</div>
              </div>
              <div class="row mb-2">
                <div class="col-sm-5 text-muted">Método de entrega:</div>
                <div class="col-sm-7 fw-medium text-dark">${order.customer.deliveryMethod === "domicilio" ? `Domicilio (Barrio ${order.customer.neighborhood})` : "Recoger en tienda"}</div>
              </div>
              ${order.customer.deliveryMethod === "domicilio" ? `
              <div class="row mb-2">
                <div class="col-sm-5 text-muted">Dirección:</div>
                <div class="col-sm-7 fw-medium text-dark">${order.customer.address}</div>
              </div>` : ""}
              <div class="row mb-2">
                <div class="col-sm-5 text-muted">Método de pago:</div>
                <div class="col-sm-7 fw-medium text-dark text-uppercase">${order.customer.paymentMethod}</div>
              </div>
              <div class="row border-top pt-3 mt-3">
                <div class="col-sm-5 fw-bold text-dark fs-6">Monto Total:</div>
                <div class="col-sm-7 fw-bold text-accent fs-5">${formatCOP(order.pricing.total)}</div>
              </div>
            </div>

            <div class="alert alert-warning border-0 rounded-4 p-4 text-start mb-4 fs-7 d-flex align-items-start">
              <i class="bi bi-info-circle-fill text-warning fs-4 me-3 mt-1"></i>
              <div>
                <strong class="text-dark d-block mb-1">¡Acción Requerida!</strong>
                Para confirmar la preparación de tus productos de forma inmediata con nuestro pastelero, haz clic en el siguiente botón para enviar el resumen del pedido directamente a nuestro chat oficial de WhatsApp.
              </div>
            </div>

            <div class="d-grid gap-2 d-md-flex justify-content-center">
              <a href="${whatsappUrl}" target="_blank" class="btn btn-success btn-lg rounded-pill px-5 py-3 fw-bold mb-2 mb-md-0 shadow btn-hover">
                <i class="bi bi-whatsapp me-2 fs-5"></i>Enviar pedido por WhatsApp
              </a>
              <a href="catalog.html" class="btn btn-outline-dark btn-lg rounded-pill px-5 py-3">
                Seguir comprando
              </a>
            </div>
          </div>
        </div>
      `;

      // Asegurar scroll al inicio
      window.scrollTo(0, 0);
    },

    // Enlazar el envío del formulario
    bindSubmit: function(onSubmit) {
      const form = document.querySelector(DOM.checkoutForm);
      if (!form) return;

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = this.getFormData();
        if (typeof onSubmit === "function") {
          onSubmit(data);
        }
      });
    }
  };
})();
