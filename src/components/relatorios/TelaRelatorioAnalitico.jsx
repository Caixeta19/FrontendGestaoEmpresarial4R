import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Eye, FileEdit, FileSpreadsheet, Trash2 } from 'lucide-react';
import { listarFiliais, listarVendedores, buscarClientes } from '../../services/vendasApi';
import { loginDoToken } from '../../services/api';
import * as relatorios from '../../services/relatoriosApi';
import * as documental from '../../services/documentalApi';
import { hoje, inicioDoMes, semAcento, ufDaFilial } from './utilRelatorios';

/**
 * Relatórios analíticos "Venda de Produtos", "Venda de Serviços" e "Vendas" (docs/relatorios_produtos_servicos.md),
 * lidos da API. Mesmos blocos nos três; Produtos troca Indicadores/Segmento por "Agrupar por" e "Tipo de Produto".
 */
const TITULOS = { PRODUTOS: 'Venda de Produtos', SERVICOS: 'Venda de Serviços', VENDAS: 'Vendas' };
const COLUNAS_FILIAL = 4;
const COLUNAS_CAMPOS = 6;
const INDICADORES = [
  { valor: 'COMERCIAL', rotulo: 'Comercial', ativo: true },
  { valor: 'TECNICO', rotulo: 'Técnico', ativo: false },
  { valor: 'SEGMENTACAO', rotulo: 'Segmentação', ativo: false },
  { valor: 'META', rotulo: 'Meta', ativo: false },
];

/** Padrão de filtros do usuário: fica no navegador, por login e por relatório. O período não é salvo. */
const chavePadrao = (tipo) => `syscor_relatorio_${tipo.toLowerCase()}_${loginDoToken() || 'anonimo'}`;
function lerPadrao(tipo) {
  try {
    return JSON.parse(localStorage.getItem(chavePadrao(tipo)) || 'null');
  } catch {
    return null;
  }
}
function gravarPadrao(tipo, padrao) {
  try {
    localStorage.setItem(chavePadrao(tipo), JSON.stringify(padrao));
    return true;
  } catch {
    return false;
  }
}
function apagarPadrao(tipo) {
  try {
    localStorage.removeItem(chavePadrao(tipo));
  } catch {
    // storage indisponível: nada a apagar
  }
}

const rotulo = { fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 };
const campoEstilo = {
  minHeight: 38, height: 'auto', padding: '7px 10px', fontSize: 13, lineHeight: 1.4, background: 'var(--panel-2)',
  color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 6, boxSizing: 'border-box',
};
const separador = <hr style={{ borderColor: 'var(--line-soft)', margin: '18px 0' }} />;

