import { clientesDemo } from '../data/demoData';
import { encerrarSessaoExpirada, lerToken } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

async function http(path, options = {}) {
  const token = lerToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401) encerrarSessaoExpirada();
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `Erro ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

// ---------- modo demo (localStorage) ----------
const LS = 'syscor_clientes';

const lerDemo = () => {
  try {
    const s = JSON.parse(localStorage.getItem(LS));
    if (s) return s;
  } catch {}
  return (clientesDemo || []).map((c) => ({
    id: String(c.id),
    nome: c.nome,
    doc: c.doc || c.documento || c.cpf || c.cnpj || '—',
    celular: c.celular || c.telefone || '',
    telefone: c.telefone || '',
    email: c.email || '',
    pdv: c.pdv || 'CE - CANINDE',
    cidade: c.cidade || 'Luziânia',
    estado: c.estado || 'GO',
    dataCadastro: c.data || '25/09/2026',
  }));
};

const gravarDemo = (l) => localStorage.setItem(LS, JSON.stringify(l));

const demo = {
  async listar({ nome, documento, telefone, pdv, page, size }) {
    const dig = (s) => (s || '').replace(/\D/g, '');
    const f = lerDemo().filter(
      (c) =>
        (!pdv || pdv === 'Todos' || (c.pdv || '').toUpperCase() === pdv.toUpperCase()) &&
        (!nome || String(c.nome || '').toLowerCase().includes(nome.toLowerCase().trim())) &&
        (!dig(documento) || dig(c.doc).includes(dig(documento))) &&
        (!dig(telefone) || dig(c.celular || c.telefone).includes(dig(telefone)))
    );
    return {
      content: f.slice(page * size, page * size + size),
      totalElements: f.length,
      totalPages: Math.ceil(f.length / size) || 1,
    };
  },
  async salvar(id, dados) {
    const l = lerDemo();
    if (id) {
      gravarDemo(l.map((c) => (c.id === id ? { ...c, ...dados, id } : c)));
      return;
    }
    gravarDemo([
      { ...dados, id: String(Date.now()).slice(-6), dataCadastro: new Date().toLocaleDateString('pt-BR') },
      ...l,
    ]);
  },
  async remover(id) {
    gravarDemo(lerDemo().filter((c) => c.id !== id));
  },
};

// ---------- API pública ----------
export const clientesApi = {
  listar(filtros, page = 0, size = 10) {
    if (DEMO) return demo.listar({ ...filtros, page, size });
    const qs = new URLSearchParams({ page, size });
    ['nome', 'documento', 'telefone'].forEach((k) => {
      if (filtros[k]) qs.set(k, filtros[k]);
    });
    if (filtros.pdv && filtros.pdv !== 'Todos') qs.set('pdv', filtros.pdv);
    return http(`/clientes?${qs}`);
  },
  salvar(id, dados) {
    if (DEMO) return demo.salvar(id, dados);
    return id
      ? http(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
      : http('/clientes', { method: 'POST', body: JSON.stringify(dados) });
  },
  remover(id) {
    return DEMO ? demo.remover(id) : http(`/clientes/${id}`, { method: 'DELETE' });
  },
};