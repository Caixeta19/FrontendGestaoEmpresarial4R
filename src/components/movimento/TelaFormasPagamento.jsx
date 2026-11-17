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

/**
 * Lista de marcação em popover (filiais e formas). Conjunto vazio = "todas". Esc e clique fora fecham.
 */
function MultiSelecao({ id, rotulo, opcoes, selecionados, onChange, todasTexto, plural }) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const raiz = useRef(null);
  const botao = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;
    const fora = (e) => { if (raiz.current && !raiz.current.contains(e.target)) setAberto(false); };
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  }, [aberto]);

  const fechar = () => { setAberto(false); botao.current?.focus(); };
  const visiveis = opcoes.filter((o) => semAcento(o.rotulo).includes(semAcento(busca)));
  const alternar = (valor) => {
    const novo = new Set(selecionados);
    if (novo.has(valor)) novo.delete(valor); else novo.add(valor);
    onChange(novo);
  };
  const resumo = selecionados.size === 0 ? todasTexto : `${selecionados.size} ${plural} selecionada(s)`;

  return (
    <div className="field" ref={raiz} style={{ position: 'relative' }}
      onKeyDown={(e) => { if (e.key === 'Escape' && aberto) { e.stopPropagation(); fechar(); } }}>
      <label htmlFor={id}>{rotulo}</label>
      <button id={id} ref={botao} type="button" className="btn" aria-haspopup="listbox" aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        style={{ width: '100%', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumo}</span>
        <ChevronDown size={14} />
      </button>
      {aberto && (
        <div role="group" aria-label={rotulo} style={{
          position: 'absolute', zIndex: 20, top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--panel)',
          border: '1px solid var(--line)', borderRadius: 10, padding: 10, boxShadow: '0 8px 24px rgba(0,0,0,.25)',
        }}>
          <input type="search" aria-label={`Filtrar ${plural}s`} placeholder="Filtrar…" value={busca}
            onChange={(e) => setBusca(e.target.value)} autoFocus style={{ width: '100%', marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button type="button" className="btn sm" onClick={() => onChange(new Set(visiveis.map((o) => o.valor)))}>
              Marcar visíveis
            </button>
            <button type="button" className="btn sm" onClick={() => onChange(new Set())}>Limpar (todas)</button>
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {visiveis.length === 0 && <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Nenhuma opção.</div>}
            {visiveis.map((o) => (
              <label key={o.valor} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 2px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selecionados.has(o.valor)} onChange={() => alternar(o.valor)} />
                <span>{o.rotulo}</span>
              </label>
            ))}
          </div>
        </div>
      )}
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
  const { ufs, semUf } = useMemo(() => ufsDasFiliais(filiais), [filiais]);
  const filiaisDaUf = useMemo(() => filiais.filter((f) => filialDaUf(f, uf)), [filiais, uf]);
  const opcoesFiliais = useMemo(
    () => filiaisDaUf.map((f) => ({ valor: f.id, rotulo: f.nome })), [filiaisDaUf]);
  const opcoesFormas = useMemo(
    () => (opcoes?.formas ?? []).map((f) => ({ valor: f.valor, rotulo: f.rotulo })), [opcoes]);

  const erroPeriodo = validarPeriodo(dataInicio, dataFim);
  // Sem filial marcada, a UF escolhida restringe as filiais; sem UF nem filial, vale o escopo todo do usuário.
  const filialIds = filiaisSel.size > 0 ? [...filiaisSel] : (uf ? filiaisDaUf.map((f) => f.id) : []);
  const filtros = { dataInicio, dataFim, agruparPor, filialIds, formas: [...formasSel] };
  const semFiliaisNaUf = Boolean(uf) && filiaisDaUf.length === 0;

  const pesquisar = async () => {
    if (pesquisando.current) return;
    if (erroPeriodo) { showToast(erroPeriodo, true); return; }
    if (semFiliaisNaUf) { showToast('Nenhuma filial nessa UF.', true); return; }
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
    if (erroPeriodo) { showToast(erroPeriodo, true); return; }
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
    setUf('');
    setFiliaisSel(new Set());
    setFormasSel(new Set());
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
        ) : (
          <>
            <div className="section-label">Filtros</div>
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
                <label htmlFor="fp-uf">UF</label>
                <select id="fp-uf" value={uf} onChange={(e) => { setUf(e.target.value); setFiliaisSel(new Set()); }}>
                  <option value="">Todas as UFs</option>
                  {ufs.map((u) => <option key={u} value={u}>{u}</option>)}
                  {semUf && <option value={SEM_UF}>Sem UF no nome</option>}
                </select>
              </div>
              <MultiSelecao id="fp-filiais" rotulo="Filiais / PDVs" opcoes={opcoesFiliais} selecionados={filiaisSel}
                onChange={setFiliaisSel} todasTexto={uf ? 'Todas da UF' : 'Todas as filiais'} plural="filial" />
              <MultiSelecao id="fp-formas" rotulo="Formas de pagamento" opcoes={opcoesFormas} selecionados={formasSel}
                onChange={setFormasSel} todasTexto="Todas as formas" plural="forma" />
            </div>
            {erroPeriodo && <div role="alert" style={{ color: 'var(--bad)', fontSize: 13 }}>{erroPeriodo}</div>}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="button" className="btn solid" onClick={pesquisar}
                disabled={!opcoes || ocupado || Boolean(erroPeriodo)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Search size={15} /> {carregando ? 'Pesquisando…' : 'Pesquisar'}
              </button>
              <button type="button" className="btn" onClick={limpar} disabled={ocupado}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={15} /> Limpar
              </button>
              <span style={{ flex: 1 }} />
              {[['xlsx', 'Excel', FileSpreadsheet], ['pdf', 'PDF', FileText], ['csv', 'CSV', FileText]].map(([formato, rotulo, Icone]) => (
                <button key={formato} type="button" className="btn" onClick={() => exportar(formato)}
                  disabled={!opcoes || ocupado || Boolean(erroPeriodo)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icone size={15} /> {exportando === formato ? 'Gerando…' : rotulo}
                </button>
              ))}
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
