import { Play } from 'lucide-react';

/** Barra de paginação do servidor (page começa em 0). */
export default function Paginacao({ pagina, totalPaginas, total, tamanho, onMudar }) {
  const de = total === 0 ? 0 : pagina * tamanho + 1;
  const ate = Math.min((pagina + 1) * tamanho, total);
  const inicio = Math.max(0, Math.min(pagina - 2, totalPaginas - 5));
  const numeros = Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => inicio + i);

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', background: '#581c87', color: '#fff', borderRadius: 4, overflow: 'hidden', fontSize: 12.5 }}>
        <span style={{ padding: '6px 14px', fontWeight: 600 }}>
          total: {total} registro(s), visualizando de {de} até {ate}.
        </span>
        <button
          type="button"
          onClick={() => onMudar(Math.max(0, pagina - 1))}
          disabled={pagina === 0}
          aria-label="Página anterior"
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: pagina === 0 ? 'default' : 'pointer', padding: '6px 10px', opacity: pagina === 0 ? 0.5 : 1 }}
        >
          <Play size={10} style={{ transform: 'rotate(180deg)', fill: 'currentColor' }} />
        </button>
        {numeros.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onMudar(n)}
            style={{ background: pagina === n ? '#7e22ce' : 'transparent', border: 'none', color: '#fff', fontWeight: 700, padding: '6px 12px', cursor: 'pointer' }}
          >
            {n + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onMudar(Math.min(totalPaginas - 1, pagina + 1))}
          disabled={pagina >= totalPaginas - 1}
          aria-label="Próxima página"
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: pagina >= totalPaginas - 1 ? 'default' : 'pointer', padding: '6px 10px', opacity: pagina >= totalPaginas - 1 ? 0.5 : 1 }}
        >
          <Play size={10} style={{ fill: 'currentColor' }} />
        </button>
      </div>
    </div>
  );
}
