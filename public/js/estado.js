// CORRECCIÓN: guardar referencia al interval para poder limpiarlo
let intervaloEstado = null;

document.addEventListener('DOMContentLoaded', () => {
  const usuario = getUser();
  if (!usuario) { window.location.href = 'index.html'; return; }

  document.getElementById('nombreUsuario').textContent = usuario.nombre;

  cargarPedidos();
  intervaloEstado = setInterval(cargarPedidos, 5000);
});

// CORRECCIÓN: limpiar interval al salir de la página
window.addEventListener('beforeunload', () => {
  if (intervaloEstado) clearInterval(intervaloEstado);
});

async function verDetalle(id, contenedor) {
  contenedor.innerHTML = '<div class="loading-area" style="padding:10px;"><span class="spinner" style="border-top-color:var(--primary);border-color:rgba(0,0,0,.1);"></span></div>';
  const res  = await fetch(`/pedido/${id}`);
  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    contenedor.innerHTML = '<div class="small muted">Sin detalle.</div>';
    return;
  }

  contenedor.innerHTML = data.map(item => `
    <div class="small" style="padding:6px 0; border-bottom:1px solid var(--border);">
      <b>${esc(item.nombre)}</b> × ${esc(item.cantidad)}
      <span class="muted"> — ${money(item.precio_unitario)}</span>
    </div>
  `).join('');
}

async function cargarPedidos() {
  const usuario = getUser();
  const res  = await fetch(`/pedido-usuario/${usuario.id}`);
  const data = await res.json();

  const cont = document.getElementById('pedidos');
  cont.innerHTML = '';

  if (!Array.isArray(data) || data.length === 0) {
    cont.innerHTML = '<div class="muted">Todavía no tienes pedidos.</div>';
    return;
  }

  data.forEach(p => {
    const card     = document.createElement('div');
    card.className = 'card';
    card.style.marginBottom = '14px';

    const detalleBox = document.createElement('div');
    detalleBox.style.marginTop = '10px';

    card.innerHTML = `
      <div class="status-line">
        <div>
          <strong>Pedido #${esc(p.id)}</strong>
          <div class="small muted">${new Date(p.fecha).toLocaleString('es-CO')}</div>
        </div>
        <span class="badge ${esc(p.estado)}">${esc(p.estado)}</span>
      </div>
      <div class="small" style="margin-top:8px;">Total: <b>${money(p.total)}</b></div>
      <div class="btn-group" style="margin-top:12px;">
        <button class="btn btn-secondary">Ver detalle</button>
      </div>
    `;

    const btn = card.querySelector('button');
    btn.addEventListener('click', async () => {
      if (detalleBox.innerHTML.trim() === '') {
        await verDetalle(p.id, detalleBox);
        btn.textContent = 'Ocultar detalle';
      } else {
        detalleBox.innerHTML = '';
        btn.textContent = 'Ver detalle';
      }
    });

    card.appendChild(detalleBox);
    cont.appendChild(card);
  });
}
