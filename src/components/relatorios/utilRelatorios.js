/** Data local em yyyy-MM-dd (toISOString usaria UTC e trocaria o dia à noite). */
export const dataISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const inicioDoMes = () => { const d = new Date(); d.setDate(1); return dataISO(d); };
export const hoje = () => dataISO(new Date());

/** UF da filial pelo prefixo do nome ("CE - FTZ CENTRO" -> "CE"). */
export const ufDaFilial = (nome) => /^([A-Z]{2})\s*-/.exec(String(nome || '').trim())?.[1] || '';

/** Sem acento e minúsculo, para o "Filtrar opções". */
export const semAcento = (s) => String(s || "").normalize("NFD").replace(/[0300-036f]/g, "").toLowerCase();
