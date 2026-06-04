// Namespace de la aplicación
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Controllers = window.TorteriaApp.Controllers || {};

window.TorteriaApp.Controllers.AccountController = (function() {
  
  // Nodos DOM
  const DOM = {
    userNameDisplay: ".user-info h4",
    userOrdersContainer: "#userOrdersContainer",
    profileNameInput: "#profileName",
    profilePhoneInput: "#profilePhone",
    logoutLink: ".logout-link"
  };

  // Formateador
  function formatCOP(value) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Cargar perfil del usuario
  async function loadProfile() {
    try {
      const response = await window.TorteriaApp.Services.api.getProfile();
      if (response.success) {
        const user = response.data;
        
        // Actualizar UI
        document.querySelector(DOM.userNameDisplay).textContent = user.name;
        document.querySelector(DOM.profileNameInput).value = user.name;
        document.querySelector(DOM.profilePhoneInput).value = user.phone || '';
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      alert("Tu sesión ha expirado o no has iniciado sesión.");
      window.location.href = "login.html";
    }
  }

  // Cargar pedidos del usuario
  async function loadOrders() {
    const container = document.querySelector(DOM.userOrdersContainer);
    try {
      const response = await window.TorteriaApp.Services.api.getOrders();
      if (response.success) {
        renderOrders(response.data);
      } else {
        container.innerHTML = `<div class="text-center py-5 text-danger">${response.message}</div>`;
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      container.innerHTML = `<div class="text-center py-5 text-danger">Ocurrió un error al cargar tus pedidos.</div>`;
    }
  }

  // Renderizar la lista de pedidos en el HTML
  function renderOrders(orders) {
    const container = document.querySelector(DOM.userOrdersContainer);
    
    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-box-seam text-muted" style="font-size: 3rem;"></i>
          <p class="mt-3 text-muted">Aún no has realizado ningún pedido.</p>
          <a href="catalog.html" class="btn btn-outline-accent mt-2 rounded-pill px-4">Ir a comprar</a>
        </div>
      `;
      return;
    }

    let html = '';
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      
      // Color según el estado
      let statusClass = "processing";
      let statusText = order.status;
      if (order.status === 'entregado') { statusClass = "delivered"; statusText = "Entregado"; }
      if (order.status === 'enviado') { statusClass = "shipped"; statusText = "Enviado"; }
      if (order.status === 'cancelado') { statusClass = "cancelled"; statusText = "Cancelado"; }
      
      // Renderizar miniaturas de los productos
      let imagesHtml = '';
      order.items.forEach((item, index) => {
        if (index < 3) {
          imagesHtml += `<img src="${item.product_image || 'assets/img/product/placeholder.jpg'}" alt="Producto" loading="lazy" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">`;
        }
      });
      if (order.items.length > 3) {
        imagesHtml += `<span class="more-items">+${order.items.length - 3}</span>`;
      }

      html += `
        <div class="order-card mb-4 shadow-sm border-0" data-aos="fade-up">
          <div class="order-header bg-light border-bottom p-3">
            <div class="order-id">
              <span class="label fw-bold text-dark">ID Pedido:</span>
              <span class="value text-accent">#${order.id.toString().padStart(4, '0')}</span>
            </div>
            <div class="order-date text-muted fs-7">${date}</div>
          </div>
          <div class="order-content p-3 d-flex flex-column flex-md-row gap-3">
            <div class="product-grid flex-shrink-0" style="display: flex; gap: 5px;">
              ${imagesHtml}
            </div>
            <div class="order-info flex-grow-1">
              <div class="info-row d-flex justify-content-between mb-2 fs-7">
                <span class="text-muted">Estado</span>
                <span class="status ${statusClass} fw-bold text-uppercase">${statusText}</span>
              </div>
              <div class="info-row d-flex justify-content-between mb-2 fs-7">
                <span class="text-muted">Cantidad de productos</span>
                <span class="fw-medium">${order.items.length} items</span>
              </div>
              <div class="info-row d-flex justify-content-between fs-7">
                <span class="text-muted">Total</span>
                <span class="price fw-bold text-dark">${formatCOP(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Manejar cierre de sesión
  async function handleLogout(e) {
    e.preventDefault();
    try {
      await window.TorteriaApp.Services.api.logout();
      window.TorteriaApp.Models.CartModel.clearCart(); // Limpiar el carrito local por seguridad
      window.location.href = "login.html";
    } catch (error) {
      console.error(error);
      alert("Error al intentar cerrar sesión.");
    }
  }

  return {
    init: function() {
      // 1. Inicializar barra y badge comunes
      window.TorteriaApp.Views.CommonView.init();
      window.TorteriaApp.Views.CommonView.updateCartBadge();

      // 2. Suscribir barra de menú al carrito
      window.TorteriaApp.Models.CartModel.subscribe(() => {
        window.TorteriaApp.Views.CommonView.updateCartBadge();
      });

      // 3. Cargar datos del usuario
      loadProfile();
      loadOrders();

      // 4. Bind Logout
      const logoutBtn = document.querySelector(DOM.logoutLink);
      if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
      }
      
      // 5. Guardar perfil en la BD
      const settingsForm = document.getElementById('accountSettingsForm');
      if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const btnSave = document.getElementById('btnSaveProfile');
          const originalText = btnSave.innerHTML;
          btnSave.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';
          btnSave.disabled = true;

          const name = document.querySelector(DOM.profileNameInput).value;
          const phone = document.querySelector(DOM.profilePhoneInput).value;

          try {
            const response = await window.TorteriaApp.Services.api.updateProfile({ name, phone });
            if (response.success) {
              alert("¡Perfil actualizado con éxito!");
              document.querySelector(DOM.userNameDisplay).textContent = name;
            } else {
              alert(response.message || "Error al actualizar perfil.");
            }
          } catch (error) {
            console.error("Error updating profile", error);
            alert("Ocurrió un error de red al guardar los cambios.");
          } finally {
            btnSave.innerHTML = originalText;
            btnSave.disabled = false;
          }
        });
      }
    }
  };
})();
