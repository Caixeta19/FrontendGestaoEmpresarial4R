import { request, ApiError } from './api';

// ---------------------------------------------------------------- utilitários
/** O backend pode devolver um array simples ou uma Page ({ content: [...] }). */
const comoLista = (r) => (Array.isArray(r) ? r : (r?.content ?? []));

const numeroOuNull = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

// ---------------------------------------------------------------- formatação (compartilhada pelas telas)
const moedaBR = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatarMoeda = (v) => moedaBR.format(Number(v) || 0);

/** "2026-11-01" (LocalDate) -> "01/11/2026". Sem passar por Date para não deslocar o fuso. */
export const formatarData = (iso) => {
  if (!iso) return '—';
  const [a, m, d] = String(iso).slice(0, 10).split('-');
  return a && m && d ? `${d}/${m}/${a}` : String(iso);
};

/** Instant ISO -> "01/11/2026 14:32" no horário local. */
export const formatarDataHora = (iso) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).replace(',', '') : '—';

const ROTULOS_GRUPO = {
  PRE: 'Pré',
  CONTROLE_BTL: 'Controle BTL',
  CONTROLE_ENTRADA: 'Controle Entrada',
  CONTROLE_ALTO_VALOR: 'Controle Alto Valor',
  POS_INDIVIDUAL: 'Pós Individual',
  FAMILIA_2: 'Família 2',
  FAMILIA_3: 'Família 3',
  FAMILIA_4_5: 'Família 4/5',
  VIVO_V: 'Vivo V',
  MULTIVIVO: 'MultiVivo',
  VIM_8GB: 'VIM 8GB',
  VIM_14GB: 'VIM 14GB',
  VIM_20GB: 'VIM 20GB',
  VIM_40GB: 'VIM 40GB',
  VIM_100GB: 'VIM 100GB',
  SEM_PLANO: 'Sem plano',
};
/** Código do grupo do plano (CONTROLE_ALTO_VALOR) -> rótulo de tela (Controle Alto Valor). */
export const rotuloGrupo = (g) => (g ? ROTULOS_GRUPO[g] || String(g).replace(/_/g, ' ') : '—');

export const rotuloTabela = (t) => (t === 'RENOVA' ? 'Renova' : t === 'REGULAR' ? 'Regular' : '—');

// ---------------------------------------------------------------- formas de pagamento
export const FORMA_ENUM = {
  'Cartão de Crédito': 'CARTAO_CREDITO',
  'Cartão de Débito': 'CARTAO_DEBITO',
  'PIX': 'PIX',
  'Vivo Pay': 'VIVO_PAY',
  'Dinheiro': 'DINHEIRO',
  'Boleto Bancário / Convênio': 'BOLETO',
  'Voucher': 'VOUCHER',
};
const FORMA_ROTULO = Object.fromEntries(Object.entries(FORMA_ENUM).map(([r, e]) => [e, r]));

// ---------------------------------------------------------------- condição de pagamento
export const PARCELAS_FINANCIADAS = [13, 14, 15, 16, 17, 18, 19, 20, 21];
export const condicaoParcelada = (n) => `PARCELADO_${n}`;
export const ehParcelado = (condicao) => String(condicao || '').startsWith('PARCELADO_');

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

/** Acessório = tem código de acessório (null, vazio e "-" não contam). Todo o resto é aparelho. */
const temCodigoAcessorio = (s) => {
  const c = String(s.codigoAcessorio ?? '').trim();
  return c !== '' && c !== '-' && c !== "''";
};

/** Aparelhos (serial/IMEI disponível). precoReferencia = valor REGULAR/PRÉ do estoque, só informativo. */
export async function buscarAparelhos(busca) {
  const lista = await buscarDisponiveis(busca, 20);
  return lista
    .filter((s) => !temCodigoAcessorio(s))
    .map((s) => ({
      produtoId: s.id, // id da linha em tb_estoque_geral
      nome: s.modeloComercial,
      cor: s.cor,
      marca: s.marca,
      imei: s.serial,
      filial: s.filialEstoque,
      precoReferencia: Number(s.valorVenda ?? 0),
    }))
    .filter((a) => a.imei);
}

