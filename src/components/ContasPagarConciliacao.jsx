import { useCallback, useEffect, useState } from 'react';
import { listarContasPagar, listarLogs, reprocessarLog, assinarConciliacao } from '../services/financeiroApi';
import { useToast } from './ToastContext.jsx';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dataBR = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR') : '—');

const BADGE_CONTA = {
  ABERTO: ['warn', 'Em aberto'],
  BAIXADO: ['good', 'Baixado'],
  DIVERGENTE: ['bad', 'Divergência'],
  VENCIDA: ['bad', 'Vencida'],
};
// "Vencida" não é um status: é ABERTO com vencimento no passado.
const statusVisual = (c) =>
  c.status === 'ABERTO' && new Date(c.vencimento + 'T23:59:59') < new Date() ? 'VENCIDA' : c.status;
const BADGE_LOG = {
  RECEBIDO: ['warn', 'Na fila'],
  PROCESSADO: ['good', 'Processado'],
  ERRO: ['bad', 'Erro'],
  REJEITADO: ['neutral', 'Rejeitado'],
};
const BANCO = { BANCO_BRASIL: 'Banco do Brasil', BANCO_PROPRIO: 'Banco próprio' };

function Badge({ mapa, valor }) {
  const [classe, texto] = mapa[valor] || ['neutral', valor];
  return <span className={`badge ${classe}`}>{texto}</span>;
}

/** Substitui a aba "Contas a pagar" do Financeiro.jsx. */
export default function ContasPagarConciliacao() {
  const [aba, setAba] = useState('contas');
  const [contas, setContas] = useState([]);
  const [logs, setLogs] = useState([]);
  const [destaque, setDestaque] = useState({});       // contaId -> true (pisca ao conciliar)
  const [ao_vivo, setAoVivo] = useState(false);
  const showToast = useToast();

  const carregar = useCallback(async () => {
    try {
      const [c, l] = await Promise.all([listarContasPagar(), listarLogs()]);
      setContas(c);
      setLogs(l);
    } catch {
      showToast('Não foi possível carregar o financeiro.', true);
    }
  }, [showToast]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    const fechar = assinarConciliacao((ev) => {
      setAoVivo(true);
      if (ev.contaId) {
        setDestaque((d) => ({ ...d, [ev.contaId]: true }));
        setTimeout(() => setDestaque((d) => ({ ...d, [ev.contaId]: false })), 4000);
      }
      showToast(ev.mensagem, ev.resultado !== 'CONCILIADA');
      carregar();                                     // fonte da verdade continua sendo o servidor
    });
    return fechar;
  }, [carregar, showToast]);

  const pagas = contas.filter((c) => c.status === 'BAIXADO').length;
  const abertas = contas.filter((c) => c.status === 'ABERTO');
  const divergentes = contas.filter((c) => c.status === 'DIVERGENTE').length;
  const totalAberto = abertas.reduce((s, c) => s + Number(c.valor), 0);

  return (
    <>
      <div className="kpi-row">
        <div className="kpi"><div className="lbl">Em aberto</div><div className="val mono" style={{ color: 'var(--bad)' }}>{moeda.format(totalAberto)}</div></div>
        <div className="kpi"><div className="lbl">Conciliadas (auto)</div><div className="val mono" style={{ color: 'var(--good)' }}>{pagas}</div></div>
        <div className="kpi"><div className="lbl">Divergências</div><div className="val mono" style={{ color: 'var(--warn)' }}>{divergentes}</div></div>
        <div className="kpi"><div className="lbl">Canal bancário</div><div className="val" style={{ fontSize: 15 }}>{ao_vivo ? '● Ao vivo' : '○ Aguardando'}</div></div>
      </div>

      <div className="tabs">
        <div className={'tab' + (aba === 'contas' ? ' active' : '')} onClick={() => setAba('contas')}>Contas</div>
        <div className={'tab' + (aba === 'logs' ? ' active' : '')} onClick={() => setAba('logs')}>
          Retorno bancário <span className="count">{logs.filter((l) => l.status === 'ERRO').length || ''}</span>
        </div>
      </div>

      <div className="panel"><div className="table-wrap">
        {aba === 'contas' ? (
          <table>
            <thead><tr><th>Descrição</th><th>Fornecedor</th><th>Vencimento</th><th>Valor</th><th>Status</th><th>Pago em</th><th>Banco</th><th>Comprovante</th></tr></thead>
            <tbody>
              {contas.map((c) => (
                <tr key={c.id} style={destaque[c.id] ? { background: 'var(--good-soft)', transition: 'background .4s' } : undefined}>
                  <td><b>{c.descricao}</b></td>
                  <td>{c.fornecedor}</td>
                  <td className="mono">{new Date(c.vencimento + 'T00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="mono">{moeda.format(c.valor)}</td>
                  <td><Badge mapa={BADGE_CONTA} valor={statusVisual(c)} /></td>
                  <td className="mono">{dataBR(c.dataPagamento)}</td>
                  <td>{BANCO[c.banco] || '—'}</td>
                  <td>{c.comprovanteUrl ? <a href={c.comprovanteUrl} target="_blank" rel="noopener noreferrer">Abrir</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead><tr><th>Recebido em</th><th>Banco</th><th>Situação</th><th>Tentativas</th><th>Detalhe</th><th></th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="mono">{dataBR(l.recebidoEm)}</td>
                  <td>{BANCO[l.provider] || l.provider}</td>
                  <td><Badge mapa={BADGE_LOG} valor={l.status} /></td>
                  <td className="mono">{l.tentativas}</td>
                  <td style={{ maxWidth: 360 }}>{l.erro || '—'}</td>
                  <td>{l.status === 'ERRO' && (
                    <button className="btn sm" onClick={async () => { await reprocessarLog(l.id); carregar(); }}>Reprocessar</button>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div></div>
    </>
  );
}