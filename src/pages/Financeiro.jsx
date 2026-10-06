import React, { useState } from 'react';
import { financeiroDemo } from '../data/demoData.js';
import { useToast } from '../components/ToastContext.jsx';
import DetalhesContaModal from '../components/DetalhesContaModal.jsx';
import { Eye } from 'lucide-react';

export default function Financeiro() {
  const [tab, setTab] = useState('receber');
  const [baixadas, setBaixadas] = useState({});
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const showToast = useToast();
  const rows = financeiroDemo[tab] || [];

  const handleBaixar = (key, r) => {
    setBaixadas((b) => ({ ...b, [key]: true }));
    showToast(`Conta "${r.desc}" baixada com sucesso via conciliação bancária.`);
  };

  return (
    <section className="view" style={{ width: '100%', boxSizing: 'border-box' }}>
      <div className="topbar">
        <div>
          <h1>Financeiro</h1>
          <div className="sub">Contas a pagar e a receber (Integração Banco do Brasil / Banco Próprio)</div>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          <div className="lbl">A receber (30 dias)</div>
          <div className="val mono" style={{ color: 'var(--good)' }}>R$ 42.180</div>
        </div>
        <div className="kpi">
          <div className="lbl">A pagar (30 dias)</div>
          <div className="val mono" style={{ color: 'var(--bad)' }}>R$ 19.640</div>
        </div>
        <div className="kpi">
          <div className="lbl">Vencidas</div>
          <div className="val mono">4</div>
        </div>
        <div className="kpi">
          <div className="lbl">Saldo projetado</div>
          <div className="val mono">R$ 22.540</div>
        </div>
      </div>

      <div className="tabs">
        <div className={'tab' + (tab === 'receber' ? ' active' : '')} onClick={() => setTab('receber')}>
          Contas a receber
        </div>
        <div className={'tab' + (tab === 'pagar' ? ' active' : '')} onClick={() => setTab('pagar')}>
          Contas a pagar
        </div>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Descrição</th>
                <th>Cliente / Fornecedor</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => {
                const key = tab + idx;
                const isBaixada = baixadas[key];
                return (
                  <tr key={key} style={{ opacity: isBaixada ? 0.4 : 1 }}>
                    <td>
                      {tab === 'receber' ? (
                        <span style={{ color: 'var(--good)' }}>↓</span>
                      ) : (
                        <span style={{ color: 'var(--bad)' }}>↑</span>
                      )}
                    </td>
                    <td><b>{r.desc}</b></td>
                    <td>{r.quem}</td>
                    <td className="mono">{r.venc}</td>
                    <td className="mono">{r.valor}</td>
                    <td>
                      {isBaixada ? (
                        <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                          Conciliado / Pago
                        </span>
                      ) : r.status === 'vencida' ? (
                        <span className="badge bad">Vencida</span>
                      ) : (
                        <span className="badge warn">Pendente</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="btn sm"
                        title="Ver Detalhes, Comprovante e Nota Fiscal"
                        onClick={() => setContaSelecionada(r)}
                        style={{ 
                          background: 'var(--input-bg)', 
                          border: '1px solid var(--line)', 
                          color: 'var(--text)', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 4, 
                          cursor: 'pointer',
                          padding: '6px 10px',
                          borderRadius: 6
                        }}
                      >
                        <Eye size={14} /> Detalhes
                      </button>
                      {!isBaixada && (
                        <button
                          className="btn sm"
                          onClick={() => handleBaixar(key, r)}
                          style={{ 
                            background: '#9333ea', 
                            color: '#fff', 
                            border: 'none', 
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontWeight: 600
                          }}
                        >
                          Dar baixa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes da Conta, Webhook e Notas Fiscais */}
      <DetalhesContaModal 
        conta={contaSelecionada} 
        onClose={() => setContaSelecionada(null)} 
      />
    </section>
  );
}