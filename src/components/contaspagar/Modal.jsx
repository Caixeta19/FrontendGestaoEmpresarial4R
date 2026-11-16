import { useEffect, useRef } from 'react';

/** Casca dos modais: overlay do tema, Esc fecha (exceto enviando), foco no primeiro campo. */
export default function Modal({ titulo, subtitulo, onFechar, bloqueado = false, largura = 480, children }) {
  const ref = useRef(null);
  const fecharRef = useRef(onFechar);
  fecharRef.current = onFechar;

  useEffect(() => {
    ref.current?.querySelector('input:not([type=hidden]),select,textarea')?.focus();
  }, []);

  useEffect(() => {
    const aoTeclar = (e) => { if (e.key === 'Escape' && !bloqueado) fecharRef.current(); };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [bloqueado]);

  return (
    <div className="modal-overlay show" onMouseDown={(e) => { if (e.target === e.currentTarget && !bloqueado) onFechar(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} ref={ref}
        style={{ maxWidth: largura, maxHeight: '92vh', overflowY: 'auto' }}>
        <h3>{titulo}</h3>
        {subtitulo && <p>{subtitulo}</p>}
        {children}
      </div>
    </div>
  );
}

export function AlertaErro({ children }) {
  if (!children) return null;
  return (
    <div role="alert" style={{ border: '1px solid var(--bad)', color: 'var(--bad)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginTop: 12 }}>
      {children}
    </div>
  );
}
