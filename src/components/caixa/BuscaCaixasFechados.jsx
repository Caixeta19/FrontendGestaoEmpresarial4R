import { ArrowLeft, Search } from 'lucide-react';
import SeletorPdv from './SeletorPdv';
import { inputEstiloFormulario } from './estilos';

/** Filtros da lista de caixas fechados: PDV, período do caixa e conferência. */
export default function BuscaCaixasFechados({ filiais, filtros, onChange, onPesquisar, onVoltar }) {
  const campo = (nome) => (valor) => onChange({ ...filtros, [nome]: valor });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', color: 'var(--text)' }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: '24px 28px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--line)', paddingBottom: 14 }}>
          <button type="button" onClick={onVoltar} title="Voltar ao Painel"
            style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#f472b6' }}>Busca de Caixas Fechados</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 650 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'flex-start', gap: 16 }}>
            <label style={{ fontSize: 13.5, fontWeight: 600, marginTop: 8 }}>PDV</label>
            <SeletorPdv filiais={filiais} value={filtros.filialId} onChange={campo('filialId')} largura={420} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16 }}>
            <label style={{ fontSize: 13.5, fontWeight: 600 }}>Período:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="date" value={filtros.dataInicio} onChange={(e) => campo('dataInicio')(e.target.value)} style={inputEstiloFormulario} />
              <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Até</span>
              <input type="date" value={filtros.dataFim} onChange={(e) => campo('dataFim')(e.target.value)} style={inputEstiloFormulario} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16 }}>
            <label style={{ fontSize: 13.5, fontWeight: 600 }}>Caixas conferidos:</label>
            <select value={filtros.conferencia} onChange={(e) => campo('conferencia')(e.target.value)} style={{ ...inputEstiloFormulario, maxWidth: 220 }}>
              <option value="">Todos</option>
              <option value="CONFERIDO">Conferidos</option>
              <option value="AGUARDANDO">Aguardando conferência</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
            <button type="button" onClick={onVoltar}
              style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="button" onClick={onPesquisar}
              style={{ background: 'var(--accent, #c026d3)', border: 'none', color: '#fff', borderRadius: 6, padding: '8px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Search size={15} /> Pesquisar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
