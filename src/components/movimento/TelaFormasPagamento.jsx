import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BarChart3, ChevronDown, ChevronRight, FileSpreadsheet, FileText, RotateCcw, Search } from 'lucide-react';
import TituloPagina from '../ui/TituloPagina.jsx';
import { useToast } from '../ToastContext.jsx';
import {
  exportarFormasPagamento, opcoesFormasPagamento, relatorioFormasPagamento,
} from '../../services/financeiroApi';
import { semAcento } from '../relatorios/utilRelatorios.js';
import {
  AGRUPAR_POR, SEM_UF, filialDaUf, formatarMoeda, hoje, mensagemErro, percentualBR, ufsDasFiliais, validarPeriodo,
} from './utilMovimento.js';

/** Quantos grupos abrem sozinhos depois de pesquisar (acima disso começam recolhidos). */
const GRUPOS_ABERTOS_AUTOMATICO = 8;

const campoBusca = {
  width: '100%', background: 'var(--input-bg)', border: '1px solid var(--line)', borderRadius: 8,
  padding: '10px 14px 10px 40px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

/**
 * Lista de marcação: campo "Filtrar", "Selecionar todos" (vale para o que está visível) e cartões com checkbox.
 * Tudo marcado = sem filtro; as opções vêm do backend, nunca de uma lista escrita na tela.
 */
function ListaMarcacao({ id, titulo, placeholder, opcoes, selecionados, onChange }) {
  const [busca, setBusca] = useState('');
  const visiveis = opcoes.filter((o) => semAcento(o.rotulo).includes(semAcento(busca)));
  const todasVisiveisMarcadas = visiveis.length > 0 && visiveis.every((o) => selecionados.has(o.valor));

  const alternarTodas = () => {
    const novo = new Set(selecionados);
    visiveis.forEach((o) => { if (todasVisiveisMarcadas) novo.delete(o.valor); else novo.add(o.valor); });
    onChange(novo);
  };
  const alternar = (valor) => {
    const novo = new Set(selecionados);
    if (novo.has(valor)) novo.delete(valor); else novo.add(valor);
    onChange(novo);
  };

  return (
    <div role="group" aria-labelledby={`${id}-titulo`}>
      <div id={`${id}-titulo`} style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-faint)', marginBottom: 8 }}>
        {titulo}: <span style={{ fontWeight: 400 }}>({selecionados.size} de {opcoes.length} marcada(s))</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} color="var(--text-faint)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input id={id} type="text" aria-label={placeholder} placeholder={placeholder} value={busca}
            onChange={(e) => setBusca(e.target.value)} style={campoBusca} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>
          <input type="checkbox" checked={todasVisiveisMarcadas} onChange={alternarTodas}
            disabled={visiveis.length === 0} style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
          Selecionar todos
        </label>
        {opcoes.length === 0 ? (
          <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Nenhuma opção disponível.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
            {visiveis.map((o) => (
              <label key={o.valor} style={{
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text)', cursor: 'pointer',
                background: 'var(--input-bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 14px',
              }}>
                <input type="checkbox" checked={selecionados.has(o.valor)} onChange={() => alternar(o.valor)}
                  style={{ accentColor: 'var(--accent)', width: 14, height: 14, flexShrink: 0 }} />
                <span title={o.rotulo} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.rotulo}</span>
              </label>
            ))}
            {visiveis.length === 0 && <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Nenhuma opção encontrada.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function Cartao({ titulo, valor, detalhe }) {
  return (
    <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 600 }}>{titulo}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--title)', marginTop: 2 }}>{valor}</div>
      {detalhe && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{detalhe}</div>}
    </div>
  );
}

