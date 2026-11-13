/**
 * Cabeçalho padrão de página: selo de ícone + h1 (cor via token --title) + subtítulo + ações.
 * Uso: <TituloPagina icone={<Icon size={20} />} subtitulo="..." acoes={<button/>}>Texto</TituloPagina>
 */
export default function TituloPagina({ icone, subtitulo, acoes, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {icone && (
          <div
            style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'var(--accent-soft)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {icone}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0 }}>{children}</h1>
          {subtitulo && <div className="page-subtitle">{subtitulo}</div>}
        </div>
      </div>
      {acoes && <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{acoes}</div>}
    </div>
  );
}
