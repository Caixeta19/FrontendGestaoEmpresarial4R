import { request, ApiError, API_BASE, lerToken, encerrarSessaoExpirada } from './api';
import { baixarArquivo } from './documentalApi';

// ---------------------------------------------------------------- valores do backend
/** Relatórios analíticos: id da tela -> trecho da URL (/relatorios/{rota}/...). */
export const ROTAS = { PRODUTOS: 'produtos', SERVICOS: 'servicos', VENDAS: 'vendas' };

/** Literais de StatusVendaFiltro, com os rótulos de tela. */
export const STATUS_VENDA = [
  { valor: 'CONCLUIDA', rotulo: 'Concluída' },
  { valor: 'CANCELADA', rotulo: 'Cancelada' },
  { valor: 'AMBAS', rotulo: 'Ambas' },
];

/** Status padrão por relatório: Vendas mostra concluídas e canceladas, Produtos e Serviços só as concluídas. */
export const statusPadrao = (tipo) => (tipo === 'VENDAS' ? 'AMBAS' : 'CONCLUIDA');

// ---------------------------------------------------------------- filtros
const lista = (v) => (Array.isArray(v) && v.length ? v.join(',') : undefined);
const texto = (v) => (v === undefined || v === null || String(v).trim() === '' ? undefined : String(v).trim());

/** Filtros da tela -> parâmetros de /relatorios/{tipo}/busca|contagem|exportacao. Vazios não são enviados. */
function parametros(f = {}) {
  return {
    dataInicio: texto(f.dataInicio),
    dataFim: texto(f.dataFim),
    considerar: texto(f.considerar),
    filialIds: lista(f.filialIds),
    vendedorId: texto(f.vendedorId),
    clienteId: texto(f.clienteId),
    statusBko: texto(f.statusBko),
    statusVenda: texto(f.statusVenda),
    segmentos: lista(f.segmentos),
    tiposProduto: lista(f.tiposProduto),
    modo: texto(f.modo),
    agruparPor: texto(f.agruparPor),
    campos: lista(f.campos),
  };
}

// ---------------------------------------------------------------- chamadas
/** Campos escolhíveis (chave, rotulo, formato, padrao, travado, somenteExcel), segmentos e tipos de produto. */
export const opcoes = (tipo) => request(`/relatorios/${ROTAS[tipo]}/opcoes`);

/**
 * Página da tabela: { colunas, itens, total, pagina, totalPaginas, totais }. `totais` são os subtotais por grupo
 * (só em Produtos, no modo analítico).
 */
export async function buscar(tipo, filtros, { page = 0, size = 20 } = {}) {
  const r = await request(`/relatorios/${ROTAS[tipo]}/busca`, { params: { ...parametros(filtros), page, size } });
  return {
    colunas: r?.colunas ?? [],
    itens: r?.content ?? [],
    total: r?.totalElements ?? 0,
    pagina: r?.page ?? 0,
    totalPaginas: r?.totalPages ?? 0,
    totais: r?.totais ?? [],
  };
}

/** Quantos registros os filtros encontram ("N registros encontrados"). */
export async function contar(tipo, filtros) {
  const r = await request(`/relatorios/${ROTAS[tipo]}/contagem`, { params: parametros({ ...filtros, campos: undefined }) });
  return r?.total ?? 0;
}

/** Baixa o Excel (.xlsx) só com os campos escolhidos. Erro do backend (ex.: período) vira ApiError com a mensagem. */
export async function exportar(tipo, filtros) {
  const url = new URL(`${API_BASE}/relatorios/${ROTAS[tipo]}/exportacao`);
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
  const nome = /filename="?([^";]+)"?/.exec(resp.headers.get('Content-Disposition') || '')?.[1] || `${ROTAS[tipo]}.xlsx`;
  baixarArquivo(await resp.blob(), nome);
  return nome;
}

// ---------------------------------------------------------------- exibição
const dataBR = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso);
};

/** Valor de uma célula da tabela conforme o formato da coluna (TEXTO, INTEIRO, DECIMAL, DATA, DATA_HORA, HORA, BOOLEANO). */
export function formatarCelula(valor, formato) {
  if (valor === null || valor === undefined || valor === '') return '—';
  switch (formato) {
    case 'DECIMAL': return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'INTEIRO': return Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
    case 'DATA': return dataBR(valor);
    case 'DATA_HORA': return `${dataBR(valor)} ${String(valor).slice(11, 16)}`;
    case 'HORA': return String(valor).slice(0, 5);
    case 'BOOLEANO': return valor ? 'Sim' : 'Não';
    default: return String(valor);
  }
}