/** Tabela agrupada: cada grupo é expansível e mostra as linhas (formas, ou filiais quando agrupa por forma). */
function TabelaGrupos({ relatorio, abertos, onAlternar }) {
  const total = Number(relatorio.totalGeral) || 0;
  const colunaLinha = relatorio.agruparPor === 'FORMA' ? 'Filial' : 'Forma de pagamento';
  return (
    <div className="table-wrap" style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Grupo / {colunaLinha}</th>
            <th style={{ textAlign: 'right' }}>Valor</th>
            <th style={{ textAlign: 'right' }}>%</th>
            <th style={{ textAlign: 'right' }}>Pagamentos</th>
            <th style={{ textAlign: 'right' }}>Vendas</th>
          </tr>
        </thead>
        {relatorio.grupos.map((g) => {
          const aberto = abertos.has(g.chave);
          const participacao = total > 0 ? (Number(g.total) / total) * 100 : 0;
          return (
            <tbody key={g.chave}>
              <tr style={{ background: 'var(--panel-2)' }}>
                <td>
                  <button type="button" className="btn ghost sm" aria-expanded={aberto} onClick={() => onAlternar(g.chave)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                    {aberto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {g.rotulo}
                  </button>
                </td>
                <td className="mono" style={{ textAlign: 'right', fontWeight: 700 }}>{formatarMoeda(g.total)}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{percentualBR(participacao)}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{g.quantidadePagamentos}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{g.quantidadeVendas}</td>
              </tr>
              {aberto && g.linhas.map((l) => (
                <tr key={l.chave}>
                  <td style={{ paddingLeft: 38 }}>{l.rotulo}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{formatarMoeda(l.valor)}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{percentualBR(l.percentual)}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{l.quantidade}</td>
                  <td />
                </tr>
              ))}
            </tbody>
          );
        })}
        <tfoot>
          <tr style={{ fontWeight: 700 }}>
            <td>Total geral</td>
            <td className="mono" style={{ textAlign: 'right' }}>{formatarMoeda(relatorio.totalGeral)}</td>
            <td />
            <td className="mono" style={{ textAlign: 'right' }}>{relatorio.quantidadePagamentos}</td>
            <td className="mono" style={{ textAlign: 'right' }}>{relatorio.quantidadeVendas}</td>
          </tr>
        </tfoot>
      </table>
      <div style={{ fontSize: 12, color: 'var(--text-faint)', padding: '8px 4px' }}>
        Na linha do grupo, o % é a participação no total geral; nas linhas de dentro, a participação no grupo.
      </div>
    </div>
  );
}

/** Relatório de Formas de Pagamento (Financeiro › Movimento): vendas CONCLUIDA, calculado ao vivo no backend. */
export default function TelaFormasPagamento({ onVoltar }) {
  const showToast = useToast();

  const [opcoes, setOpcoes] = useState(null);
  const [erroOpcoes, setErroOpcoes] = useState('');
  const [agruparPor, setAgruparPor] = useState('FILIAL');
  const [dataInicio, setDataInicio] = useState(hoje());
  const [dataFim, setDataFim] = useState(hoje());
  const [uf, setUf] = useState('');
  const [filiaisSel, setFiliaisSel] = useState(() => new Set());
  const [formasSel, setFormasSel] = useState(() => new Set());

  const [relatorio, setRelatorio] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [abertos, setAbertos] = useState(() => new Set());
  const [exportando, setExportando] = useState('');
  const pesquisando = useRef(false);
  const exportandoAgora = useRef(false);

  const carregarOpcoes = () => {
    setErroOpcoes('');
    opcoesFormasPagamento().then(setOpcoes).catch((e) => setErroOpcoes(mensagemErro(e)));
  };
  useEffect(() => { carregarOpcoes(); }, []);

  const filiais = useMemo(() => opcoes?.filiais ?? [], [opcoes]);
  const opcoesFiliais = useMemo(() => filiais.map((f) => ({ valor: f.id, rotulo: f.nome })), [filiais]);
  const opcoesFormas = useMemo(
    () => (opcoes?.formas ?? []).map((f) => ({ valor: f.valor, rotulo: f.rotulo })), [opcoes]);
  const { ufs, semUf } = useMemo(() => ufsDasFiliais(filiais), [filiais]);

  // Ao carregar as opções (e ao limpar) vem tudo marcado: tudo marcado = sem filtro.
  const marcarTudo = (lista) => {
    setUf('');
    setFiliaisSel(new Set(lista.filiais.map((f) => f.id)));
    setFormasSel(new Set(lista.formas.map((f) => f.valor)));
  };
  useEffect(() => { if (opcoes) marcarTudo(opcoes); }, [opcoes]);

  // A UF é um atalho: marca só as filiais dela (ou todas, sem UF). Marcar à mão desfaz o atalho.
  const escolherUf = (valor) => {
    setUf(valor);
    setFiliaisSel(new Set(filiais.filter((f) => filialDaUf(f, valor)).map((f) => f.id)));
  };
  const marcarFiliais = (novo) => { setUf(''); setFiliaisSel(novo); };

  const erroPeriodo = validarPeriodo(dataInicio, dataFim);
  const semFilial = opcoesFiliais.length > 0 && filiaisSel.size === 0;
  const semForma = opcoesFormas.length > 0 && formasSel.size === 0;
  const erroSelecao = (semFilial && 'Marque ao menos uma filial.') || (semForma && 'Marque ao menos uma forma de pagamento.') || '';
  const erroFiltros = erroPeriodo || erroSelecao;
  const filtros = {
    dataInicio,
    dataFim,
    agruparPor,
    filialIds: filiaisSel.size === opcoesFiliais.length ? [] : [...filiaisSel],
    formas: formasSel.size === opcoesFormas.length ? [] : [...formasSel],
  };

  const pesquisar = async () => {
    if (pesquisando.current) return;
    if (erroFiltros) { showToast(erroFiltros, true); return; }
    pesquisando.current = true;
    setCarregando(true);
    setErro('');
    try {
      const r = await relatorioFormasPagamento(filtros);
      setRelatorio(r);
      setAbertos(new Set(r.grupos.length <= GRUPOS_ABERTOS_AUTOMATICO ? r.grupos.map((g) => g.chave) : []));
    } catch (e) {
      setRelatorio(null);
      setErro(mensagemErro(e));
    } finally {
      pesquisando.current = false;
      setCarregando(false);
    }
  };

  const exportar = async (formato) => {
    if (exportandoAgora.current) return;
    if (erroFiltros) { showToast(erroFiltros, true); return; }
    exportandoAgora.current = true;
    setExportando(formato);
    try {
      const nome = await exportarFormasPagamento(filtros, formato);
      showToast(`Arquivo ${nome} gerado.`);
    } catch (e) {
      showToast(mensagemErro(e), true);
    } finally {
      exportandoAgora.current = false;
      setExportando('');
    }
  };

  const limpar = () => {
    setAgruparPor('FILIAL');
    setDataInicio(hoje());
    setDataFim(hoje());
    if (opcoes) marcarTudo(opcoes);
    setRelatorio(null);
    setErro('');
  };

  const alternarGrupo = (chave) => setAbertos((anterior) => {
    const novo = new Set(anterior);
    if (novo.has(chave)) novo.delete(chave); else novo.add(chave);
    return novo;
  });

  const maisUsada = relatorio?.totaisPorForma?.[0];
  const ocupado = carregando || Boolean(exportando);

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto', color: 'var(--text)' }}>
      <div style={{ marginBottom: 16 }}>
        <button type="button" className="btn sm" onClick={onVoltar} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Voltar aos Relatórios
        </button>
      </div>

      <TituloPagina icone={<BarChart3 size={20} />}
        subtitulo="Valores recebidos por forma de pagamento, PDV e período (vendas concluídas).">
        Relatório de Formas de Pagamento
      </TituloPagina>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {erroOpcoes ? (
          <div role="alert" style={{ color: 'var(--bad)' }}>
            {erroOpcoes} <button type="button" className="btn sm" onClick={carregarOpcoes}>Tentar de novo</button>
          </div>
        ) : !opcoes ? (
          <div style={{ color: 'var(--text-faint)' }}>Carregando filtros…</div>
        ) : (
          <>
            <div className="section-label">Filtros Principais</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
              <div className="field">
                <label htmlFor="fp-agrupar">Agrupar por</label>
                <select id="fp-agrupar" value={agruparPor} onChange={(e) => setAgruparPor(e.target.value)}>
                  {AGRUPAR_POR.map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="fp-inicio">Data inicial</label>
                <input id="fp-inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="fp-fim">Data final</label>
                <input id="fp-fim" type="date" value={dataFim} min={dataInicio} onChange={(e) => setDataFim(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="fp-uf">UF (marca as filiais dela)</label>
                <select id="fp-uf" value={uf} onChange={(e) => escolherUf(e.target.value)}>
                  <option value="">Todas as UFs</option>
                  {ufs.map((u) => <option key={u} value={u}>{u}</option>)}
                  {semUf && <option value={SEM_UF}>Sem UF no nome</option>}
                </select>
              </div>
            </div>

            <ListaMarcacao id="fp-filiais" titulo="Filiais / PDVs" placeholder="Filtrar filiais" opcoes={opcoesFiliais}
              selecionados={filiaisSel} onChange={marcarFiliais} />
            <ListaMarcacao id="fp-formas" titulo="Forma de Pagamento" placeholder="Filtrar opções" opcoes={opcoesFormas}
              selecionados={formasSel} onChange={setFormasSel} />

            {erroFiltros && <div role="alert" style={{ color: 'var(--bad)', fontSize: 13 }}>{erroFiltros}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap', alignItems: 'center',
              borderTop: '1px solid var(--line)', paddingTop: 20 }}>
              <button type="button" className="btn" onClick={limpar} disabled={ocupado}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={15} /> Limpar
              </button>
              <span style={{ flex: 1 }} />
              {[['xlsx', 'Excel', FileSpreadsheet], ['pdf', 'PDF', FileText], ['csv', 'CSV', FileText]].map(([formato, rotulo, Icone]) => (
                <button key={formato} type="button" className="btn" onClick={() => exportar(formato)}
                  disabled={ocupado || Boolean(erroFiltros)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icone size={15} /> {exportando === formato ? 'Gerando…' : rotulo}
                </button>
              ))}
              <button type="button" className="btn solid" onClick={pesquisar} disabled={ocupado || Boolean(erroFiltros)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Search size={15} /> {carregando ? 'Pesquisando…' : 'Pesquisar'}
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 16 }} aria-live="polite">
        {erro ? (
          <div role="alert" style={{ color: 'var(--bad)' }}>
            {erro} <button type="button" className="btn sm" onClick={pesquisar}>Tentar de novo</button>
          </div>
        ) : carregando ? (
          <div style={{ color: 'var(--text-faint)' }}>Carregando…</div>
        ) : !relatorio ? (
          <div style={{ color: 'var(--text-faint)' }}>Escolha os filtros e clique em Pesquisar.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {relatorio.semDataFinalizacao > 0 && (
              <div className="badge warn" style={{ alignSelf: 'flex-start', whiteSpace: 'normal' }}>
                {relatorio.semDataFinalizacao} venda(s) concluída(s) sem data de finalização ficaram fora do relatório.
              </div>
            )}
            {relatorio.grupos.length === 0 ? (
              <div style={{ color: 'var(--text-faint)' }}>Nenhuma venda no período.</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <Cartao titulo="Total geral" valor={formatarMoeda(relatorio.totalGeral)}
                    detalhe={`${relatorio.quantidadeVendas} venda(s)`} />
                  <Cartao titulo="Pagamentos" valor={relatorio.quantidadePagamentos} />
                  <Cartao titulo="Forma mais usada" valor={maisUsada?.formaRotulo ?? '—'}
                    detalhe={maisUsada ? `${formatarMoeda(maisUsada.valor)} · ${percentualBR(maisUsada.percentual)}` : undefined} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn sm" onClick={() => setAbertos(new Set(relatorio.grupos.map((g) => g.chave)))}>
                    Expandir todos
                  </button>
                  <button type="button" className="btn sm" onClick={() => setAbertos(new Set())}>Recolher todos</button>
                </div>
                <TabelaGrupos relatorio={relatorio} abertos={abertos} onAlternar={alternarGrupo} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
