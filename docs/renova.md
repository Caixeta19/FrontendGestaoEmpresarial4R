# Tarefa (FRONTEND React): preço Renova quando houver Desconto fabricante + Voucher no pagamento

## Regra de negócio (decisão de 04/11/2026)
- Todo aparelho entra na venda pela **TABELA REGULAR** (já implementado).
- O aparelho passa para a **TABELA RENOVA** quando, na aba **Pagamento**, o vendedor preenche **os dois**: **Desconto fabricante** e **Voucher**.
- Se um dos dois for removido, os aparelhos voltam para a Regular.
- Só vale para aparelhos (categoria PRODUTO_VIVO com preço por plano). Acessórios, chip, serviços e itens de abas sem plano (`SEM_PLANO`) não mudam.
- O bloco Renova da planilha **não tem grupo PRÉ**: plano pré-pago ou sem plano não pode usar Renova → 422 "Renova não disponível para plano pré-pago".

## Como a planilha representa o Renova
No bloco `TABELA RENOVA` (abas SMARTPHONES e ELETRÔNICOS_LP_Conectados) a primeira coluna é `DESCONTO` (um único valor por produto, **sem** colunas PIX/parcelas depois dela). Os preços Renova já vêm com esse desconto aplicado:

| iPhone 17 Pro Max 512GB | Regular | Renova | DESCONTO |
|---|---|---|---|
| Controle Alto Valor | R$ 11.199,00 | R$ 10.699,00 | R$ 500,00 |
| Vivo V | R$ 10.149,00 | R$ 9.649,00 | R$ 500,00 |

Confira no parser:
- `DESCONTO` é lido como coluna única e gravado em `tb_preco_item` (nova coluna `desconto_fabricante NUMERIC(12,2)`, preenchida só nas linhas `RENOVA`), sem deslocar a leitura dos grupos seguintes.
- Produto com `DESCONTO` = 0 tem preço Renova igual ao Regular (ex.: iPhone 13 128GB).

## Para não descontar duas vezes
O preço Renova **já inclui** o desconto do fabricante. Portanto:
- O campo **Desconto fabricante** não é uma forma de pagamento e não abate o total de novo. Ele é gravado na venda para controle/conciliação com o fabricante e é **preenchido automaticamente** com a soma do `DESCONTO` da tabela Renova dos aparelhos da venda (somente leitura na tela; o backend valida que bate com a tabela).
- O **Voucher** é uma **forma de pagamento** (valor + código do voucher) e entra na soma dos pagamentos normalmente.
- O total da venda = soma dos itens já com preço Renova; pagamentos (incluindo o voucher) têm que fechar esse total para finalizar.

> Se a operação considerar que o Desconto fabricante é uma forma de pagamento (cliente paga Regular − desconto − voucher), troque esta seção: o item fica na Regular e o desconto vira uma linha de pagamento automática. Pergunte antes de implementar se houver dúvida.

## Contrato do backend (já implementado — confira nos controllers/README e siga o backend se algo diferir)
- `PATCH /vendas/{id}/renova` com `{ ativo: true|false }` → devolve a venda reprecificada.
- `POST /vendas/{id}/pagamentos` aceita `forma: "VOUCHER"` com `codigoVoucher` e `valor` > 0.
- `VendaResponseDTO` traz `renova`, `descontoFabricante`, `saldo` e, em cada item, `tabelaPrecoAplicada` (`REGULAR`/`RENOVA`) e `grupoPlano`.
- `GET /produtos/precos/item?...&tabela=RENOVA` devolve também `descontoFabricante`.
- Erros 422: "Renova não disponível para plano pré-pago", voucher sem código.

## O que fazer no frontend
1. Aba **Pagamento**: seção "Renova" com:
   - **Desconto fabricante**: somente leitura, preenchido com o valor devolvido pelo backend;
   - **Voucher**: valor + código, lançado como pagamento `VOUCHER`;
   - botão/checkbox "Aplicar Renova" que chama `PATCH /vendas/{id}/renova`.
2. Ao ligar/desligar o Renova ou lançar/remover o voucher, recarregar a venda e mostrar os aparelhos com o novo preço e um selo **Renova** (ou **Regular**) por item.
3. Mostrar o aviso do backend quando os pagamentos passarem do total após a reprecificação.
4. Na aba Produto Vivo, a área de valores mostra a tabela aplicada vinda do item da venda (não calcular no front).
5. Plano pré-pago: desabilitar "Aplicar Renova" com a mensagem do backend.
6. Nunca recalcular preço ou total no front: sempre exibir o que a venda devolvida pelo backend traz.

## Forma de trabalhar
1. Leia o CLAUDE.md (se houver). Mostre o plano e espere aprovação.
2. Um commit por parte: serviços (`vendasApi.js`: `aplicarRenova`, pagamento VOUCHER) → aba Pagamento → selos Regular/Renova nos itens → avisos.
3. Não mexa no backend.
4. Rode `npm run build` a cada commit e, no fim, descreva como testar: iPhone com Controle Alto Valor (Regular R$ 11.199) → aplicar Renova com voucher (R$ 10.699) → remover o voucher (volta R$ 11.199); e plano pré-pago bloqueando o Renova.