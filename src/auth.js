const API = 'http://localhost:8080';
const CHAVE = 'syscor_token';
 
export const getToken = () => localStorage.getItem(CHAVE);
 
export function logout() {
  localStorage.removeItem(CHAVE);
  window.location.href = '/login';
}
 
export async function login(usuario, senha) {  // usuario = e-mail ou login
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Ajustado para enviar 'login' conforme o LoginRequest do AuthController
    body: JSON.stringify({ login: usuario, senha }),
  });
  
  if (!res.ok) throw new Error('Usuário ou senha inválidos');
  
  // Captura o token E a flag primeiroAcesso retornadas pelo back-end
  const data = await res.json();
  
  localStorage.setItem(CHAVE, data.token);
  
  // Retorna os dados completos para que o Login.jsx consiga ler o 'primeiroAcesso'
  return data;
}
 
// Use no lugar de fetch(...) nas telas (Dashboard.jsx, Documental.jsx, ...)
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
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