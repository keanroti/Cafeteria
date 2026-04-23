document.addEventListener('DOMContentLoaded', async () => {
  // Protección de ruta
  const user = getUser();
  if (!user || user.tipo !== 'cafeteria') {
    window.location.href = 'index.html';
    return;
  }
  document.getElementById('navUser').textContent = `Administrador: ${user.nombre}`;

  console.log(' Admin iniciando...');
  initCursor();
  console.log('✓ Cursor inicializado');
  
  setupTabs();
  console.log('✓ Tabs configurados');
  
  await fetchPedidos();
  console.log('✓ Pedidos cargados');
  
  await fetchProductos();
  console.log('✓ Productos cargados');
  
  await loadCharts();
  console.log('✓ Gráficos cargados');

  
  setInterval(() => fetchPedidos(false), 15000);
  setInterval(() => loadCharts(), 30000);

  document.getElementById('refreshBtn').addEventListener('click', () => {
    fetchPedidos(true);
    showPToast('Sincronizando con el servidor...');
  });
});

// ========== SISTEMA DE TABS ==========
function setupTabs() {
  const tabs = document.querySelectorAll('.cat-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabs.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const tabName = e.target.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      const tab = document.getElementById(`tab-${tabName}`);
      if (tab) {
        tab.classList.add('active');
        if (tabName === 'graficos') loadCharts();
        if (tabName === 'pedidos-historial') fetchHistorial();
      }
    });
  });
}

// ========== PEDIDOS ==========
async function fetchPedidos(animate = true) {
  try {
    const res = await authFetch('/pedidos');
    if (!res.ok) throw new Error('Error de red');
    const pedidos = await res.json();
    
   
    const hoy = new Date().toDateString();
    const totalDia = pedidos
      .filter(p => new Date(p.fecha).toDateString() === hoy && p.estado !== 'cancelado')
      .reduce((sum, p) => sum + Number(p.total), 0);
    
    document.getElementById('dailyTotal').textContent = money(totalDia);
    
    
    const activos = pedidos.filter(p => ['pendiente', 'preparando', 'listo'].includes(p.estado));
    renderPedidosGrid(activos, animate);
  } catch (error) {
    console.error("Error cargando pedidos:", error);
    showPToast('Error al conectar con la base de datos', true);
  }
}

function renderPedidosGrid(pedidos, animate) {
  const grid = document.getElementById('pedidosGrid');
  grid.innerHTML = '';

  if (pedidos.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><div class="icon">✨</div><p>No hay órdenes activas en este momento.</p></div>`;
    return;
  }

  pedidos.forEach((pedido, i) => {
    const card = document.createElement('div');
    card.className = 'admin-card';
    card.dataset.estado = pedido.estado;
    
    const timeString = new Date(pedido.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    card.innerHTML = `
      <div class="admin-header">
        <div>
          <div class="admin-id">#${pedido.id}</div>
          <div class="admin-user">${pedido.usuario_nombre || 'Usuario'}</div>
        </div>
        <div class="label" style="text-align:right;">
          <div>${timeString}</div>
          <div style="color:var(--accent3); margin-top:4px;">${money(pedido.total)}</div>
        </div>
      </div>
      
      <div class="admin-items" id="items-${pedido.id}">
        <span style="color:var(--text3); font-size: 0.75rem;">Cargando detalles...</span>
      </div>

      <div class="admin-actions">
        <select class="action-select" id="status-${pedido.id}">
          <option value="pendiente" ${pedido.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="preparando" ${pedido.estado === 'preparando' ? 'selected' : ''}>Preparando</option>
          <option value="listo" ${pedido.estado === 'listo' ? 'selected' : ''}>Listo para retiro</option>
          <option value="entregado">Marcar Entregado</option>
          <option value="cancelado">Cancelar</option>
        </select>
        <button class="btn btn-primary btn-sm" style="background:var(--surface); color:var(--text); border:1px solid var(--border);" onclick="updateStatus(${pedido.id})">
          Actualizar
        </button>
      </div>
    `;

    grid.appendChild(card);
    loadDetalles(pedido.id);

    if (animate) {
      gsap.to(card, {
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        delay: i * 0.05, 
        ease: 'power2.out'
      });
    } else {
      card.style.opacity = 1;
      card.style.transform = 'translateY(0)';
    }
  });
}

async function loadDetalles(pedidoId) {
  try {
    const res = await authFetch(`/pedido/${pedidoId}`);
    const detalles = await res.json();
    const container = document.getElementById(`items-${pedidoId}`);
    
    container.innerHTML = detalles.map(d => `
      <div class="admin-item-row">
        <span><span style="color:var(--text2)">${d.cantidad}x</span> ${d.nombre}</span>
      </div>
    `).join('');
  } catch (e) {
    console.error("Error detalles", e);
  }
}

async function updateStatus(id) {
  const select = document.getElementById(`status-${id}`);
  const nuevoEstado = select.value;
  
  try {
    const res = await authFetch(`/pedido/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado })
    });
    
    if (!res.ok) throw new Error('Error al actualizar');
    showPToast(`Pedido #${id} actualizado a ${nuevoEstado}`);
    fetchPedidos(true);
  } catch (error) {
    showPToast(error.message, true);
  }
}

