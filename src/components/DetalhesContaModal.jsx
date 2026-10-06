import React from 'react';
import { X, FileText, CheckCircle2, Building2 } from 'lucide-react';

export default function DetalhesContaModal({ conta, onClose }) {
  if (!conta) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16
      }}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 540,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          color: 'var(--text)',
          boxSizing: 'border-box'
        }}
      >
        {/* Cabeçalho do Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: 8, borderRadius: 8 }}>
              <FileText size={20} color="#c084fc" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#c084fc' }}>
                Detalhes da Transação
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>
                ID: {conta.id || 'TRX-98421'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Informações Principais */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: 'var(--input-bg)', padding: 14, borderRadius: 10, border: '1px solid var(--line)' }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block' }}>Descrição</span>
            <strong style={{ fontSize: 13 }}>{conta.desc}</strong>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block' }}>Quem</span>
            <strong style={{ fontSize: 13 }}>{conta.quem}</strong>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block' }}>Vencimento / Valor</span>
            <span className="mono" style={{ fontSize: 13 }}>{conta.venc} — <b>{conta.valor}</b></span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block' }}>Origem Bancária</span>
            <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Building2 size={14} color="#c084fc" /> Banco do Brasil / API
            </span>
          </div>
        </div>

        {/* Status da Conciliação Automática (Webhook) */}
        <div style={{ border: '1px solid rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.05)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#c084fc' }}>
            <CheckCircle2 size={16} /> Conciliação Bancária Automática
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0, lineHeight: 1.4 }}>
            Pagamento liquidado via webhook do banco. A nota fiscal eletrônica (NF-e) foi anexada automaticamente ao sistema.
          </p>
        </div>

        {/* Botão de Ação / Visualizar Nota Fiscal */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={() => alert('A descarregar PDF da Nota Fiscal / Comprovante...')}
            style={{
              background: '#9333ea',
              border: 'none',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <FileText size={15} /> Ver Nota Fiscal (PDF)
          </button>
        </div>

      </div>
    </div>
  );
}