import { useCallback, useEffect, useRef, useState } from 'react';
import {
  assinarConciliacao, cancelarContaPagar, listarContasPagarFiltradas, listarLancamentosExtrato, listarLogs,
  permissoesContasPagar, reabrirContaPagar, reprocessarLog, resumoContasPagar,
} from '../services/financeiroApi';
import { useToast } from './ToastContext.jsx';
import ListaContasPagar from './contaspagar/ListaContasPagar.jsx';
import ModalBaixaManual from './contaspagar/ModalBaixaManual.jsx';
import ModalContaPagar from './contaspagar/ModalContaPagar.jsx';
import ModalMotivo from './contaspagar/ModalMotivo.jsx';
import PainelExtrato from './contaspagar/PainelExtrato.jsx';
import {
  BADGE_LOG, BANCO, CANAL, codigoErro, dataHoraBR, formatarMoeda, horaBR, mensagemErro,
} from './contaspagar/utilContasPagar.js';

const SEM_PERMISSAO = { consultar: true, gerenciar: false, baixaManual: false, sincronizar: false };
const FILTROS_VAZIOS = { status: '', vencimentoDe: '', vencimentoAte: '', busca: '' };

function Badge({ mapa, valor }) {
  const [classe, texto] = mapa[valor] || ['neutral', valor];
  return <span className={`badge ${classe}`}>{texto}</span>;
}

const listaDe = (r) => (Array.isArray(r) ? r : r?.content || []);