// ========== HISTORIAL ==========
async function fetchHistorial() {
  try {
    const res = await authFetch('/pedidos');
    if (!res.ok) throw new Error('Error de red');
    const pedidos = await res.json();
    
    // Filtrar entregados y cancelados
    const historial = pedidos.filter(p => ['entregado', 'cancelado'].includes(p.estado));
    renderHistorialGrid(historial);
  } catch (error) {
    console.error("Error cargando historial:", error);
    showPToast('Error al cargar historial', true);
  }
}

function renderHistorialGrid(pedidos) {
  const grid = document.getElementById('historialGrid');
  grid.innerHTML = '';

  if (pedidos.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><div class="icon">📋</div><p>Sin historial disponible.</p></div>`;
    return;
  }

  pedidos.forEach((pedido, i) => {
    const card = document.createElement('div');
    card.className = 'admin-card';
    card.dataset.estado = pedido.estado;
    
    const timeString = new Date(pedido.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    card.innerHTML = `
      <div class="admin-header">
        <div>
          <div class="admin-id">#${pedido.id}</div>
          <div class="admin-user">${pedido.usuario_nombre || 'Usuario'}</div>
        </div>
        <div class="label" style="text-align:right;">
          <div>${timeString}</div>
          <div style="color:var(--accent3); margin-top:4px;">${money(pedido.total)}</div>
        </div>
      </div>
      
      <div class="admin-items" id="items-hist-${pedido.id}">
        <span style="color:var(--text3); font-size: 0.75rem;">Cargando detalles...</span>
      </div>

      <div style="padding: 12px; background: var(--surface); border-radius: 8px; text-align: center; font-weight: 600; color: ${pedido.estado === 'entregado' ? 'var(--accent3)' : 'var(--accent2)'};">
        ${pedido.estado === 'entregado' ? '✓ Entregado' : '✕ Cancelado'}
      </div>
    `;

    grid.appendChild(card);
    loadDetallesHistorial(pedido.id);

    gsap.to(card, {
      opacity: 1, 
      y: 0, 
      duration: 0.5, 
      delay: i * 0.05, 
      ease: 'power2.out'
    });
  });
}

async function loadDetallesHistorial(pedidoId) {
  try {
    const res = await authFetch(`/pedido/${pedidoId}`);
    const detalles = await res.json();
    const container = document.getElementById(`items-hist-${pedidoId}`);
    
    container.innerHTML = detalles.map(d => `
      <div class="admin-item-row">
        <span><span style="color:var(--text2)">${d.cantidad}x</span> ${d.nombre}</span>
      </div>
    `).join('');
  } catch (e) {
    console.error("Error detalles historial", e);
  }
}

// ========== PRODUCTOS ==========
let editingProductoId = null;

async function fetchProductos() {
  try {
    const res = await authFetch('/admin/productos');
    if (!res.ok) throw new Error('Error de red');
    const productos = await res.json();
    renderProductosGrid(productos);
  } catch (error) {
    console.error("Error cargando productos:", error);
    showPToast('Error al cargar productos', true);
  }
}

function renderProductosGrid(productos) {
  const grid = document.getElementById('productosGrid');
  grid.innerHTML = '';

  if (productos.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><div class="icon">🍔</div><p>Sin productos. Crea el primero.</p></div>`;
    return;
  }

  productos.forEach((prod, i) => {
    const card = document.createElement('div');
    card.className = 'admin-card producto-card';
    card.dataset.estado = prod.disponible ? 'sí' : 'no';
    
    card.innerHTML = `
      <div class="admin-header">
        <div>
          <div class="admin-id" style="color: var(--accent3);">${prod.nombre}</div>
          <div class="admin-user">Stock: ${prod.stock} unidades</div>
        </div>
        <div class="label" style="text-align:right;">
          <div style="font-size: 1.6rem; font-weight: 800; color: var(--accent3);">${money(prod.precio)}</div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <button class="btn btn-primary btn-sm" onclick="editProducto(${prod.id})">✏️ Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProducto(${prod.id})">🗑️ Eliminar</button>
      </div>
      <button class="btn btn-ghost btn-sm" style="width: 100%;" onclick="toggleProductoDisponible(${prod.id}, ${prod.disponible})">
        ${prod.disponible ? '✓ Disponible en Menú' : '✕ No disponible'}
      </button>
    `;

    grid.appendChild(card);

    gsap.to(card, {
      opacity: 1, 
      y: 0, 
      duration: 0.5, 
      delay: i * 0.05, 
      ease: 'power2.out'
    });
  });
}

