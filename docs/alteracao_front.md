# Tarefa: frontend usar a nova tabela de preços (depois da tarefa do backend)

## Contexto
Frontend SYSCOR (React 18 + Vite). O backend Java passou a calcular o preço pela tabela vigente da Telefônica:
preço = produto (Nome Comercial) + grupo do plano do cliente + tabela (REGULAR/RENOVA) + forma de pagamento.
Antes de começar, confira no backend (README ou controllers) se os endpoints abaixo saíram com estes nomes e campos; se algo diferir, siga o backend e me avise.

Endpoints (sob `VITE_API_URL`, que já termina em `/api`):
- `GET /produtos/precos/vigente` → `{ execucaoId, vigencia, importadoEm, totais }`
- `GET /produtos/precos/planos?busca=&disponivelAlta=` → `[{ nomePlano, grupoPlano, sistema, disponivelAlta }]`
- `GET /produtos/precos/item?estoqueId=&plano=&tabela=&pagamento=` → `{ nomeComercial, tabela, grupoPlano, preco, precoPix, parcelas, valorAplicado, vigencia }` (422 quando o item não tem preço)
- `POST /produtos/precos/importar-telefonica` (multipart `arquivo`) → `{ execucaoId, vigencia, linhasPorAba, totalPrecos, totalPlanos, totalProdutos, unidadesAtualizadas, estoqueSemPreco, planilhaSemEstoque }`
- `GET /estoque-geral/disponiveis?busca=&limite=` → `[{ id, serial, tipoProduto, categoria, marca, modeloComercial, cor, codigoAcessorio, filialEstoque, valorVenda }]`

## 1. Serviços (`src/services/vendasApi.js`)
- `buscarAparelhos(busca)`: chamar `/estoque-geral/disponiveis`; remover o filtro `categoria === 'PRODUTO_VIVO'`; considerar aparelho todo item sem `codigoAcessorio` (null, vazio, `''` ou `-`); mapear `{ produtoId: id, nome: modeloComercial, cor, marca, imei: serial, filial: filialEstoque, precoReferencia: Number(valorVenda ?? 0) }`.
- Novas funções: `listarPlanos(busca)`, `consultarPreco({ estoqueId, plano, tabela, pagamento })`, `precoVigente()`, `importarTabelaPreco(arquivo)`.
- `consultarPreco` deve devolver `{ semPreco: true, mensagem }` quando o backend responder 422, em vez de lançar erro.

## 2. Tela Lançar venda (`src/pages/Venda.jsx`), aba Produto Vivo
- Remover a constante `TABELAS_PRECO` (`Mais Vivo`, `Pré-Pago`, `Varejo / Balcão`, `Fidelizado`) e o combo "Tabela de Preço".
- No lugar, mostrar só leitura: **Tabela** (Regular/Renova) e **Grupo do plano** que vierem de `consultarPreco`.
- Tabela: `RENOVA` quando o serviço for "Troca de Aparelho" de cliente que já tem linha; `REGULAR` nos demais casos. Mesma regra do backend — se o backend já decide sozinho, não mande o parâmetro.
- Combo "Plano Ativo / Linha" e combo "Plano Antigo" (aba de serviço): trocar `LISTA_PLANOS_DEMO` por `listarPlanos`, com busca digitável (lista grande, ~400 planos). Mostrar `nomePlano` e, em cinza, o `grupoPlano`. Opção "Sem plano / Pré-pago".
- Ao ter aparelho selecionado **e** plano escolhido (e quando qualquer um mudar), chamar `consultarPreco` com debounce de 300 ms e preencher a área Valores:
  - **Valor (cartão até 12x, débito, dinheiro):** `preco`
  - **Valor no PIX / Vivo Pay:** `precoPix`
  - Parcelas 13x–21x num detalhe recolhível, a partir de `parcelas`.
  - Linha pequena: "Tabela vigente desde dd/mm/aaaa".
- Sem preço (422): mostrar em laranja "Item sem preço na tabela vigente (nome comercial)" e desabilitar "Salvar".
- O campo Valor não é mais editável. Desconto, acréscimo e valor adicional continuam como hoje.
- Em `handleSalvarProdutoVivo`: continuar mandando `plano`, `tipoServico` e o restante; `valorUnitario` pode continuar indo (o backend ignora), mas a tela deve exibir o valor devolvido pelo backend na resposta da venda, não o calculado localmente.
- Acessórios: mesmo fluxo de `consultarPreco` sem plano (grupo `SEM_PLANO`).
- Chip/SimCard: exibir o preço que o backend devolver (preço fixo configurado lá); não fixar R$ 13 no front.

## 3. Upload da tabela de preços
- Na tela de Estoque, card "Tabela de Preços" (`src/pages/Estoque.jsx`): botão "Importar tabela da Telefônica" (aceita `.xlsx`), chamando `importarTabelaPreco`.
- Mostrar o relatório do retorno: vigência, linhas por aba, preços/planos/produtos lidos, unidades do estoque atualizadas, e duas listas: "Modelos do estoque sem preço" (`estoqueSemPreco`) e a quantidade de itens da planilha sem estoque.
- Mostrar no topo a tabela vigente (`precoVigente`): "Vigência dd/mm/aaaa · importada em dd/mm/aaaa hh:mm".
- Avisar antes de enviar: "A nova tabela passa a valer imediatamente para vendas em aberto."

## 4. Regras gerais
- Valores sempre formatados com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`; nunca recalcular total da venda no front — usar o `valorTotal` que o backend devolve.
- Estados de carregando, vazio e erro em cada chamada nova.
- Não mexer em outras telas nem no backend nesta tarefa.

## Forma de trabalhar
1. Mostre o plano (arquivos e funções) e espere minha aprovação.
2. Um commit por parte: serviços → Venda (planos + preço) → acessórios/chip → upload no Estoque.
3. Rode `npm run build` a cada commit.
4. No fim, descreva como testar na tela: um iPhone com plano Controle Alto Valor, o mesmo com Vivo V, e um item sem preço.