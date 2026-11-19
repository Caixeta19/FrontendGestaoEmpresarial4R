import React from 'react';
import { useSearchParams } from 'react-router-dom';
import TelaInicial from '../components/inventario/TelaInicial.jsx';
import TelaContagem from '../components/inventario/TelaContagem.jsx';

/** Inventário por filial: IQ09 × sistema × bipagem, e a conferência por SKU com a MB52. Telas em components/inventario. */
export default function EstoqueInventario() {
  const [params, setParams] = useSearchParams();
  const execucaoId = params.get('id');

  const abrirExecucao = (id) => setParams(id ? { id: String(id) } : {});

  return execucaoId
    ? <TelaContagem key={execucaoId} execucaoId={Number(execucaoId)} onVoltar={() => abrirExecucao(null)} />
    : <TelaInicial onAbrir={abrirExecucao} />;
}
