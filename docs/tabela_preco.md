Decisão: o preço usa sempre a TABELA REGULAR. Ajuste:
1. Remova a regra que escolhe Renova pelo serviço ("troca"/"renova"); não envie o
   parâmetro tabela para /produtos/precos/item.
2. Na área de valores, mostre "Tabela Regular" fixo e o grupo do plano.
3. Deixe o campo Serviço sem valor padrão, obrigando a escolha.
4. Troque também o combo "Plano Novo" pela lista de listarPlanos.
Rode npm run build e faça o commit.