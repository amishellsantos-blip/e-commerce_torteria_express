// app/controllers/AdminController.js
document.addEventListener('DOMContentLoaded', () => {
  // Configuración
  const API_URL = 'api/admin/products.php';
  
  // Elementos DOM
  const tableBody = document.getElementById('adminProductsTableBody');
  const totalProductsCount = document.getElementById('totalProductsCount');
  const totalOrdersCount = document.getElementById('totalOrdersCount');
  const totalCustomersCount = document.getElementById('totalCustomersCount');
  const btnAddNew = document.getElementById('btnAddNewProduct');
  const productForm = document.getElementById('adminProductForm');
  const btnLogout = document.getElementById('btnLogout');
  const searchInput = document.getElementById('adminSearchInput');
  const categoryFilter = document.getElementById('adminCategoryFilter');
  const productModalElement = document.getElementById('productModal');
  const productModal = new bootstrap.Modal(productModalElement);
  
  // Tabs
  const menuProducts = document.getElementById('menuProducts');
  const menuOrders = document.getElementById('menuOrders');
  const menuCustomers = document.getElementById('menuCustomers');
  const productsSection = document.getElementById('productsSection');
  const ordersSection = document.getElementById('ordersSection');
  const customersSection = document.getElementById('customersSection');
  const ordersTableBody = document.getElementById('adminOrdersTableBody');
  const customersTableBody = document.getElementById('adminCustomersTableBody');
  
  // Variables de estado
  let allProducts = [];
  let allOrders = [];
  let allCustomers = [];
  let isEditing = false;

  // Formato COP
  const formatCOP = (num) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Renderizar la información del administrador
  const renderAdminInfo = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      document.getElementById('adminNameDisplay').textContent = user.name;
      document.getElementById('adminInitial').textContent = user.name.charAt(0).toUpperCase();
    }
  };

  // Cargar productos desde el backend
  const loadProducts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      
      if (data.success) {
        allProducts = data.data;
        renderTable(allProducts);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">Error al conectar con la base de datos.</td></tr>`;
    }
  };

  // Renderizar la tabla de productos
  const renderTable = (products) => {
    totalProductsCount.textContent = products.length;
    
    if (products.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No se encontraron productos.</td></tr>`;
      return;
    }

    let html = '';
    products.forEach(p => {
      const statusBadge = p.status == 1 
        ? `<span class="badge bg-success bg-opacity-10 text-success px-2 py-1">Activo</span>`
        : `<span class="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">Inactivo</span>`;
        
      html += `
        <tr>
          <td>
            <img src="${p.image}" alt="${p.name}" class="product-img-mini border">
          </td>
          <td>
            <div class="fw-semibold text-dark">${p.name}</div>
            <div class="fs-8 text-muted">${p.shortDescription || 'Sin descripción'}</div>
          </td>
          <td><span class="text-capitalize fs-7">${p.category}</span></td>
          <td class="fw-bold text-accent">${formatCOP(p.price)}</td>
          <td>${statusBadge}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-light text-primary btn-edit shadow-sm" data-id="${p.id}" title="Editar">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-light text-danger btn-delete shadow-sm ms-1" data-id="${p.id}" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  };

  // Buscar y Filtrar
  const filterProducts = () => {
    const q = searchInput.value.toLowerCase();
    const cat = categoryFilter.value;
    
    const filtered = allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(q) || (p.shortDescription && p.shortDescription.toLowerCase().includes(q));
      const matchesCat = cat === '' ? true : p.category === cat;
      return matchesSearch && matchesCat;
    });
    
    renderTable(filtered);
  };

  // ----- LÓGICA DE PEDIDOS -----
  const loadOrders = async () => {
    try {
      const res = await window.TorteriaApp.Services.api.getOrders();
      if (res.success) {
        allOrders = res.data;
        if (totalOrdersCount) totalOrdersCount.textContent = allOrders.length;
        renderOrdersTable(allOrders);
      } else {
        ordersTableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">${res.message}</td></tr>`;
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      ordersTableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">Error de conexión.</td></tr>`;
    }
  };

  const renderOrdersTable = (orders) => {
    if (orders.length === 0) {
      ordersTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay pedidos recibidos.</td></tr>`;
      return;
    }

    let html = '';
    orders.forEach(o => {
      const date = new Date(o.created_at).toLocaleString('es-CO');
      
      let statusColor = 'bg-secondary';
      if (o.status === 'pagado') statusColor = 'bg-info';
      if (o.status === 'preparando') statusColor = 'bg-warning';
      if (o.status === 'enviado') statusColor = 'bg-primary';
      if (o.status === 'entregado') statusColor = 'bg-success';
      if (o.status === 'cancelado') statusColor = 'bg-danger';

      const itemsList = o.items.map(item => `1x ${item.product_name}`).join(', ');

      html += `
        <tr>
          <td class="fw-bold">#${o.id.toString().padStart(4, '0')}</td>
          <td><div class="fs-8 text-muted">${date}</div></td>
          <td>
            <div class="fw-semibold">${o.customer_name}</div>
            <div class="fs-8 text-muted">${o.shipping_address}</div>
          </td>
          <td class="fw-bold text-accent">${formatCOP(o.total_amount)}</td>
          <td>
            <select class="form-select form-select-sm status-select" data-id="${o.id}" style="width: 130px; font-size: 0.8rem;">
              <option value="pendiente" ${o.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="pagado" ${o.status === 'pagado' ? 'selected' : ''}>Pagado</option>
              <option value="preparando" ${o.status === 'preparando' ? 'selected' : ''}>Preparando</option>
              <option value="enviado" ${o.status === 'enviado' ? 'selected' : ''}>Enviado</option>
              <option value="entregado" ${o.status === 'entregado' ? 'selected' : ''}>Entregado</option>
              <option value="cancelado" ${o.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
          </td>
          <td class="text-end">
            <button class="btn btn-sm btn-light text-primary shadow-sm" title="Ver detalles (Demo)" onclick="alert('Productos: ${itemsList}\\n\\nNotas: ${o.shipping_notes || 'Ninguna'}')">
              <i class="bi bi-eye"></i>
            </button>
          </td>
        </tr>
      `;
    });

    ordersTableBody.innerHTML = html;
  };

  // Cambiar estado del pedido
  ordersTableBody.addEventListener('change', async (e) => {
    if (e.target.classList.contains('status-select')) {
      const id = e.target.dataset.id;
      const newStatus = e.target.value;
      try {
        const res = await window.TorteriaApp.Services.api.updateOrderStatus(id, newStatus);
        if (!res.success) {
          alert('Error: ' + res.message);
          loadOrders(); // recargar para revertir
        }
      } catch (err) {
        alert('Error de conexión');
      }
    }
  });

  // ----- LÓGICA DE CLIENTES -----
  const loadCustomers = async () => {
    try {
      const res = await window.TorteriaApp.Services.api.getCustomers();
      if (res.success) {
        allCustomers = res.data;
        let customersToRender = allCustomers;
        if (totalCustomersCount) {
          const onlyCustomers = allCustomers.filter(c => c.role !== 'admin');
          totalCustomersCount.textContent = onlyCustomers.length;
          customersToRender = onlyCustomers;
        }
        renderCustomersTable(customersToRender);
      } else {
        customersTableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">${res.message}</td></tr>`;
      }
    } catch (error) {
      console.error('Error cargando clientes:', error);
      customersTableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">Error de conexión.</td></tr>`;
    }
  };

  const renderCustomersTable = (customers) => {
    if (customers.length === 0) {
      customersTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay clientes registrados.</td></tr>`;
      return;
    }

    let html = '';
    customers.forEach(c => {
      const date = new Date(c.created_at).toLocaleString('es-CO');
      
      let ordersBadge = c.total_orders > 0 
        ? `<span class="badge bg-success rounded-pill px-3 py-2">${c.total_orders}</span>` 
        : `<span class="badge bg-secondary bg-opacity-25 text-secondary rounded-pill px-3 py-2">0</span>`;

      html += `
        <tr>
          <td class="fw-bold text-muted">#${c.id.toString().padStart(4, '0')}</td>
          <td>
            <div class="fw-semibold text-dark">${c.name}</div>
            ${c.role === 'admin' ? '<span class="badge bg-danger bg-opacity-10 text-danger fs-8 mt-1">Administrador</span>' : ''}
          </td>
          <td class="text-muted"><i class="bi bi-envelope me-1"></i> ${c.email}</td>
          <td class="text-muted"><i class="bi bi-telephone me-1"></i> ${c.phone || 'N/A'}</td>
          <td><div class="fs-8 text-muted">${date}</div></td>
          <td class="text-center">
            ${ordersBadge}
          </td>
        </tr>
      `;
    });

    customersTableBody.innerHTML = html;
  };

  // Navegación por Pestañas
  menuProducts.addEventListener('click', (e) => {
    e.preventDefault();
    menuProducts.classList.add('active');
    menuOrders.classList.remove('active');
    menuCustomers.classList.remove('active');
    productsSection.style.display = 'block';
    ordersSection.style.display = 'none';
    customersSection.style.display = 'none';
  });

  menuOrders.addEventListener('click', (e) => {
    e.preventDefault();
    menuOrders.classList.add('active');
    menuProducts.classList.remove('active');
    menuCustomers.classList.remove('active');
    ordersSection.style.display = 'block';
    productsSection.style.display = 'none';
    customersSection.style.display = 'none';
    loadOrders();
  });

  menuCustomers.addEventListener('click', (e) => {
    e.preventDefault();
    menuCustomers.classList.add('active');
    menuOrders.classList.remove('active');
    menuProducts.classList.remove('active');
    customersSection.style.display = 'block';
    ordersSection.style.display = 'none';
    productsSection.style.display = 'none';
    loadCustomers();
  });

  // Abrir Modal para Crear
  btnAddNew.addEventListener('click', () => {
    isEditing = false;
    productForm.reset();
    document.getElementById('formProductId').value = '';
    document.getElementById('productModalLabel').textContent = 'Añadir Nuevo Producto';
    productModal.show();
  });

  // Delegación de eventos para botones de tabla
  tableBody.addEventListener('click', async (e) => {
    const btnEdit = e.target.closest('.btn-edit');
    const btnDelete = e.target.closest('.btn-delete');
    
    // Función EDITAR
    if (btnEdit) {
      const id = parseInt(btnEdit.dataset.id);
      const product = allProducts.find(p => p.id === id);
      if (product) {
        isEditing = true;
        document.getElementById('productModalLabel').textContent = 'Editar Producto';
        document.getElementById('formProductId').value = product.id;
        document.getElementById('formProductName').value = product.name;
        document.getElementById('formProductCategory').value = product.category;
        document.getElementById('formProductPrice').value = product.price;
        document.getElementById('formProductImage').value = product.image;
        document.getElementById('formProductShortDesc').value = product.shortDescription || '';
        document.getElementById('formProductDesc').value = product.description || '';
        document.getElementById('formProductBadge').value = product.badge || '';
        document.getElementById('formProductBadgeColor').value = product.badgeColor || '';
        document.getElementById('formProductStatus').value = product.status;
        productModal.show();
      }
    }
    
    // Función ELIMINAR
    if (btnDelete) {
      const id = parseInt(btnDelete.dataset.id);
      if (confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) {
        try {
          const res = await fetch(API_URL, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          const data = await res.json();
          if (data.success) {
            loadProducts();
          } else {
            alert('Error al eliminar: ' + data.message);
          }
        } catch (err) {
          alert('Error de conexión');
        }
      }
    }
  });

  // Guardar Producto (Crear o Actualizar)
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSave = document.getElementById('btnSaveProduct');
    const originalText = btnSave.innerHTML;
    btnSave.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';
    btnSave.disabled = true;

    const payload = {
      name: document.getElementById('formProductName').value,
      category: document.getElementById('formProductCategory').value,
      price: document.getElementById('formProductPrice').value,
      image: document.getElementById('formProductImage').value,
      shortDescription: document.getElementById('formProductShortDesc').value,
      description: document.getElementById('formProductDesc').value,
      badge: document.getElementById('formProductBadge').value,
      badgeColor: document.getElementById('formProductBadgeColor').value,
      status: document.getElementById('formProductStatus').value
    };

    let method = 'POST';
    if (isEditing) {
      method = 'PUT';
      payload.id = document.getElementById('formProductId').value;
    }

    try {
      const res = await fetch(API_URL, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        productModal.hide();
        loadProducts(); // Recargar la tabla
        // Invalidar el caché frontend general modificando api.js o forzando reload
        window.TorteriaApp.Services.api.getProducts(); // Forzar precarga
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Error de conexión.');
    } finally {
      btnSave.innerHTML = originalText;
      btnSave.disabled = false;
    }
  });

  // Logout
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });

  // Búsqueda en tiempo real
  searchInput.addEventListener('input', filterProducts);
  categoryFilter.addEventListener('change', filterProducts);

  // Init
  renderAdminInfo();
  loadProducts();
});
