import { request, ApiError, API_BASE, lerToken, encerrarSessaoExpirada } from './api';

// ---------------------------------------------------------------- valores do backend
/** Literais do enum StatusAvaliacaoProcedencia, com os rótulos de tela. */
export const STATUS_BKO = [
  { valor: 'Nao_avaliado', rotulo: 'Não avaliado' },
  { valor: 'Em_avaliacao_pelo_BKO', rotulo: 'Em avaliação pelo BKO' },
  { valor: 'Procedente', rotulo: 'Procedente' },
  { valor: 'Improcedente', rotulo: 'Improcedente' },
];
export const rotuloStatusBko = (v) => STATUS_BKO.find((s) => s.valor === v)?.rotulo || v || '—';

/** Literais do enum TipoPlano. */
export const TIPOS_PLANO = [
  { valor: 'CONTROLE', rotulo: 'Controle' },
  { valor: 'POS', rotulo: 'Pós' },
  { valor: 'PRE', rotulo: 'Pré' },
];

const ROTULOS_STATUS_VENDA = { CONCLUIDA: 'LANÇADA', CANCELADA: 'CANCELADA', ABERTA: 'ABERTA' };
export const rotuloStatusVenda = (s) => ROTULOS_STATUS_VENDA[s] || s || '—';

// ---------------------------------------------------------------- filtros
const lista = (v) => (Array.isArray(v) && v.length ? v.join(',') : undefined);
const texto = (v) => (v === undefined || v === null || String(v).trim() === '' ? undefined : String(v).trim());

/** Filtros da tela -> parâmetros de /documental/protocolos/busca e /exportacao. Vazios não são enviados. */
function parametros(f = {}) {
  const numeroVenda = texto(f.numeroVenda)?.replace(/\D/g, '');
  return {
    dataInicio: texto(f.dataInicio),
    dataFim: texto(f.dataFim),
    filialIds: lista(f.filialIds),
    vendedorId: texto(f.vendedorId),
    numeroVenda: numeroVenda || undefined,
    numeroAcesso: texto(f.numeroAcesso),
    numeroProtocoloGed: texto(f.numeroProtocoloGed),
    liderEquipe: texto(f.liderEquipe),
    statusBko: texto(f.statusBko),
    tiposPlano: lista(f.tiposPlano),
    servicos: lista(f.servicos),
    incluirCanceladas: f.incluirCanceladas ? 'true' : undefined,
  };
}

// ---------------------------------------------------------------- chamadas
/** Busca paginada: { itens, total, pagina, totalPaginas }. Sem resultado é lista vazia (o backend não devolve 404). */
export async function buscar(filtros, { page = 0, size = 20 } = {}) {
  const r = await request('/documental/protocolos/busca', { params: { ...parametros(filtros), page, size } });
  return {
    itens: r?.content ?? [],
    total: r?.page?.totalElements ?? 0,
    pagina: r?.page?.number ?? 0,
    totalPaginas: r?.page?.totalPages ?? 0,
  };
}

/** Quantas vendas os filtros encontram, sem trazer a lista (size=1). */
export const contar = async (filtros) => (await buscar(filtros, { size: 1 })).total;

/** {vendaId} é o id da venda, não o numeroVenda. */
export const buscarPorVenda = (vendaId) => request(`/documental/protocolos/${vendaId}`);

export const salvar = (vendaId, dados) => request(`/documental/protocolos/${vendaId}`, { method: 'PUT', body: dados });

/** CSV ";" ou "," -> { total, sucessos, erros: [{ linha, numeroVenda, motivo }] }. */
export function importar(arquivo) {
  const corpo = new FormData();
  corpo.append('arquivo', arquivo);
  return request('/documental/protocolos/importacao', { method: 'POST', body: corpo });
}

