import { request } from './api';

// ---------------------------------------------------------------- utilitários
/** O backend pode devolver um array simples ou uma Page ({ content: [...] }). */
const comoLista = (r) => (Array.isArray(r) ? r : (r?.content ?? []));

// Aceita número, "4230.45" (formato API) ou "R$ 4.230,45" (formato BR)
const parseMoedaParaNumero = (valorStr) => {
  if (valorStr === null || valorStr === undefined || valorStr === '') return 0;
  if (typeof valorStr === 'number') return Number.isFinite(valorStr) ? valorStr : 0;
  let s = String(valorStr).replace(/[^\d,.-]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.'); // formato BR
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
};

// Primeiro campo de preço > 0 encontrado no objeto
const primeiroPreco = (o = {}) => {
  const candidatos = [
    o.valorVenda, o.valor, o.precoVenda, o.precoBase, o.precoVarejo,
    o.preco, o.valorUnitario, o.produto?.precoBase, o.produto?.preco,
  ];
  for (const c of candidatos) {
    const n = parseMoedaParaNumero(c);
    if (n > 0) return n;
  }
  return 0;
};

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

export const alterarSenha = (senhaAtual, novaSenha) =>
  request('/auth/alterar-senha', { method: 'POST', body: { senhaAtual, novaSenha } });

export const listarFiliais = () => request('/filiais');
export const listarVendedores = () => request('/usuarios');

export async function buscarClientes(busca) {
  const lista = comoLista(await request('/clientes', { params: { busca, size: 8 } }));
  return lista.map((c) => ({ id: c.id, nome: c.nome, doc: c.cpfCnpj }));
}

// ---------------------------------------------------------------- catálogo para o PDV (estoque unificado)
/** Unidades DISPONIVEL de tb_estoque_geral (GET /estoque-geral/disponiveis) */
const buscarDisponiveis = async (busca, limite = 20) =>
  comoLista(await request('/estoque-geral/disponiveis', { params: { busca, filial: '', limite } }));

const ehAcessorio = (s) =>
  Boolean(s.codigoAcessorio) || String(s.categoria || '').toUpperCase() === 'ACESSORIO';

/** Aparelhos (serial/IMEI disponível) com o preço vindo do estoque unificado */
export async function buscarAparelhos(busca) {
  const lista = await buscarDisponiveis(busca, 20);
  return lista
    .filter((s) => !ehAcessorio(s))
    .map((s) => ({
      produtoId: s.id, // id da linha em tb_estoque_geral
      nome: s.modeloComercial || 'Aparelho Vivo',
      imei: s.serial,
      preco: primeiroPreco(s),
      cor: s.cor,
      cat: 'Produto Vivo',
    }))
    .filter((a) => a.imei);
}

/** Acessórios */
export async function buscarAcessorios(busca) {
  const lista = await buscarDisponiveis(busca, 30);
  return lista
    .filter(ehAcessorio)
    .slice(0, 8)
    .map((s) => ({
      produtoId: s.id,
      nome: s.modeloComercial || 'Acessório',
      sku: s.codigoAcessorio || s.serial, // acessório migrado pode não ter código: usa o serial
      preco: primeiroPreco(s),
      requerSerial: false,
    }));
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
  const lista = comoLista(await request('/vendas', { params: filtros }));
  return lista.map(vendaParaLinha);
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