// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Models = window.TorteriaApp.Models || {};

window.TorteriaApp.Models.CartModel = (function() {
  let cartItems = [];
  let discountCoupon = null;
  const deliveryFee = 3000; // Valor fijo del domicilio en Aguachica (3.000 COP)
  const listeners = [];

  // Cupones de descuento válidos
  const coupons = {
    "BIENVENIDO20": 0.20, // 20% descuento
    "EXPRESS10": 0.10,    // 10% descuento
    "TORTASLOVE5": 0.05    // 5% descuento
  };

  // Guardar en LocalStorage para no perder datos al recargar la página
  function saveToLocalStorage() {
    localStorage.setItem("lte_cart_items", JSON.stringify(cartItems));
    localStorage.setItem("lte_cart_coupon", JSON.stringify(discountCoupon));
  }

  // Cargar de LocalStorage al iniciar
  function loadFromLocalStorage() {
    try {
      const storedItems = localStorage.getItem("lte_cart_items");
      const storedCoupon = localStorage.getItem("lte_cart_coupon");
      
      if (storedItems) cartItems = JSON.parse(storedItems);
      if (storedCoupon) discountCoupon = JSON.parse(storedCoupon);
    } catch (e) {
      console.error("Error al cargar carrito desde LocalStorage:", e);
      cartItems = [];
      discountCoupon = null;
    }
  }

  // Notificar a las vistas que hubo un cambio para que se actualicen
  function notifyChange() {
    saveToLocalStorage();
    listeners.forEach(callback => callback());
  }

  // Generar un ID único interno para diferenciar productos iguales con diferentes personalizaciones
  function generateCartItemId(productId, size = "", flavor = "", message = "") {
    return `${productId}_${size.replace(/\s+/g, "")}_${flavor.replace(/\s+/g, "")}_${message.replace(/\s+/g, "")}`;
  }

  // Cargar datos al cargar el archivo
  loadFromLocalStorage();

  return {
    // Registrar escuchadores de cambios (Views)
    subscribe: function(callback) {
      if (typeof callback === "function") {
        listeners.push(callback);
      }
    },

    // Obtener los productos en el carrito
    getItems: function() {
      return [...cartItems];
    },

    // Agregar producto al carrito
    addItem: function(product, quantity = 1, options = {}) {
      const sizeName = options.size ? options.size.name : "";
      const priceOffset = options.size ? options.size.priceOffset : 0;
      const flavor = options.flavor || "";
      const customMessage = options.customMessage || "";

      // Precio unitario ajustado por el tamaño
      const unitPrice = product.price + priceOffset;
      const cartItemId = generateCartItemId(product.id, sizeName, flavor, customMessage);

      // Comprobar si ya existe una combinación idéntica en el carrito
      const existingItem = cartItems.find(item => item.cartItemId === cartItemId);

      if (existingItem) {
        existingItem.quantity += parseInt(quantity);
        existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
      } else {
        cartItems.push({
          cartItemId: cartItemId,
          id: product.id,
          name: product.name,
          image: product.image,
          category: product.category,
          unitPrice: unitPrice,
          quantity: parseInt(quantity),
          size: sizeName,
          flavor: flavor,
          customMessage: customMessage,
          totalPrice: unitPrice * parseInt(quantity)
        });
      }

      notifyChange();
    },

    // Remover producto del carrito por su ID personalizado
    removeItem: function(cartItemId) {
      cartItems = cartItems.filter(item => item.cartItemId !== cartItemId);
      notifyChange();
    },

    // Actualizar la cantidad de un producto
    updateQuantity: function(cartItemId, quantity) {
      const item = cartItems.find(item => item.cartItemId === cartItemId);
      if (item) {
        item.quantity = Math.max(1, parseInt(quantity));
        item.totalPrice = item.unitPrice * item.quantity;
        notifyChange();
      }
    },

    // Vaciar el carrito de compras
    clearCart: function() {
      cartItems = [];
      discountCoupon = null;
      notifyChange();
    },

    // Obtener la cantidad total de artículos
    getCartCount: function() {
      return cartItems.reduce((acc, item) => acc + item.quantity, 0);
    },

    // Calcular el subtotal de la compra
    getSubtotal: function() {
      return cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
    },

    // Aplicar un cupón de descuento
    applyCoupon: function(code) {
      const normalizedCode = code.toUpperCase().trim();
      if (coupons[normalizedCode]) {
        discountCoupon = {
          code: normalizedCode,
          percent: coupons[normalizedCode]
        };
        notifyChange();
        return { success: true, discount: coupons[normalizedCode] };
      }
      return { success: false, message: "Cupón no válido" };
    },

    // Obtener cupón aplicado
    getAppliedCoupon: function() {
      return discountCoupon;
    },

    // Calcular el monto descontado
    getDiscountAmount: function() {
      if (!discountCoupon) return 0;
      return Math.round(this.getSubtotal() * discountCoupon.percent);
    },

    // Obtener el valor del domicilio
    getDeliveryFee: function() {
      // Si el carrito está vacío, no hay costo de domicilio
      return cartItems.length === 0 ? 0 : deliveryFee;
    },

    // Calcular el total final
    getTotal: function() {
      const subtotal = this.getSubtotal();
      const discount = this.getDiscountAmount();
      const fee = this.getDeliveryFee();
      return Math.max(0, subtotal - discount + fee);
    }
  };
})();
