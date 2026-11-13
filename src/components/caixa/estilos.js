// Estilos Reutilizáveis
export const cardEstilo = {
  background: 'var(--panel)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  padding: '16px 24px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  transition: 'background 0.2s ease, border-color 0.2s ease'
};

export const topoCardEstilo = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

export const botaoAvaliarEstilo = {
  background: 'var(--input-bg)',
  border: '1px solid var(--line)',
  borderRadius: 20,
  color: 'var(--text)',
  padding: '6px 16px',
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'all 0.15s ease'
};

export const conteudoAbertoEstilo = {
  paddingTop: 16,
  marginTop: 14,
  borderTop: '1px solid var(--line)',
  display: 'flex',
  flexDirection: 'column',
  gap: 12
};

export const botaoQuadradoEstilo = {
  background: 'var(--panel-2)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  padding: '24px 28px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  cursor: 'pointer',
  color: 'var(--text)',
  minWidth: 125,
  transition: 'transform 0.15s ease, border-color 0.15s ease'
};

export const iconeWrapperEstilo = {
  width: 44,
  height: 44,
  borderRadius: 10,
  background: 'rgba(192, 38, 211, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--accent, #c026d3)'
};

export const botaoBarraSuperior = {
  border: '1px solid var(--line)',
  borderRadius: 8,
  padding: '8px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  cursor: 'pointer',
  minWidth: 85,
  background: 'var(--panel)',
  color: 'var(--text)',
  transition: 'all 0.15s ease'
};

export const inputEstiloFormulario = {
  background: 'var(--panel-2, #181329)',
  border: '1px solid var(--line, #382b4f)',
  color: 'var(--text, #ffffff)',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

export const selectEstiloCascata = {
  background: 'var(--panel-2, #1b1425)',
  border: '1px solid var(--line, #382b4f)',
  color: 'var(--text, #ffffff)',
  borderRadius: 6,
  padding: '7px 12px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  maxWidth: 320,
  cursor: 'pointer',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease'
};

export const caixaOpcaoEstilo = {
  border: '1px solid var(--line)',
  borderRadius: 6,
  padding: '12px 16px',
  background: 'var(--panel)'
};

export const legendaOpcaoEstilo = {
  padding: '0 8px',
  fontSize: 12,
  color: 'var(--text-faint)',
  fontWeight: 500
};