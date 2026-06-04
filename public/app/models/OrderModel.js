// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Models = window.TorteriaApp.Models || {};

window.TorteriaApp.Models.OrderModel = (function() {
  let currentOrder = null;
  const businessPhone = "573103103160"; // Número oficial de WhatsApp de La Tortería Express

  // Formateador de moneda colombiana (COP)
  function formatCOP(value) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(value);
  }

  return {
    // Validar los datos del formulario de compra
    validateCustomerData: function(data) {
      const errors = {};

      if (!data.name || data.name.trim().length < 3) {
        errors.name = "El nombre debe tener al menos 3 caracteres.";
      }
      
      // Validación básica de teléfono en Colombia (10 dígitos para móvil)
      const phoneRegex = /^3[0-9]{9}$/;
      if (!data.phone || !phoneRegex.test(data.phone.trim())) {
        errors.phone = "El número telefónico no es válido (debe iniciar con 3 y tener 10 dígitos).";
      }

      if (data.deliveryMethod === "domicilio") {
        if (!data.address || data.address.trim().length < 5) {
          errors.address = "La dirección de entrega debe ser más descriptiva.";
        }
        if (!data.neighborhood || data.neighborhood.trim() === "") {
          errors.neighborhood = "Debes ingresar tu barrio en Aguachica.";
        }
      }

      if (!data.paymentMethod) {
        errors.paymentMethod = "Por favor selecciona un método de pago.";
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
      };
    },

    // Guardar los detalles del pedido creado por el servicio API
    saveOrder: function(apiResponse, customerData, cartItems, pricing) {
      currentOrder = {
        orderId: apiResponse.orderId,
        customer: customerData,
        items: cartItems,
        pricing: pricing,
        date: new Date().toLocaleDateString("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      };
      return currentOrder;
    },

    // Obtener el pedido actual
    getCurrentOrder: function() {
      return currentOrder;
    },

    // Generar el enlace para enviar el pedido por WhatsApp
    generateWhatsAppUrl: function(order) {
      if (!order) return "";

      let message = `*🍰 LA TORTERÍA EXPRESS - NUEVO PEDIDO 🍰*\n`;
      message += `--------------------------------------\n`;
      message += `*Pedido N°:* ${order.orderId}\n`;
      message += `*Fecha:* ${order.date}\n`;
      message += `--------------------------------------\n`;
      message += `*DATOS DEL CLIENTE:*\n`;
      message += `👤 *Nombre:* ${order.customer.name}\n`;
      message += `📞 *Teléfono:* ${order.customer.phone}\n`;
      message += `📍 *Método:* ${order.customer.deliveryMethod === "domicilio" ? "Domicilio" : "Recoger en tienda"}\n`;
      
      if (order.customer.deliveryMethod === "domicilio") {
        message += `🏠 *Dirección:* ${order.customer.address}\n`;
        message += `🏘️ *Barrio:* ${order.customer.neighborhood}\n`;
      }
      
      message += `💳 *Pago:* ${order.customer.paymentMethod.toUpperCase()}\n`;
      if (order.customer.notes) {
        message += `✍️ *Notas:* ${order.customer.notes}\n`;
      }
      message += `--------------------------------------\n`;
      message += `*DETALLE DE PRODUCTOS:*\n\n`;

      order.items.forEach((item, index) => {
        message += `${index + 1}. *${item.name}* (x${item.quantity})\n`;
        if (item.size) {
          const label = item.category === "tortas" ? "Porciones" : "Presentación";
          message += `   • _${label}:_ ${item.size}\n`;
        }
        if (item.flavor) message += `   • _Sabor:_ ${item.flavor}\n`;
        if (item.customMessage) message += `   • _Mensaje:_ "${item.customMessage}"\n`;
        message += `   • _Precio:_ ${formatCOP(item.totalPrice)}\n\n`;
      });

      message += `--------------------------------------\n`;
      message += `💰 *Subtotal:* ${formatCOP(order.pricing.subtotal)}\n`;
      if (order.pricing.discount > 0) {
        message += `🎁 *Descuento:* -${formatCOP(order.pricing.discount)} (${order.pricing.couponCode})\n`;
      }
      if (order.customer.deliveryMethod === "domicilio") {
        message += `🛵 *Domicilio:* ${formatCOP(order.pricing.deliveryFee)}\n`;
      }
      message += `💵 *TOTAL A PAGAR:* ${formatCOP(order.pricing.total)}\n`;
      message += `--------------------------------------\n`;
      message += `¡Muchas gracias por su compra! Por favor, confírmeme el pedido.`;

      const encodedText = encodeURIComponent(message);
      return `https://api.whatsapp.com/send?phone=${businessPhone}&text=${encodedText}`;
    }
  };
})();