/** Baixa o CSV do Relatório de Gestão Documental. Erro do backend (ex.: período) vira ApiError com a mensagem. */
export async function exportar(filtros) {
  const url = new URL(`${API_BASE}/documental/protocolos/exportacao`);
  Object.entries(parametros(filtros)).forEach(([k, v]) => { if (v !== undefined) url.searchParams.set(k, v); });
  const token = lerToken();
  let resp;
  try {
    resp = await fetch(url.toString(), { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se o backend está no ar.');
  }
  if (!resp.ok) {
    const corpo = await resp.json().catch(() => null);
    if (resp.status === 401 && !corpo) encerrarSessaoExpirada();
    throw new ApiError(resp.status, corpo?.mensagem || `Erro ${resp.status}`, corpo?.campos, corpo);
  }
  const nome = /filename="?([^";]+)"?/.exec(resp.headers.get('Content-Disposition') || '')?.[1]
    || `Relatorio_Gestao_Documental_${filtros.dataInicio}_a_${filtros.dataFim}.csv`;
  baixarArquivo(await resp.blob(), nome);
  return nome;
}

// ---------------------------------------------------------------- formulário do protocolo
const dataBR = (instante) => (instante ? new Date(instante).toLocaleDateString('pt-BR') : '—');

/** Resposta do backend -> formulário da tela (radios em texto, como o formulário já usava). */
export function paraFormulario(r) {
  return {
    vendaId: r.vendaId,
    numeroVenda: r.numeroVenda,
    statusVenda: r.statusVenda,
    servico: r.servico || '—',
    plano: r.plano || '—',
    cliente: [r.clienteNome, r.clienteDocumento].filter(Boolean).join(' - '),
    vendedor: r.vendedorNome || '—',
    filial: r.filialNome || '—',
    dataVenda: dataBR(r.dataVenda),
    numeroAcesso: r.numeroAcesso || '',
    zerarRemuneracao: r.zerarRemuneracao ? 'sim' : 'nao',
    gerarPrice: r.gerarPrice === false ? 'nao' : 'sim',
    dataDigitalizacao: r.dataDigitalizacao || '',
    numeroProtocoloGed: r.numeroProtocoloGed || '',
    vencimento: r.vencimento || '17',
    statusBko: r.statusBko || 'Nao_avaliado',
    liderEquipe: r.liderEquipe || '',
    observacoes: r.observacoes || '',
    observacoesImportacao: r.observacoesImportacao || '',
    situacaoServico: r.situacaoServico === 'CANCELADO' ? 'Cancelado' : 'Confirmado',
    gerarComissao: r.gerarComissao === false ? 'Não' : 'Sim',
    motivosCancelamento: r.motivosCancelamento || [],
  };
}

/** Formulário -> corpo do PUT: 'sim'/'nao' e 'Sim'/'Não' viram boolean; data em ISO (yyyy-MM-dd). */
export function paraProtocolo(f) {
  return {
    numeroProtocoloGed: texto(f.numeroProtocoloGed) ?? null,
    dataDigitalizacao: texto(f.dataDigitalizacao) ?? null,
    zerarRemuneracao: f.zerarRemuneracao === 'sim',
    gerarPrice: f.gerarPrice === 'sim',
    vencimento: f.vencimento || null,
    liderEquipe: texto(f.liderEquipe) ?? null,
    observacoes: texto(f.observacoes) ?? null,
    observacoesImportacao: texto(f.observacoesImportacao) ?? null,
    situacaoServico: f.situacaoServico === 'Cancelado' ? 'CANCELADO' : 'CONFIRMADO',
    gerarComissao: f.gerarComissao === 'Sim',
    motivosCancelamento: f.situacaoServico === 'Cancelado' ? f.motivosCancelamento : [],
    statusBko: f.statusBko,
  };
}

// ---------------------------------------------------------------- arquivos
export function baixarArquivo(blob, nome) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** CSV de erros da importação, montado a partir da resposta do backend. */
export function baixarErrosImportacao(erros) {
  const campo = (v) => {
    const s = String(v ?? '');
    return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const linhas = ['LINHA;NUMERO_VENDA;MOTIVO', ...erros.map((e) => [e.linha, e.numeroVenda, e.motivo].map(campo).join(';'))];
  baixarArquivo(new Blob(['﻿' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8;' }),
    `erros_importacao_protocolos_${new Date().toISOString().slice(0, 10)}.csv`);
}
