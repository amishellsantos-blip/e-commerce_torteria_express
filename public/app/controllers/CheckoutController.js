// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Controllers = window.TorteriaApp.Controllers || {};

window.TorteriaApp.Controllers.CheckoutController = (function() {
  
  // Procesar el envío del pedido
  async function handleSubmitOrder(customerData) {
    const CartModel = window.TorteriaApp.Models.CartModel;
    const OrderModel = window.TorteriaApp.Models.OrderModel;
    const CheckoutView = window.TorteriaApp.Views.CheckoutView;

    // 1. Validar los datos del formulario
    const validation = OrderModel.validateCustomerData(customerData);
    if (!validation.isValid) {
      CheckoutView.renderValidationErrors(validation.errors);
      return;
    }

    // Limpiar errores visuales si es válido
    CheckoutView.renderValidationErrors({});
    CheckoutView.setSubmitState(true);

    try {
      // 2. Preparar datos para el envío
      const cartItems = CartModel.getItems();
      
      const pricing = {
        subtotal: CartModel.getSubtotal(),
        discount: CartModel.getDiscountAmount(),
        couponCode: CartModel.getAppliedCoupon() ? CartModel.getAppliedCoupon().code : "",
        deliveryFee: customerData.deliveryMethod === "domicilio" ? CartModel.getDeliveryFee() : 0,
        total: customerData.deliveryMethod === "domicilio" ? CartModel.getTotal() : CartModel.getTotal() - CartModel.getDeliveryFee()
      };

      // Mapear los datos al formato que espera nuestro nuevo API en orders.php
      const orderPayload = {
        items: cartItems.map(item => ({
          product: { id: item.id },
          quantity: item.quantity,
          finalPrice: item.totalPrice,
          options: {
            size: item.size,
            flavor: item.flavor,
            customMessage: item.customMessage
          }
        })),
        total_amount: pricing.total,
        payment_method: customerData.paymentMethod,
        shipping_address: customerData.deliveryMethod === "domicilio" ? `${customerData.address}, Barrio: ${customerData.neighborhood}` : "Recogida en local",
        shipping_notes: customerData.notes || ""
      };

      // 3. Enviar a la base de datos MySQL real mediante nuestro API
      const apiResponse = await window.TorteriaApp.Services.api.createOrder(orderPayload);

      if (apiResponse.success) {
        // 4. Guardar pedido localmente para mostrar el resumen (mock model)
        const savedOrder = OrderModel.saveOrder(apiResponse, customerData, cartItems, pricing);

        // 5. Generar enlace dinámico de WhatsApp con los datos del pedido
        const whatsappUrl = OrderModel.generateWhatsAppUrl(savedOrder);

        // 6. Renderizar pantalla de confirmación exitosa con el enlace de WhatsApp
        CheckoutView.renderSuccess(savedOrder, whatsappUrl);

        // 7. Vaciar el carrito de compras en LocalStorage y memoria
        CartModel.clearCart();
      } else {
        alert("Ocurrió un error al registrar tu pedido: " + apiResponse.message);
        CheckoutView.setSubmitState(false);
      }
    } catch (error) {
      console.error("Error en flujo de confirmación de pedido:", error);
      alert("Error al procesar tu pedido: " + error.message);
      CheckoutView.setSubmitState(false);
    }
  }

  return {
    // Inicializar el Checkout
    init: function() {
      // 1. Inicializar barra y badge comunes
      window.TorteriaApp.Views.CommonView.init();

      // 2. Verificar si el carrito está vacío para redirigir
      const cartCount = window.TorteriaApp.Models.CartModel.getCartCount();
      if (cartCount === 0) {
        window.location.href = "cart.html";
        return;
      }

      // 3. Suscribir barra de menú al carrito
      window.TorteriaApp.Models.CartModel.subscribe(() => {
        window.TorteriaApp.Views.CommonView.updateCartBadge();
      });

      // 4. Inicializar controles y resúmenes de la vista
      window.TorteriaApp.Views.CheckoutView.init();

      // 5. Enlazar el evento de confirmación de compra
      window.TorteriaApp.Views.CheckoutView.bindSubmit(handleSubmitOrder);
    }
  };
})();