function openProductoModal() {
  editingProductoId = null;
  document.getElementById('modalTitle').textContent = 'Nuevo Producto';
  document.getElementById('prodNombre').value = '';
  document.getElementById('prodPrecio').value = '';
  document.getElementById('prodStock').value = '';
  document.getElementById('prodDisponible').checked = true;
  document.getElementById('productoModal').classList.add('active');
}

function closeProductoModal() {
  document.getElementById('productoModal').classList.remove('active');
  editingProductoId = null;
}

async function editProducto(id) {
  try {
    const res = await authFetch('/admin/productos');
    const productos = await res.json();
    const prod = productos.find(p => p.id === id);
    
    if (!prod) throw new Error('Producto no encontrado');
    
    editingProductoId = id;
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    document.getElementById('prodNombre').value = prod.nombre;
    document.getElementById('prodPrecio').value = prod.precio;
    document.getElementById('prodStock').value = prod.stock;
    document.getElementById('prodDisponible').checked = prod.disponible == 1;
    document.getElementById('productoModal').classList.add('active');
  } catch (error) {
    showPToast(error.message, true);
  }
}

async function saveProducto() {
  const nombre = document.getElementById('prodNombre').value.trim();
  const precio = parseFloat(document.getElementById('prodPrecio').value);
  const stock = parseInt(document.getElementById('prodStock').value) || 0;
  const disponible = document.getElementById('prodDisponible').checked;

  if (!nombre || isNaN(precio) || precio < 0) {
    showPToast('Completa los campos correctamente', true);
    return;
  }

  try {
    const method = editingProductoId ? 'PUT' : 'POST';
    const endpoint = editingProductoId ? `/admin/productos/${editingProductoId}` : '/admin/productos';

    const res = await authFetch(endpoint, {
      method,
      body: JSON.stringify({ nombre, precio, stock, disponible })
    });

    if (!res.ok) throw new Error('Error al guardar');

    showPToast(`Producto ${editingProductoId ? 'actualizado' : 'creado'} correctamente`);
    closeProductoModal();
    await fetchProductos();
  } catch (error) {
    showPToast(error.message, true);
  }
}

async function deleteProducto(id) {
  if (!confirm('¿Eliminar este producto?')) return;

  try {
    const res = await authFetch(`/admin/productos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar');
    showPToast('Producto eliminado');
    await fetchProductos();
  } catch (error) {
    showPToast(error.message, true);
  }
}

async function toggleProductoDisponible(id, currentState) {
  try {
    const res = await authFetch('/admin/productos');
    const productos = await res.json();
    const prod = productos.find(p => p.id === id);
    
    if (!prod) throw new Error('Producto no encontrado');

    const updateRes = await authFetch(`/admin/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nombre: prod.nombre,
        precio: prod.precio,
        stock: prod.stock,
        disponible: !currentState
      })
    });

    if (!updateRes.ok) throw new Error('Error al actualizar');
    showPToast(`Producto ${!currentState ? 'habilitado' : 'deshabilitado'}`);
    await fetchProductos();
  } catch (error) {
    showPToast(error.message, true);
  }
}

