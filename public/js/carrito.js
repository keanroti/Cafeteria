document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();
  if (!user) { window.location.href = 'index.html'; return; }

  document.getElementById('nombreUsuario').textContent = user.nombre;
  renderCart();
});

function renderCart() {
  const cart = getCart();
  const cont = document.getElementById('cartList');
  cont.innerHTML = '';

  if (cart.length === 0) {
    cont.innerHTML = '<div class="muted">No hay productos en el carrito.</div>';
    document.getElementById('summary').textContent = 'Total: $0';
    return;
  }

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';

    // CORRECCIÓN: usar esc() para datos de localStorage
    row.innerHTML = `
      <div>
        <strong>${esc(item.nombre)}</strong>
        <div class="small muted">${money(item.precio)} × ${item.cantidad}</div>
        <div class="small"><b>${money(item.precio * item.cantidad)}</b></div>
      </div>
      <div class="row-actions">
        <button class="btn btn-secondary" style="padding:6px 12px;">−</button>
        <button class="btn btn-secondary" style="padding:6px 12px;">+</button>
        <button class="btn btn-danger"    style="padding:6px 12px;">✕</button>
      </div>
    `;

    const btns = row.querySelectorAll('button');
    btns[0].addEventListener('click', () => { decreaseItem(item.id); renderCart(); });
    btns[1].addEventListener('click', () => { increaseItem(item.id); renderCart(); });
    btns[2].addEventListener('click', () => { removeItem(item.id);   renderCart(); });

    cont.appendChild(row);
  });

  document.getElementById('summary').textContent = `Total: ${money(cartTotal())}`;
}

function vaciarCarrito() { clearCart(); renderCart(); }

async function hacerPedido() {
  const msg = document.getElementById('msg');
  const btn = document.querySelector('[onclick="hacerPedido()"]');
  msg.textContent = '';

  const user = getUser();
  const cart = getCart();

  if (cart.length === 0) { msg.textContent = 'El carrito está vacío.'; return; }
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Enviando…'; }

  try {
    
    const pedidoRes = await authFetch('/pedido', {
      method: 'POST',
      body: JSON.stringify({ usuario_id: user.id, total: cartTotal() })
    });

    
    if (!pedidoRes.ok) {
      
      const errorTexto = await pedidoRes.text();
      console.error("Respuesta del servidor (no es JSON):", errorTexto);
      throw new Error(`Error ${pedidoRes.status}: El servidor no pudo procesar el pedido.`);
    }

    const pedidoData = await pedidoRes.json();
    const pedidoId = pedidoData.pedido_id;

    
    const promesas = cart.map(item => 
      authFetch('/detalle', {
        method: 'POST',
        body: JSON.stringify({ 
          pedido_id: pedidoId, 
          producto_id: item.id, 
          cantidad: item.cantidad, 
          precio_unitario: item.precio 
        })
      })
    );

    const resultados = await Promise.all(promesas);
    const algunoFallo = resultados.some(r => !r.ok);

    if (algunoFallo) {
      throw new Error('El pedido se creó, pero algunos productos no se guardaron correctamente.');
    }

    clearCart();
    window.location.href = 'estado.html';

  } catch (err) {
    msg.innerHTML = `<b style="color:var(--accent2)">⚠️ ${err.message}</b>`;
    console.error('Error detallado:', err);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Hacer pedido'; }
  }
}
