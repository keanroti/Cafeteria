const USER_KEY = 'cafeteria_user';
const CART_KEY = 'cafeteria_cart';

// ── Helpers de sesión ────────────────────────────────────────────────────────
function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; }
  catch { return null; }
}

function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function logout() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(CART_KEY);
  window.location.href = 'index.html';
}

// ── Helper anti-XSS ─────────────────────────────────────────────────────────
// CORRECCIÓN: datos del servidor NO deben inyectarse directamente en innerHTML.
// Usar esc() para escapar cualquier texto que venga de la BD.
function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

// ── Carrito ──────────────────────────────────────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === Number(product.id));
  if (existing) {
    existing.cantidad += 1;
  } else {
    cart.push({ id: Number(product.id), nombre: product.nombre, precio: Number(product.precio), cantidad: 1 });
  }
  saveCart(cart);
  updateCartBadge();
  showToast(`${product.nombre} agregado al carrito`);
}

function increaseItem(id) {
  const cart = getCart();
  const item = cart.find(x => x.id === Number(id));
  if (item) item.cantidad += 1;
  saveCart(cart);
  updateCartBadge();
}

function decreaseItem(id) {
  const cart = getCart();
  const item = cart.find(x => x.id === Number(id));
  if (!item) return;
  item.cantidad -= 1;
  saveCart(cart.filter(x => x.cantidad > 0));
  updateCartBadge();
}

function removeItem(id) {
  saveCart(getCart().filter(x => x.id !== Number(id)));
  updateCartBadge();
}

function clearCart() {
  saveCart([]);
  updateCartBadge();
}

function cartTotal() {
  return getCart().reduce((sum, item) => sum + Number(item.precio) * Number(item.cantidad), 0);
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + Number(item.cantidad), 0);
}

function money(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = cartCount();
}

async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}) 
  };

  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    
    if (response.status === 401 || response.status === 403) {
      console.warn("Sesión expirada o no autorizada. Redirigiendo...");
      logout(); 
      return;
    }

    return response;
  } catch (error) {
    console.error("Error en la petición protegida:", error);
    throw error;
  }
}

// ── Toast ────────────────────────────────────────────────────────────────────
let toastTimer = null;

function showToast(msg) {
  let el = document.getElementById('_toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '_toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ── Dark mode ──────────────────────────────────────────────────────────────── //lo dejo pero ay no se usa xd
function toggleDark() {
  const body = document.body;
  const icon = document.querySelector('.icon');
  body.classList.toggle('dark');
  if (body.classList.contains('dark')) {
    if (icon) icon.textContent = '🌑';
    localStorage.setItem('dark', '1');
  } else {
    if (icon) icon.textContent = '🌤️';
    localStorage.removeItem('dark');
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  const icon = document.querySelector('.icon');
  if (localStorage.getItem('dark')) {
    document.body.classList.add('dark');
    if (icon) icon.textContent = '🌑';
  } else {
    if (icon) icon.textContent = '🌤️';
  }
});

// Exponer globalmente
Object.assign(window, {
  getUser, setUser, logout, esc,
  getCart, saveCart, addToCart, increaseItem, decreaseItem, removeItem, clearCart, cartTotal,
  updateCartBadge, money, showToast, toggleDark,
  authFetch 
});
