import { request } from './api';

// ---------------------------------------------------------------- formas de pagamento
export const FORMA_ENUM = {
  'Cartão de Crédito': 'CARTAO_CREDITO',
  'Cartão de Débito': 'CARTAO_DEBITO',
  'PIX': 'PIX',
  'Dinheiro': 'DINHEIRO',
  'Boleto Bancário / Convênio': 'BOLETO',
};
const FORMA_ROTULO = Object.fromEntries(Object.entries(FORMA_ENUM).map(([r, e]) => [e, r]));

const pad = (n) => String(n ?? '').padStart(6, '0');
const dataHora = (iso) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).replace(',', '') : '';

// ---------------------------------------------------------------- acesso / cadastros
export const login = (email, senha) => request('/auth/login', { method: 'POST', body: { email, senha } });

// Passa pelo request(): usa API_BASE (com /api), o token e o tratamento de erro padrão.
export const alterarSenha = (senhaAtual, novaSenha) =>
  request('/auth/alterar-senha', { method: 'POST', body: { senhaAtual, novaSenha } });

export const listarFiliais = () => request('/filiais');
export const listarVendedores = () => request('/usuarios');

export async function buscarClientes(busca) {
  const page = await request('/clientes', { params: { busca, size: 8 } });
  return (page?.content ?? []).map((c) => ({ id: c.id, nome: c.nome, doc: c.cpfCnpj }));
}

// ---------------------------------------------------------------- catálogo para o PDV
/** Aparelhos (serial/IMEI disponível) no formato que a tela já consome. */
export async function buscarAparelhos(busca) {
  const lista = await request('/estoque/seriais', { params: { busca, limite: 20 } });
  return (lista ?? [])
    .filter((s) => s.categoria === 'PRODUTO_VIVO')
    .map((s) => ({ produtoId: s.produtoId, nome: s.descricao, imei: s.serialImei, preco: Number(s.precoBase), cat: 'Produto Vivo' }));
}

export async function buscarAcessorios(busca) {
  const lista = await request('/produtos', { params: { busca, categoria: 'ACESSORIO' } });
  return (lista ?? [])
    .slice(0, 8)
    .map((p) => ({ produtoId: p.id, nome: p.descricao, sku: p.sku, preco: Number(p.precoBase), requerSerial: p.requerSerial }));
}

// ---------------------------------------------------------------- vendas
export const buscarVenda = (id) => request(`/vendas/${id}`);
export const abrirVenda = (corpo) => request('/vendas', { method: 'POST', body: corpo });
export const atualizarInicio = (id, corpo) => request(`/vendas/${id}`, { method: 'PUT', body: corpo });
export const adicionarItem = (id, corpo) => request(`/vendas/${id}/itens`, { method: 'POST', body: corpo });
export const removerItem = (id, itemId) => request(`/vendas/${id}/itens/${itemId}`, { method: 'DELETE' });
export const adicionarPagamento = (id, corpo) => request(`/vendas/${id}/pagamentos`, { method: 'POST', body: corpo });
export const removerPagamento = (id, pgId) => request(`/vendas/${id}/pagamentos/${pgId}`, { method: 'DELETE' });
export const finalizar = (id, credenciais) =>
  request(`/vendas/${id}/finalizar`, { method: 'PATCH', body: { autenticacaoVendedor: credenciais } });
export const mudarStatus = (id, novoStatus, credenciais) =>
  request(`/vendas/${id}/status`, { method: 'PATCH', body: { novoStatus, autenticacaoUsuario: credenciais } });

export async function listarVendas(filtros = {}) {
  const lista = await request('/vendas', { params: filtros });
  return (lista ?? []).map(vendaParaLinha);
}

// ---------------------------------------------------------------- adaptadores (API -> telas)
function itemParaTela(i) {
  const servico = i.categoria === 'SERVICO_VIVO';
  const chip = i.clientePossuiSimcard ? ' · Chip Próprio' : i.simcard4g ? ` · ICCID: ${i.simcard4g}` : '';
  return {
    id: i.id,
    categoria: i.categoria,
    descricao: i.descricaoProduto,
    imeiOuSerial: servico
      ? `Linha: (${i.ddd || ''}) ${i.numeroAcesso || ''}${chip}${i.sistemaOrigem ? ` · Origem: ${i.sistemaOrigem}` : ''}`
      : i.serialImei || '—',
    numeroLinha: !servico && i.numeroAcesso ? `Linha: ${i.numeroAcesso}` : '',
    quantidade: Number(i.quantidade),
    valorUnitario: Number(i.valorUnitario),
    valorTotal: Number(i.valorTotalItem),
    mensalidadeFatura: servico ? Number(i.valorAdicional) || 0 : 0,
    detalhes: {
      servico: i.tipoServico,
      planoAtivo: i.plano,
      planoAntigo: i.planoAntigo,
      planoNovo: i.plano,
      mensalidade: i.valorAdicional,
      linha: i.numeroAcesso,
      vencimento: i.vencimentoFatura,
    },
  };
}

function pagamentoParaTela(p) {
  const parcelas = p.parcelas || 1;
  const credito = p.forma === 'CARTAO_CREDITO';
  return {
    id: p.id,
    forma: `${FORMA_ROTULO[p.forma] || p.forma}${credito ? ` (${parcelas}x)` : ''}`,
    detalhes: credito ? `${parcelas}x` : 'À vista',
    valor: Number(p.valor),
  };
}

/** VendaResponseDTO -> estado usado pelo Venda.jsx */
export function vendaParaTela(v) {
  const itensPorCategoria = { PRODUTO_VIVO: [], SERVICO_VIVO: [], ACESSORIO: [], RECARGA: [] };
  (v.itens || []).forEach((i) => (itensPorCategoria[i.categoria] ||= []).push(itemParaTela(i)));
  return { numero: pad(v.numeroVenda), itensPorCategoria, pagamentos: (v.pagamentos || []).map(pagamentoParaTela) };
}

/** VendaResponseDTO -> linha das listagens (Vendas do dia / Buscar vendas) */
export function vendaParaLinha(v) {
  return {
    vendaId: v.id,
    id: pad(v.numeroVenda),
    numeroVenda: v.numeroVenda,
    data: dataHora(v.criadoEm),
    filial: v.filialNome,
    vendedor: v.vendedorNome,
    cliente: v.clienteNome,
    nf: v.numeroNota || '—',
    status: v.status,
    valorTotal: Number(v.valorTotal),
  };
}