export default function TelaRelatorioAnalitico({ tipo, onVoltar }) {
  const padrao = useMemo(() => lerPadrao(tipo), [tipo]);
  const ehProdutos = tipo === 'PRODUTOS';
  const ehServicos = tipo === 'SERVICOS';

  const [filiais, setFiliais] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [opcoes, setOpcoes] = useState(null);
  const [erroCarga, setErroCarga] = useState('');

  const [filtroUf, setFiltroUf] = useState(padrao?.filtroUf || '');
  const [buscaFilial, setBuscaFilial] = useState('');
  const [lojas, setLojas] = useState(padrao?.lojas || []);
  const [modo, setModo] = useState(padrao?.modo || 'ANALITICO');
  const [dataInicio, setDataInicio] = useState(inicioDoMes);
  const [dataFim, setDataFim] = useState(hoje);
  const [considerar, setConsiderar] = useState(padrao?.considerar || 'VENDA');
  const [agruparPor, setAgruparPor] = useState(padrao?.agruparPor || 'TIPO_PRODUTO');
  const [campos, setCampos] = useState(padrao?.campos || null); // null = os marcados por padrão do backend
  const [buscaCampo, setBuscaCampo] = useState('');
  const [clienteTexto, setClienteTexto] = useState('');
  const [clienteSel, setClienteSel] = useState(null);
  const [sugestoes, setSugestoes] = useState([]);
  const [vendedorId, setVendedorId] = useState('');
  const [segmentos, setSegmentos] = useState(padrao?.segmentos || []);
  const [tiposProduto, setTiposProduto] = useState(padrao?.tiposProduto || []);
  const [statusVenda, setStatusVenda] = useState(padrao?.statusVenda || relatorios.statusPadrao(tipo));
  const [statusBko, setStatusBko] = useState(padrao?.statusBko || '');

  const [quantidade, setQuantidade] = useState(null);
  const [contando, setContando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [visualizando, setVisualizando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  useEffect(() => {
    listarFiliais({ incluirInativas: true }).then(setFiliais).catch((e) => setErroCarga(e.mensagem || 'Não foi possível carregar as filiais.'));
    listarVendedores().then((l) => setVendedores(Array.isArray(l) ? l : (l?.content ?? []))).catch(() => setVendedores([]));
    relatorios.opcoes(tipo).then(setOpcoes).catch((e) => setErroCarga(e.mensagem || 'Não foi possível carregar as opções do relatório.'));
  }, [tipo]);

  const camposDisponiveis = opcoes?.campos ?? [];
  const chavesTravadas = useMemo(() => camposDisponiveis.filter((c) => c.travado).map((c) => c.chave), [camposDisponiveis]);
  const camposMarcados = useMemo(
    () => campos ?? camposDisponiveis.filter((c) => c.padrao).map((c) => c.chave),
    [campos, camposDisponiveis]
  );
  const camposVisiveis = useMemo(
    () => camposDisponiveis.filter((c) => semAcento(c.rotulo).includes(semAcento(buscaCampo))),
    [camposDisponiveis, buscaCampo]
  );

  const ufs = useMemo(() => [...new Set(filiais.map((f) => ufDaFilial(f.nome)).filter(Boolean))].sort(), [filiais]);
  const lojasExibidas = useMemo(
    () => filiais
      .filter((f) => !filtroUf || ufDaFilial(f.nome) === filtroUf)
      .filter((f) => semAcento(f.nome).includes(semAcento(buscaFilial))),
    [filiais, filtroUf, buscaFilial]
  );

  // Busca de cliente: a partir de 2 letras consulta /clientes e deixa escolher
  useEffect(() => {
    if (clienteSel || clienteTexto.trim().length < 2) { setSugestoes([]); return undefined; }
    let cancelado = false;
    const t = setTimeout(() => {
      buscarClientes(clienteTexto.trim()).then((l) => { if (!cancelado) setSugestoes(l); }).catch(() => { if (!cancelado) setSugestoes([]); });
    }, 300);
    return () => { cancelado = true; clearTimeout(t); };
  }, [clienteTexto, clienteSel]);

  const todosSegmentos = (opcoes?.segmentos ?? []).map((s) => s.valor);
  const todosTipos = (opcoes?.tiposProduto ?? []).map((s) => s.valor);

  /** Filtros para a API. Nenhuma filial marcada = todas (as da UF, se houver UF). Lista completa = sem filtro. */
  const filtros = useMemo(() => {
    const filialIds = lojas.length ? lojas : (filtroUf ? filiais.filter((f) => ufDaFilial(f.nome) === filtroUf).map((f) => f.id) : []);
    return {
      dataInicio,
      dataFim,
      considerar: ehProdutos ? undefined : considerar,
      filialIds,
      vendedorId,
      clienteId: clienteSel?.id,
      statusBko,
      statusVenda,
      segmentos: ehServicos && segmentos.length < todosSegmentos.length ? segmentos : [],
      tiposProduto: ehProdutos && tiposProduto.length < todosTipos.length ? tiposProduto : [],
      modo,
      agruparPor: ehProdutos ? agruparPor : undefined,
      campos: modo === 'ANALITICO' ? [...new Set([...camposMarcados, ...chavesTravadas])] : [],
    };
  }, [dataInicio, dataFim, considerar, lojas, filtroUf, filiais, vendedorId, clienteSel, statusBko, statusVenda, segmentos,
    tiposProduto, modo, agruparPor, camposMarcados, chavesTravadas, ehProdutos, ehServicos, todosSegmentos.length, todosTipos.length]);

  const periodoIncompleto = !dataInicio || !dataFim;
  const semCampos = modo === 'ANALITICO' && camposMarcados.length === 0 && chavesTravadas.length === 0;

  // "N registros encontrados" (com atraso, como na Documental)
  useEffect(() => {
    setMensagemErro('');
    if (periodoIncompleto || semCampos) { setQuantidade(null); return undefined; }
    let cancelado = false;
    setContando(true);
    const t = setTimeout(() => {
      relatorios.contar(tipo, filtros)
        .then((n) => { if (!cancelado) setQuantidade(n); })
        .catch((e) => { if (!cancelado) { setQuantidade(null); setMensagemErro(e.mensagem || 'Falha ao contar os registros.'); } })
        .finally(() => { if (!cancelado) setContando(false); });
    }, 400);
    return () => { cancelado = true; clearTimeout(t); };
  }, [tipo, filtros, periodoIncompleto, semCampos]);

  const avisar = (texto) => {
    setMensagemSucesso(texto);
    setTimeout(() => setMensagemSucesso(''), 3500);
  };

  const alternar = (setLista) => (valor) => setLista((prev) => (prev.includes(valor) ? prev.filter((v) => v !== valor) : [...prev, valor]));

  const alternarCampo = (chave) => {
    if (chavesTravadas.includes(chave)) return;
    setCampos(camposMarcados.includes(chave) ? camposMarcados.filter((c) => c !== chave) : [...camposMarcados, chave]);
  };

  const redefinirFiltros = () => {
    setFiltroUf(''); setBuscaFilial(''); setLojas([]); setModo('ANALITICO');
    setDataInicio(inicioDoMes()); setDataFim(hoje()); setConsiderar('VENDA'); setAgruparPor('TIPO_PRODUTO');
    setCampos(null); setBuscaCampo(''); setClienteTexto(''); setClienteSel(null); setVendedorId('');
    setSegmentos([]); setTiposProduto([]); setStatusVenda(relatorios.statusPadrao(tipo)); setStatusBko('');
    setResultado(null);
  };

  const handleSalvarPadrao = () => {
    const ok = gravarPadrao(tipo, { filtroUf, lojas, modo, considerar, agruparPor, campos: camposMarcados, segmentos, tiposProduto, statusVenda, statusBko });
    if (ok) avisar('Filtros salvos como seu padrão. Eles voltam quando você abrir esta tela.');
    else setMensagemErro('O navegador não deixou salvar os filtros (armazenamento indisponível).');
  };

  const handleApagarPadrao = () => {
    apagarPadrao(tipo);
    redefinirFiltros();
    avisar('Padrão apagado e filtros redefinidos.');
  };

  const validar = () => {
    if (periodoIncompleto) { setMensagemErro('Informe o período.'); return false; }
    if (semCampos) { setMensagemErro('Marque ao menos um campo.'); return false; }
    return true;
  };

  const visualizar = async (pagina = 0) => {
    setMensagemErro('');
    if (!validar()) return;
    setVisualizando(true);
    try {
      const r = await relatorios.buscar(tipo, filtros, { page: pagina, size: 20 });
      setResultado(r);
      setQuantidade(r.total);
      if (r.total === 0) setMensagemErro('Nenhum registro encontrado para esses filtros.');
    } catch (e) {
      setMensagemErro(e.mensagem || e.message || 'Falha ao buscar o relatório.');
    } finally {
      setVisualizando(false);
    }
  };

  const handleExportar = async () => {
    setMensagemErro('');
    if (!validar()) return;
    setExportando(true);
    try {
      const total = await relatorios.contar(tipo, filtros);
      setQuantidade(total);
      if (total === 0) { setMensagemErro('Nenhum registro encontrado para esses filtros.'); return; }
      await relatorios.exportar(tipo, filtros);
      avisar(`Relatório exportado com ${total} registro(s).`);
    } catch (e) {
      setMensagemErro(e.mensagem || e.message || 'Falha ao exportar o relatório.');
    } finally {
      setExportando(false);
    }
  };

  const grade = (colunas) => ({ display: 'grid', gridTemplateColumns: `repeat(${colunas}, 1fr)`, gap: '8px 14px' });
  const rodapeTexto = periodoIncompleto ? 'Informe o período.'
    : semCampos ? 'Marque ao menos um campo.'
      : contando ? 'Contando registros...'
        : quantidade === null ? '' : `${quantidade} registro(s) encontrado(s)`;

  const marcarTodos = (lista, setLista, todos) => (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
      <input type="checkbox" checked={todos.length > 0 && lista.length === todos.length} onChange={(e) => setLista(e.target.checked ? [...todos] : [])} />
      <span>Selecionar todos</span>
    </label>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileEdit size={22} color="var(--accent, #c026d3)" />
          <h1 style={{ margin: 0 }}>Relatório: {TITULOS[tipo]}</h1>
        </div>
        <button type="button" className="btn sm ghost" onClick={onVoltar} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Voltar à Seleção
        </button>
      </div>

      {mensagemSucesso && (
        <div role="status" style={{ background: 'var(--good-soft)', color: 'var(--good)', border: '1px solid var(--good)', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          ✓ {mensagemSucesso}
        </div>
      )}
      {(mensagemErro || erroCarga) && (
        <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--bad, #ef4444)', border: '1px solid var(--bad, #ef4444)', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          {mensagemErro || erroCarga}
        </div>
      )}

      <div className="panel" style={{ padding: 24, background: 'var(--panel)', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--good)', marginBottom: 20 }}>
          <ChevronRight size={18} strokeWidth={3} />
          <h3 style={{ margin: 0 }}>Filtros Principais</h3>
        </div>

        {/* 1. FILIAL */}
        <div>
          <label style={rotulo}>Filial:</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <select value={filtroUf} onChange={(e) => { setFiltroUf(e.target.value); setLojas([]); }} style={{ ...campoEstilo, width: 90, minHeight: 34 }}>
              <option value="">UF</option>
              {ufs.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
            <input type="text" value={buscaFilial} onChange={(e) => setBuscaFilial(e.target.value)} placeholder="Filtrar opções" style={{ ...campoEstilo, minHeight: 34, width: 220 }} />
            <button type="button" className="btn sm" onClick={redefinirFiltros} style={{ background: '#475569', borderColor: '#475569', color: '#fff', fontSize: 11.5, minHeight: 34, height: 'auto', padding: '6px 12px' }}>
              Redefinir filtros
            </button>
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={lojasExibidas.length > 0 && lojasExibidas.every((l) => lojas.includes(l.id))}
              onChange={(e) => setLojas(e.target.checked ? lojasExibidas.map((l) => l.id) : [])}
            />
            <span>Selecionar todos</span>
          </label>
          <div style={grade(COLUNAS_FILIAL)}>
            {lojasExibidas.map((loja) => (
              <label key={loja.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', color: loja.ativo ? 'var(--text)' : 'var(--bad, #f43f5e)' }}>
                <input type="checkbox" checked={lojas.includes(loja.id)} onChange={() => alternar(setLojas)(loja.id)} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loja.nome}{loja.ativo ? '' : ' (CANCELADO)'}</span>
              </label>
            ))}
          </div>
          <small style={{ color: 'var(--text-faint)', display: 'block', marginTop: 8 }}>
            Sem filial marcada, entram todas{filtroUf ? ` as filiais de ${filtroUf}` : ''}.
          </small>
        </div>

        {separador}

        {/* 2. MODO */}
        <div>
          <label style={rotulo}>Modo:</label>
          <select value={modo} onChange={(e) => setModo(e.target.value)} style={{ ...campoEstilo, width: 280, cursor: 'pointer' }}>
            <option value="ANALITICO">Resumo Analítico</option>
            <option value="SINTETICO">Resumo Sintético</option>
          </select>
          {modo === 'SINTETICO' && (
            <small style={{ color: 'var(--text-faint)', display: 'block', marginTop: 6 }}>
              Totais por filial e por vendedor{ehProdutos ? ' e por grupo' : ''}, sem a escolha de campos.
            </small>
          )}
        </div>

        {separador}

        {/* 3. PERÍODO E CONSIDERAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <label style={rotulo}>Período:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={{ ...campoEstilo, maxWidth: 160 }} />
              <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>Até</span>
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={{ ...campoEstilo, maxWidth: 160 }} />
            </div>
            <small style={{ color: 'var(--text-faint)', display: 'block', marginTop: 4 }}>Até 93 dias por exportação.</small>
          </div>
          {!ehProdutos && (
            <div>
              <label style={rotulo}>Considerar:</label>
              <div style={{ display: 'flex', gap: 18 }}>
                {[['VENDA', 'Data de Venda'], ['ATIVACAO', 'Data de Ativação']].map(([valor, texto]) => (
                  <label key={valor} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer' }}>
                    <input type="radio" name="considerar" checked={considerar === valor} onChange={() => setConsiderar(valor)} />
                    <span>{texto}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AGRUPAR POR (só Produtos) */}
        {ehProdutos && (
          <>
            {separador}
            <div>
              <label style={rotulo}>Agrupar por:</label>
              <div style={{ display: 'flex', gap: 18 }}>
                {[['TIPO_PRODUTO', 'Tipo de Produto'], ['CATEGORIA', 'Categoria']].map(([valor, texto]) => (
                  <label key={valor} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer' }}>
                    <input type="radio" name="agruparPor" checked={agruparPor === valor} onChange={() => setAgruparPor(valor)} />
                    <span>{texto}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {separador}

        {/* 4. CAMPOS */}
        {modo === 'ANALITICO' && (
          <>
            <div>
              <label style={rotulo}>Escolha os campos que deseja visualizar em seu Relatório Analítico:</label>
              <input type="text" value={buscaCampo} onChange={(e) => setBuscaCampo(e.target.value)} placeholder="Filtrar opções" style={{ ...campoEstilo, minHeight: 34, width: 240, marginBottom: 10 }} />
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
                  <input
                    type="checkbox"
                    checked={camposDisponiveis.length > 0 && camposMarcados.length === camposDisponiveis.length}
                    onChange={(e) => setCampos(e.target.checked ? camposDisponiveis.map((c) => c.chave) : chavesTravadas)}
                  />
                  <span>Selecionar todos</span>
                </label>
              </div>
              <div style={grade(COLUNAS_CAMPOS)}>
                {camposVisiveis.map((c) => (
                  <label key={c.chave} title={c.travado ? 'Campo fixo do relatório' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: c.travado ? 'not-allowed' : 'pointer' }}>
                    <input type="checkbox" checked={c.travado || camposMarcados.includes(c.chave)} disabled={c.travado} onChange={() => alternarCampo(c.chave)} />
                    <span>{c.rotulo}</span>
                  </label>
                ))}
              </div>
            </div>
            {separador}
          </>
        )}

        {/* 5. CLIENTE E VENDEDOR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ position: 'relative' }}>
            <label style={rotulo}>Cliente:</label>
            <input
              type="text"
              value={clienteTexto}
              onChange={(e) => { setClienteTexto(e.target.value); setClienteSel(null); }}
              placeholder="Digite as duas primeiras letras para iniciar a busca"
              style={{ ...campoEstilo, width: '100%' }}
            />
            {sugestoes.length > 0 && (
              <ul style={{ position: 'absolute', zIndex: 20, left: 0, right: 0, margin: 0, padding: 4, listStyle: 'none', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 6, maxHeight: 220, overflowY: 'auto' }}>
                {sugestoes.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => { setClienteSel(c); setClienteTexto(c.nome); setSugestoes([]); }}
                      style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: 'var(--text)', padding: '6px 8px', fontSize: 12.5, cursor: 'pointer' }}
                    >
                      {c.nome}{c.doc ? ` — ${c.doc}` : ''}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {clienteSel && (
              <small style={{ color: 'var(--text-faint)', display: 'block', marginTop: 4 }}>
                Filtrando por {clienteSel.nome}. Apague o texto para limpar.
              </small>
            )}
          </div>
          <div>
            <label style={rotulo}>Vendedor:</label>
            <select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)} style={{ ...campoEstilo, width: '100%', cursor: 'pointer' }}>
              <option value="">Todos</option>
              {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome || v.login}</option>)}
            </select>
          </div>
        </div>

        {separador}

        {/* TIPO DE PRODUTO (só Produtos) */}
        {ehProdutos && (
          <>
            <div>
              <label style={rotulo}>Tipo de Produto:</label>
              {marcarTodos(tiposProduto, setTiposProduto, todosTipos)}
              <div style={grade(4)}>
                {(opcoes?.tiposProduto ?? []).map((t) => (
                  <label key={t.valor} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                    <input type="checkbox" checked={tiposProduto.includes(t.valor)} onChange={() => alternar(setTiposProduto)(t.valor)} />
                    <span>{t.rotulo}</span>
                  </label>
                ))}
              </div>
              <small style={{ color: 'var(--text-faint)', display: 'block', marginTop: 6 }}>Nenhum marcado = todos.</small>
            </div>
            {separador}
          </>
        )}

        {/* 6. SERVIÇOS/PLANOS: INDICADORES E SEGMENTO (só Serviços) */}
        {ehServicos && (
          <>
            <div>
              <label style={rotulo}>Filtros adicionais - Serviços/Planos:</label>
              <label style={{ ...rotulo, fontWeight: 500, fontSize: 12.5 }}>Indicadores:</label>
              <div style={{ display: 'flex', gap: 18, marginBottom: 14 }}>
                {INDICADORES.map((i) => (
                  <label key={i.valor} title={i.ativo ? undefined : 'Em breve'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: i.ativo ? 'pointer' : 'not-allowed', opacity: i.ativo ? 1 : 0.5 }}>
                    <input type="radio" name="indicador" checked={i.valor === 'COMERCIAL'} disabled={!i.ativo} readOnly />
                    <span>{i.rotulo}{i.ativo ? '' : ' (em breve)'}</span>
                  </label>
                ))}
              </div>
              <label style={{ ...rotulo, fontWeight: 500, fontSize: 12.5 }}>Segmento:</label>
              {marcarTodos(segmentos, setSegmentos, todosSegmentos)}
              <div style={grade(3)}>
                {(opcoes?.segmentos ?? []).map((s) => (
                  <label key={s.valor} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                    <input type="checkbox" checked={segmentos.includes(s.valor)} onChange={() => alternar(setSegmentos)(s.valor)} />
                    <span>{s.rotulo}</span>
                  </label>
                ))}
              </div>
              <small style={{ color: 'var(--text-faint)', display: 'block', marginTop: 6 }}>Nenhum marcado = todos.</small>
            </div>
            {separador}
          </>
        )}

        {/* FILTROS ADICIONAIS: STATUS DA VENDA E BKO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <label style={rotulo}>Status da venda:</label>
            <select value={statusVenda} onChange={(e) => setStatusVenda(e.target.value)} style={{ ...campoEstilo, width: '100%', maxWidth: 280, cursor: 'pointer' }}>
              {relatorios.STATUS_VENDA.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
            </select>
          </div>
          <div>
            <label style={rotulo}>Status BKO:</label>
            <select value={statusBko} onChange={(e) => setStatusBko(e.target.value)} style={{ ...campoEstilo, width: '100%', maxWidth: 280, cursor: 'pointer' }}>
              <option value="">Todos</option>
              {documental.STATUS_BKO.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* RESULTADO NA TELA */}
      {resultado && resultado.itens.length > 0 && (
        <div className="panel" style={{ padding: 16, background: 'var(--panel)', border: '1px solid var(--line)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {resultado.colunas.map((c) => (
                  <th key={c.chave} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap' }}>{c.rotulo}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resultado.itens.map((linha, i) => (
                <tr key={i}>
                  {resultado.colunas.map((c) => (
                    <td key={c.chave} style={{ padding: '5px 8px', borderBottom: '1px solid var(--line-soft)', whiteSpace: 'nowrap' }}>
                      {relatorios.formatarCelula(linha[c.chave], c.formato)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {resultado.totais.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <b style={{ fontSize: 13 }}>Subtotais por {agruparPor === 'CATEGORIA' ? 'categoria' : 'tipo de produto'} (todo o filtro)</b>
              <table style={{ borderCollapse: 'collapse', fontSize: 12.5, marginTop: 6 }}>
                <thead>
                  <tr>
                    {['Grupo', 'Registros', 'Quantidade', 'Valor de venda', 'Valor de Custo', 'Valor Lucro'].map((t) => (
                      <th key={t} style={{ textAlign: 'left', padding: '4px 12px 4px 0', borderBottom: '1px solid var(--line)' }}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultado.totais.map((t) => (
                    <tr key={t.grupo}>
                      <td style={{ padding: '4px 12px 4px 0' }}>{t.grupo}</td>
                      <td style={{ padding: '4px 12px 4px 0' }}>{relatorios.formatarCelula(t.registros, 'INTEIRO')}</td>
                      <td style={{ padding: '4px 12px 4px 0' }}>{relatorios.formatarCelula(t.quantidade, 'INTEIRO')}</td>
                      <td style={{ padding: '4px 12px 4px 0' }}>{relatorios.formatarCelula(t.valor, 'DECIMAL')}</td>
                      <td style={{ padding: '4px 12px 4px 0' }}>{relatorios.formatarCelula(t.custo, 'DECIMAL')}</td>
                      <td style={{ padding: '4px 12px 4px 0' }}>{relatorios.formatarCelula(t.lucro, 'DECIMAL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <button type="button" className="btn sm ghost" disabled={visualizando || resultado.pagina <= 0} onClick={() => visualizar(resultado.pagina - 1)}>Anterior</button>
            <span style={{ fontSize: 12.5, color: 'var(--text-dim, #cbd5e1)' }}>Página {resultado.pagina + 1} de {Math.max(resultado.totalPaginas, 1)}</span>
            <button type="button" className="btn sm ghost" disabled={visualizando || resultado.pagina + 1 >= resultado.totalPaginas} onClick={() => visualizar(resultado.pagina + 1)}>Próxima</button>
          </div>
        </div>
      )}

      {/* RODAPÉ */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'rgba(28, 23, 48, 0.95)', border: '1px solid var(--line)', borderRadius: 8, position: 'sticky', bottom: 16, zIndex: 50, flexWrap: 'wrap' }}>
        <span role="status" style={{ marginRight: 'auto', fontSize: 13, color: 'var(--text-dim, #cbd5e1)' }}>{rodapeTexto}</span>

        <button type="button" onClick={handleApagarPadrao} style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          Apagar <Trash2 size={14} />
        </button>
        <button type="button" onClick={handleSalvarPadrao} style={{ background: '#65a30d', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 22px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          Salvar <Check size={16} strokeWidth={3} />
        </button>
        <button type="button" onClick={() => visualizar(0)} disabled={visualizando} style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: visualizando ? 'not-allowed' : 'pointer' }}>
          {visualizando ? 'Buscando...' : 'Visualizar'} <Eye size={15} />
        </button>
        <button type="button" onClick={handleExportar} disabled={exportando} style={{ background: '#9333ea', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: exportando ? 'not-allowed' : 'pointer' }}>
          {exportando ? 'Exportando...' : 'Exportar Excel'} <FileSpreadsheet size={15} />
        </button>
      </div>
    </div>
  );
}