/** Acessórios. O preço de venda vem de consultarPreco (grupo SEM_PLANO). */
export async function buscarAcessorios(busca) {
  const lista = await buscarDisponiveis(busca, 30);
  return lista
    .filter(temCodigoAcessorio)
    .slice(0, 8)
    .map((s) => ({
      produtoId: s.id,
      nome: s.modeloComercial || 'Acessório',
      sku: s.codigoAcessorio,
      precoReferencia: Number(s.valorVenda ?? 0),
      requerSerial: false,
    }));
}

// ---------------------------------------------------------------- tabela de preços da Telefônica
/** Planos da tabela vigente: [{ nomePlano, grupoPlano, sistema, disponivelAlta }] */
export async function listarPlanos(busca, disponivelAlta) {
  return comoLista(await request('/produtos/precos/planos', { params: { busca, disponivelAlta } }));
}

/**
 * Preço de uma unidade do estoque na tabela vigente.
 * Sempre na Tabela Regular (não envia "tabela"). Sem plano = pré-pago/sem plano (o backend resolve o grupo). Sem pagamento = preço cheio.
 * 422 (item sem preço) não lança erro: devolve { semPreco: true, mensagem }.
 */
export async function consultarPreco({ estoqueId, plano, pagamento, parcelas } = {}) {
  try {
    const r = await request('/produtos/precos/item', { params: { estoqueId, plano, pagamento, parcelas } });
    const parcelasLista = Object.entries(r?.parcelas || {})
      .map(([n, valor]) => ({ n: Number(n), valor: Number(valor) }))
      .filter((p) => Number.isFinite(p.n))
      .sort((a, b) => a.n - b.n);
    return {
      semPreco: false,
      nomeComercial: r?.nomeComercial,
      tabela: r?.tabela,
      grupoPlano: r?.grupoPlano,
      preco: numeroOuNull(r?.preco),
      precoPix: numeroOuNull(r?.precoPix),
      parcelas: parcelasLista,
      valorAplicado: numeroOuNull(r?.valorAplicado),
      vigencia: r?.vigencia,
    };
  } catch (e) {
    if (e instanceof ApiError && e.status === 422) {
      return { semPreco: true, mensagem: e.mensagem || 'Item sem preço na tabela vigente.' };
    }
    throw e;
  }
}

/** Execução vigente: { execucaoId, vigencia, importadoEm, nomeArquivo, totais }. null se nunca houve importação (422). */
export async function precoVigente() {
  try {
    return await request('/produtos/precos/vigente');
  } catch (e) {
    if (e instanceof ApiError && (e.status === 422 || e.status === 404)) return null;
    throw e;
  }
}

/** Upload da planilha (.xlsx) da Telefônica. Devolve o relatório da importação. */
export function importarTabelaPreco(arquivo) {
  const fd = new FormData();
  fd.append('arquivo', arquivo);
  return request('/produtos/precos/importar-telefonica', { method: 'POST', body: fd });
}

// ---------------------------------------------------------------- vendas
export const buscarVenda = (id) => request(`/vendas/${id}`);
export const abrirVenda = (corpo) => request('/vendas', { method: 'POST', body: corpo });
export const atualizarInicio = (id, corpo) => request(`/vendas/${id}`, { method: 'PUT', body: corpo });
export const adicionarItem = (id, corpo) => request(`/vendas/${id}/itens`, { method: 'POST', body: corpo });
export const removerItem = (id, itemId) => request(`/vendas/${id}/itens/${itemId}`, { method: 'DELETE' });
export const adicionarPagamento = (id, corpo) => request(`/vendas/${id}/pagamentos`, { method: 'POST', body: corpo });
export const removerPagamento = (id, pgId) => request(`/vendas/${id}/pagamentos/${pgId}`, { method: 'DELETE' });
/** Liga/desliga a TABELA RENOVA nos aparelhos (exige voucher lançado). Devolve a venda reprecificada. */
export const aplicarRenova = (id, ativo) => request(`/vendas/${id}/renova`, { method: 'PATCH', body: { ativo } });
/** Troca a condição e devolve a venda reprecificada. 422 traz pagamentosIncompativeis em ApiError.corpo. */
export const alterarCondicao = (id, condicao) =>
  request(`/vendas/${id}/condicao-pagamento`, { method: 'PATCH', body: { condicao } });
