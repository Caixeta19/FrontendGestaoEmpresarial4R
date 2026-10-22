import { API_BASE } from './services/api';

const CHAVE = 'syscor_token';

export const getToken = () => localStorage.getItem(CHAVE);

export function logout() {
  localStorage.removeItem(CHAVE);
  window.location.href = '/login';
}

export async function login(usuario, senha) {  // usuario = e-mail ou login
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Campo 'login' conforme o LoginRequest do AuthController
    body: JSON.stringify({ login: usuario, senha }),
  });

  if (!res.ok) throw new Error('Usuário ou senha inválidos');

  // Guarda o token e devolve os dados completos (o Login.jsx lê 'primeiroAcesso')
  const data = await res.json();
  localStorage.setItem(CHAVE, data.token);
  return data;
}

// Use no lugar de fetch(...) nas telas. O path é relativo à API_BASE (já com /api):
// apiFetch('/dashboard'), e não apiFetch('/api/dashboard').
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) {
    logout();
    throw new Error('Sessão expirada');
  }
  return res;
}