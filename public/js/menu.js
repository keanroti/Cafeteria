// Emojis representativos por defecto según categorías comunes
const FOOD_EMOJIS = ['🍔','🌮','🍕','🍜','🥗','🌯','🍗','☕','🥤','🍰','🍩','🥪','🍱','🌽','🥩'];
let productos = [];

document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  if (!user) { window.location.href = 'index.html'; return; }

  document.getElementById('nombreUsuario').textContent = user.nombre;

  await cargarProductos();

  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', () => {
      const term = search.value.toLowerCase();
      renderProductos(productos.filter(p => p.nombre.toLowerCase().includes(term)));
    });
  }

  updateCartBadge();
});

async function cargarProductos() {
  const cont = document.getElementById('productos');
  cont.innerHTML = '<div class="loading-area"><span class="spinner"></span> Cargando menú…</div>';

  try {
    // CORRECCIÓN: verificar res.ok antes de consumir json
    const res = await fetch('/productos');
    if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
    productos = await res.json();
    renderProductos(productos);
  } catch (err) {
    cont.innerHTML = `<div class="card" style="color:var(--danger);">No se pudo cargar el menú. Intenta de nuevo.</div>`;
    console.error('cargarProductos:', err);
  }
}

function renderProductos(lista) {
  const cont = document.getElementById('productos');
  cont.innerHTML = '';

  if (lista.length === 0) {
    cont.innerHTML = '<div class="card muted">No hay productos disponibles.</div>';
    return;
  }

  lista.forEach((p, i) => {
    const emoji = FOOD_EMOJIS[i % FOOD_EMOJIS.length];
    const card = document.createElement('div');
    card.className = 'card product-card';

    // CORRECCIÓN: usar esc() para evitar XSS en nombre y precio
    card.innerHTML = `
      <div class="product-thumb">${emoji}</div>
      <span class="badge listo">Disponible</span>
      <h3 class="product-title">${esc(p.nombre)}</h3>
      <div class="muted">${money(p.precio)}</div>
      <div class="small muted">Stock: ${esc(p.stock)}</div>
      <button class="btn" style="margin-top:auto;">Agregar al carrito</button>
    `;

    card.querySelector('button').addEventListener('click', () => addToCart(p));
    cont.appendChild(card);
  });
}