/** Em PARCELADO_N, cria ou atualiza a linha FINANCIADO com o saldo. */
export const financiarSaldo = (id) => request(`/vendas/${id}/financiar`, { method: 'POST' });
/** Todas as condições com as entradas já lançadas. economiaOuJuros: negativo = desconto PIX, positivo = juros. */
export async function simularPagamento(id) {
  const lista = await request(`/vendas/${id}/simulacao-pagamento`);
  return (lista || []).map((s) => ({
    condicao: s.condicao,
    total: Number(s.total),
    parcelas: Number(s.parcelas),
    valorParcela: Number(s.valorParcela),
    economiaOuJuros: Number(s.economiaOuJuros),
  }));
}
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
    valorChip: numeroOuNull(i.valorChip),
    descontoChip: numeroOuNull(i.descontoChip),
    grupoPlano: i.grupoPlano || null,
    tabelaAplicada: i.tabelaPrecoAplicada || i.tabelaAplicada || null,
    descontoFabricante: numeroOuNull(i.descontoFabricante),
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

export function pagamentoParaTela(p) {
  const parcelas = p.parcelas || 1;
  const credito = p.forma === 'CARTAO_CREDITO';
  const voucher = p.forma === 'VOUCHER';
  const rotulo = p.tipo === 'FINANCIADO' ? 'Financiado no cartão' : FORMA_ROTULO[p.forma] || p.forma;
  return {
    id: p.id,
    formaEnum: p.forma,
    tipo: p.tipo || 'PAGAMENTO',
    forma: `${rotulo}${credito ? ` (${parcelas}x)` : ''}${voucher && p.codigoVoucher ? ` · ${p.codigoVoucher}` : ''}`,
    detalhes: credito ? `${parcelas}x` : 'À vista',
    valor: Number(p.valor),
    codigoVoucher: p.codigoVoucher || null,
  };
}

/** VendaResponseDTO -> estado usado pelo Venda.jsx */
export function vendaParaTela(v) {
  const itensPorCategoria = { PRODUTO_VIVO: [], SERVICO_VIVO: [], ACESSORIO: [], RECARGA: [] };
  (v.itens || []).forEach((i) => (itensPorCategoria[i.categoria] ||= []).push(itemParaTela(i)));
  return {
    numero: pad(v.numeroVenda),
    itensPorCategoria,
    pagamentos: (v.pagamentos || []).map(pagamentoParaTela),
    valorTotal: numeroOuNull(v.valorTotal), // total calculado pelo backend (não recalcular no front)
    saldo: numeroOuNull(v.saldo),           // valorTotal − pagamentos (negativo = pagamentos acima do total)
    aviso: v.aviso || null,
    renova: Boolean(v.renova),
    descontoFabricante: numeroOuNull(v.descontoFabricante),
    condicaoPagamento: v.condicaoPagamento || 'A_VISTA',
    parcelasCondicao: numeroOuNull(v.parcelasCondicao),
    valorParcela: numeroOuNull(v.valorParcela), // financiado ÷ N no parcelado; total ÷ parcelas nas demais
    valorItens: numeroOuNull(v.valorItens),     // preço cheio, sem juros nem desconto PIX
    ajusteCondicao: numeroOuNull(v.ajusteCondicao), // valorTotal − valorItens: negativo = desconto PIX, positivo = juros
  };
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