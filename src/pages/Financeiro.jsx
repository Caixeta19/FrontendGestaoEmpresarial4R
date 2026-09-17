import { useState } from 'react';
import { financeiroDemo } from '../data/demoData.js';
import { useToast } from '../components/ToastContext.jsx';

export default function Financeiro() {
  const [tab, setTab] = useState('receber');
  const [baixadas, setBaixadas] = useState({});
  const showToast = useToast();
  const rows = financeiroDemo[tab];

  return (
    <section className="view">
      <div className="topbar">
        <div>
          <h1>Financeiro</h1>
          <div className="sub">Contas a pagar e a receber (US-101 / US-102 / US-104)</div>
        </div>
      </div>
      <div className="kpi-row">
        <div className="kpi"><div className="lbl">A receber (30 dias)</div><div className="val mono" style={{ color: 'var(--good)' }}>R$ 42.180</div></div>
        <div className="kpi"><div className="lbl">A pagar (30 dias)</div><div className="val mono" style={{ color: 'var(--bad)' }}>R$ 19.640</div></div>
        <div className="kpi"><div className="lbl">Vencidas</div><div className="val mono">4</div></div>
        <div className="kpi"><div className="lbl">Saldo projetado</div><div className="val mono">R$ 22.540</div></div>
      </div>
      <div className="tabs">
        <div className={'tab' + (tab === 'receber' ? ' active' : '')} onClick={() => setTab('receber')}>Contas a receber</div>
        <div className={'tab' + (tab === 'pagar' ? ' active' : '')} onClick={() => setTab('pagar')}>Contas a pagar</div>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th></th><th>Descrição</th><th>Cliente / Fornecedor</th><th>Vencimento</th><th>Valor</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.map((r, idx) => {
                const key = tab + idx;
                const isBaixada = baixadas[key];
                return (
                  <tr key={key} style={{ opacity: isBaixada ? 0.4 : 1 }}>
                    <td>{tab === 'receber' ? <span style={{ color: 'var(--good)' }}>↓</span> : <span style={{ color: 'var(--bad)' }}>↑</span>}</td>
                    <td><b>{r.desc}</b></td>
                    <td>{r.quem}</td>
                    <td className="mono">{r.venc}</td>
                    <td className="mono">{r.valor}</td>
                    <td>{r.status === 'vencida' ? <span className="badge bad">Vencida</span> : <span className="badge warn">Pendente</span>}</td>
                    <td>
                      <button
                        className="btn sm"
                        onClick={() => { setBaixadas((b) => ({ ...b, [key]: true })); showToast('Conta baixada com sucesso.'); }}
                      >
                        Dar baixa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
