document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('loginBtn');
  if (btn) btn.addEventListener('click', login);
});

async function login() {
  const email = document.getElementById('email').value.trim();
  const msg = document.getElementById('msg');

  if (!email) {
    msg.textContent = 'Escribe tu correo.';
    return;
  }

  msg.textContent = '';

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await res.json();

  if (!res.ok) {
    msg.textContent = data.error || 'No se pudo iniciar sesión.';
    return;
  }

  setUser(data);

  if (data.tipo === 'cafeteria') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'menu.html';
  }
}