/** Aba "Contas a pagar" do Financeiro: cadastro, conciliação pelo extrato do BB e comprovante. */
export default function ContasPagarConciliacao() {
  const [aba, setAba] = useState('contas');
  const [contas, setContas] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [permissoes, setPermissoes] = useState(SEM_PERMISSAO);
  const [logs, setLogs] = useState([]);
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_VAZIOS);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [situacao, setSituacao] = useState('AMBIGUO');
  const [lancamentos, setLancamentos] = useState([]);
  const [contagemExtrato, setContagemExtrato] = useState(0);
  const [carregandoExtrato, setCarregandoExtrato] = useState(false);
  const [erroExtrato, setErroExtrato] = useState('');
  const [contasPendentes, setContasPendentes] = useState([]);
  const [bancoPorConta, setBancoPorConta] = useState({});
  const [semPermissao, setSemPermissao] = useState(false);
  const [modal, setModal] = useState(null); // { tipo, conta }
  const [destaque, setDestaque] = useState({});
  const [aoVivo, setAoVivo] = useState(false);
  const showToast = useToast();
  const filtrosRef = useRef(filtrosAplicados);
  filtrosRef.current = filtrosAplicados;
  const situacaoRef = useRef(situacao);
  situacaoRef.current = situacao;

  // A busca por texto espera o usuário parar de digitar; os demais filtros valem na hora.
  useEffect(() => {
    const t = setTimeout(() => setFiltrosAplicados(filtros), 300);
    return () => clearTimeout(t);
  }, [filtros]);

  const carregarContas = useCallback(async () => {
    const params = Object.fromEntries(Object.entries(filtrosRef.current).filter(([, v]) => v));
    const [c, r, p] = await Promise.all([listarContasPagarFiltradas(params), resumoContasPagar(), permissoesContasPagar()]);
    setContas(listaDe(c));
    setResumo(r);
    setPermissoes({ ...SEM_PERMISSAO, ...p });
    // Contas pendentes (sem filtro) para o "Vincular a uma conta…".
    // O backend aceita vincular em conta ABERTO ou DIVERGENTE.
    if (Object.keys(params).length === 0) setContasPendentes(listaDe(c).filter((x) => x.status === 'ABERTO' || x.status === 'DIVERGENTE'));
  }, []);

  const carregarExtrato = useCallback(async () => {
    setCarregandoExtrato(true);
    setErroExtrato('');
    try {
      const [amb, sem] = await Promise.all([listarLancamentosExtrato('AMBIGUO'), listarLancamentosExtrato('SEM_CORRESPONDENCIA')]);
      setContagemExtrato(listaDe(amb).length + listaDe(sem).length);
      // Lançamento ambíguo com tituloId é o valor que o banco pagou numa conta DIVERGENTE.
      setBancoPorConta(Object.fromEntries(listaDe(amb).filter((x) => x.tituloId != null).map((x) => [x.tituloId, x.valor])));
      const atual = situacaoRef.current;
      if (atual === 'AMBIGUO') setLancamentos(listaDe(amb));
      else if (atual === 'SEM_CORRESPONDENCIA') setLancamentos(listaDe(sem));
      else setLancamentos(listaDe(await listarLancamentosExtrato(atual)));
    } catch (e) {
      setErroExtrato(mensagemErro(e));
    } finally {
      setCarregandoExtrato(false);
    }
  }, []);

  const carregarTudo = useCallback(async () => {
    try {
      setErro('');
      setSemPermissao(false);
      const [, l] = await Promise.all([carregarContas(), listarLogs()]);
      setLogs(l);
    } catch (e) {
      setSemPermissao(codigoErro(e) === 'FINANCEIRO_SEM_PERMISSAO');
      setErro(mensagemErro(e));
    } finally {
      setCarregando(false);
    }
    carregarExtrato();
  }, [carregarContas, carregarExtrato]);

  useEffect(() => { carregarTudo(); }, [carregarTudo]);

  // Mudou filtro: só a lista de contas.
  const primeiro = useRef(true);
  useEffect(() => {
    if (primeiro.current) { primeiro.current = false; return; }
    carregarContas().catch((e) => setErro(mensagemErro(e)));
  }, [filtrosAplicados, carregarContas]);

  // Mudou a situação do extrato: recarrega os lançamentos.
  useEffect(() => { carregarExtrato(); }, [situacao, carregarExtrato]);

  useEffect(() => {
    const fechar = assinarConciliacao((ev) => {
      setAoVivo(true);
      if (ev.contaId) {
        setDestaque((d) => ({ ...d, [ev.contaId]: true }));
        setTimeout(() => setDestaque((d) => ({ ...d, [ev.contaId]: false })), 4000);
      }
      showToast(ev.mensagem, ev.resultado !== 'CONCILIADA');
      carregarTudo(); // o servidor é a fonte da verdade
    });
    return fechar;
  }, [carregarTudo, showToast]);

  const concluido = (msg) => { setModal(null); showToast(msg); carregarTudo(); };
  const acao = (tipo, conta) => setModal({ tipo, conta });

  // O backend manda o canal como texto (DESLIGADO|AGUARDANDO|CONECTADO|COM_ERRO) e a hora na raiz do resumo.
  const canal = CANAL[resumo?.canalBancario] || CANAL.AGUARDANDO;
  const sincronizadoEm = resumo?.ultimaSincronizacao;
  const errosLog = logs.filter((l) => l.status === 'ERRO').length;

  return (
    <>
      <div className="kpi-row">
        <div className="kpi"><div className="lbl">Em aberto</div><div className="val mono" style={{ color: 'var(--bad)' }}>{resumo ? formatarMoeda(resumo.totalEmAberto) : '—'}</div></div>
        <div className="kpi"><div className="lbl">Conciliadas (auto)</div><div className="val mono" style={{ color: 'var(--good)' }}>{resumo ? resumo.conciliadas : '—'}</div></div>
        <div className="kpi"><div className="lbl">Divergências</div><div className="val mono" style={{ color: 'var(--warn)' }}>{resumo ? resumo.divergencias : '—'}</div></div>
        <div className="kpi">
          <div className="lbl">Canal bancário{aoVivo ? ' · ao vivo' : ''}</div>
          <div className="val" style={{ fontSize: 15, color: canal.cor }}>{canal.texto}</div>
          {sincronizadoEm && resumo?.canalBancario !== 'DESLIGADO' && (
            <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>última sincronização às {horaBR(sincronizadoEm)}</div>
          )}
        </div>
      </div>

      <div className="tabs">
        <div className={'tab' + (aba === 'contas' ? ' active' : '')} onClick={() => setAba('contas')}>Contas</div>
        <div className={'tab' + (aba === 'logs' ? ' active' : '')} onClick={() => setAba('logs')}>
          Retorno bancário <span className="count">{contagemExtrato + errosLog || ''}</span>
        </div>
      </div>

      <div className="panel">
        {erro ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--bad)', marginBottom: 10 }}>{erro}</p>
            {!semPermissao && <button type="button" className="btn" onClick={() => { setCarregando(true); carregarTudo(); }}>Tentar de novo</button>}
          </div>
        ) : carregando ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-faint)' }}>Carregando…</div>
        ) : aba === 'contas' ? (
          <ListaContasPagar contas={contas} filtros={filtros} onFiltros={setFiltros} permissoes={permissoes} destaque={destaque} bancoPorConta={bancoPorConta} acao={acao} showToast={showToast} />
        ) : (
          <>
            <div className="table-wrap" style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Recebido em</th><th>Banco</th><th>Situação</th><th>Tentativas</th><th>Detalhe</th><th></th></tr></thead>
                <tbody>
                  {logs.length === 0 && <tr><td colSpan={6} style={{ color: 'var(--text-faint)' }}>Nenhum retorno recebido.</td></tr>}
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td className="mono">{dataHoraBR(l.recebidoEm)}</td>
                      <td>{BANCO[l.provider] || l.provider}</td>
                      <td><Badge mapa={BADGE_LOG} valor={l.status} /></td>
                      <td className="mono">{l.tentativas}</td>
                      <td style={{ maxWidth: 360 }}>{l.erro || '—'}</td>
                      <td>{l.status === 'ERRO' && (
                        <button type="button" className="btn sm" onClick={async () => { await reprocessarLog(l.id); carregarTudo(); }}>Reprocessar</button>
                      )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PainelExtrato lancamentos={lancamentos} situacao={situacao} onSituacao={setSituacao} contasPendentes={contasPendentes}
              permissoes={permissoes} carregando={carregandoExtrato} erro={erroExtrato} onTentar={carregarExtrato}
              onMudou={carregarTudo} showToast={showToast} />
          </>
        )}
      </div>

      {modal?.tipo === 'nova' && <ModalContaPagar onFechar={() => setModal(null)} onConcluido={concluido} />}
      {modal?.tipo === 'editar' && <ModalContaPagar conta={modal.conta} onFechar={() => setModal(null)} onConcluido={concluido} />}
      {modal?.tipo === 'baixa' && <ModalBaixaManual conta={modal.conta} onFechar={() => setModal(null)} onConcluido={concluido} />}
      {modal?.tipo === 'cancelar' && (
        <ModalMotivo titulo="Cancelar conta" subtitulo={`${modal.conta.descricao} · ${modal.conta.fornecedor}`} botao="Cancelar conta" perigo
          onFechar={() => setModal(null)}
          onConfirmar={async (motivo) => { await cancelarContaPagar(modal.conta.id, motivo); concluido('Conta cancelada.'); }} />
      )}
      {modal?.tipo === 'reabrir' && (
        <ModalMotivo titulo="Reabrir conta paga" subtitulo={`${modal.conta.descricao} · ${modal.conta.fornecedor}`} rotulo="Justificativa" botao="Reabrir"
          onFechar={() => setModal(null)}
          onConfirmar={async (j) => { await reabrirContaPagar(modal.conta.id, j); concluido('Conta reaberta.'); }} />
      )}
    </>
  );
}