// ========== GRÁFICOS ==========
let chartVentas = null;
let chartProductos = null;

async function loadCharts() {
  try {
    const res = await authFetch('/pedidos');
    if (!res.ok) throw new Error('Error de red');
    const pedidos = await res.json();

    
    const entregados = pedidos.filter(p => p.estado === 'entregado');

    
    const totalEntregados = entregados.length;
    const ingresoTotal = entregados.reduce((sum, p) => sum + Number(p.total), 0);
    const ticketPromedio = totalEntregados > 0 ? ingresoTotal / totalEntregados : 0;

    document.getElementById('statsOrdenesCompletas').textContent = totalEntregados;
    document.getElementById('statsIngresoTot').textContent = money(ingresoTotal);
    document.getElementById('statsTicketProm').textContent = money(ticketPromedio);

    
    await loadChartVentas(entregados);

    
    loadChartProductosPorStock();
  } catch (error) {
    console.error("Error cargando gráficos:", error);
  }
}

async function loadChartVentas(pedidos) {
  // Agrupar por día
  const ventasPorDia = {};
  
  pedidos.forEach(p => {
    const fecha = new Date(p.fecha).toLocaleDateString('es-CO');
    ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + Number(p.total);
  });

  const labels = Object.keys(ventasPorDia).slice(-7); // Últimos 7 días
  const data = labels.map(fecha => ventasPorDia[fecha]);

  const ctx = document.getElementById('chartVentas');
  if (!ctx) return;

  if (chartVentas) chartVentas.destroy();

  chartVentas = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Ventas ($)',
        data,
        backgroundColor: 'rgba(124, 92, 252, 0.6)',
        borderColor: 'rgba(124, 92, 252, 1)',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { color: 'var(--text2)' }, grid: { color: 'var(--border)' } },
        x: { ticks: { color: 'var(--text2)' }, grid: { display: false } }
      }
    }
  });
}

async function loadChartProductosPorStock() {
  
  try {
    const res = await authFetch('/admin/productos');
    if (!res.ok) throw new Error('Error al cargar productos');
    const productos = await res.json();

    
    const top5 = productos
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5);

    const labels = top5.map(p => p.nombre);
    const data = top5.map(p => p.stock);

    const ctx = document.getElementById('chartProductos');
    if (!ctx) return;

    if (chartProductos) chartProductos.destroy();

    chartProductos = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            'rgba(124, 92, 252, 0.7)',
            'rgba(165, 143, 254, 0.7)',
            'rgba(255, 200, 80, 0.7)',
            'rgba(255, 107, 107, 0.7)',
            'rgba(100, 200, 150, 0.7)'
          ],
          borderColor: 'var(--card)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: 'var(--text2)', padding: 12 } }
        }
      }
    });
  } catch (error) {
    console.error("Error cargando gráfico de productos:", error);
  }
}

// ========== UTILIDADES UI ==========
function initCursor() {
  const dot = document.getElementById('cursor-dot'), ring = document.getElementById('cursor-ring');
  if (!dot || !ring) {
    console.warn('⚠️ Elementos del cursor no encontrados');
    return;
  }
  
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => { 
    mx=e.clientX; 
    my=e.clientY; 
    dot.style.left=mx+'px'; 
    dot.style.top=my+'px'; 
  });
  
  (function lerp(){ 
    rx+=(mx-rx)*0.15; 
    ry+=(my-ry)*0.15; 
    ring.style.left=rx+'px'; 
    ring.style.top=ry+'px'; 
    requestAnimationFrame(lerp); 
  })();
  
  const selectores = 'button, select, .btn, a, input[type="checkbox"]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.matches(selectores)) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.matches(selectores)) {
      document.body.classList.remove('cursor-hover');
    }
  });
  
  console.log('✓ Cursor magnético activado');
}

function showPToast(msg, isError=false) {
  const container = document.getElementById('toastContainer');
  if(!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast-item';
  if(isError) toast.style.borderLeftColor = 'var(--accent2)';
  toast.innerHTML = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 2800);
}