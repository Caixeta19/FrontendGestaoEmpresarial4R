# Tarefa (FRONTEND React): refatorar a aba Pagamento da venda

Rode depois da tarefa do backend (`prompt_pagamento_backend.md`). Confira no backend os nomes finais de rotas e campos e siga o backend se algo diferir.

## Regra (resumo)
- A venda tem uma **condição de pagamento**: `PIX` (PIX ou Vivo Pay, 10% de desconto), `A_VISTA` (crédito até 12x sem juros, débito, dinheiro, boleto) ou `PARCELADO_13` … `PARCELADO_21` (juros da tabela).
- O preço dos aparelhos e acessórios muda com a condição; quem calcula é o backend.
- No parcelado, o cliente pode dar **entrada** (dinheiro, PIX, Vivo Pay, débito, voucher) e o **saldo é financiado** no cartão em N vezes; os juros incidem só sobre o saldo.

## Contrato do backend
- `PATCH /vendas/{id}/condicao-pagamento` `{ condicao }` → venda reprecificada (422 se houver linhas incompatíveis, com a lista).
- `GET /vendas/{id}/simulacao-pagamento` → `[{ condicao, total, parcelas, valorParcela, economiaOuJuros }]`.
- `POST /vendas/{id}/pagamentos` `{ forma, valor, parcelas, codigoVoucher }` → valida contra a condição.
- `POST /vendas/{id}/financiar` → cria/atualiza a linha `FINANCIADO` com o saldo.
- Venda: `condicaoPagamento`, `valorItens`, `ajusteCondicao`, `valorTotal`, `valorParcela`, `saldo`, pagamentos com `tipo` (`PAGAMENTO`, `ENTRADA`, `FINANCIADO`).
- Nova forma `VIVO_PAY`.

## O que fazer
1. **Serviços (`vendasApi.js`):** `alterarCondicao`, `simularPagamento`, `financiarSaldo`; `FORMA_ENUM` com `'Vivo Pay': 'VIVO_PAY'`; `vendaParaTela` lendo os campos novos.
2. **Aba Pagamento — topo: "Como o cliente vai pagar?"**
   - Cartões lado a lado vindos da simulação: **PIX / Vivo Pay** (total e economia), **À vista ou até 12x** (total e parcela em 12x), **Parcelado** com seletor 13x–21x (total, parcela e juros).
   - Ao escolher, chamar `alterarCondicao` e recarregar a venda. Se vier 422, mostrar quais pagamentos remover.
3. **Lançamento das linhas conforme a condição:**
   - PIX: formas PIX, Vivo Pay, Voucher.
   - À vista: crédito (1x–12x), débito, dinheiro, PIX, Vivo Pay, boleto, voucher; campo de parcelas só no crédito, de 1 a 12.
   - Parcelado: seção **Entrada** (dinheiro, PIX, Vivo Pay, débito, voucher) e botão **"Financiar saldo em Nx no cartão"** (`financiarSaldo`). A linha financiada aparece com o valor do backend, sem campo de valor editável.
   - Esconder as formas que não valem para a condição escolhida.
4. **Resumo do pagamento:** Itens (preço cheio) · Desconto PIX ou Juros (`ajusteCondicao`) · Desconto fabricante (Renova, informativo) · **Total** · Pago · **Saldo** · e no parcelado "N × valorParcela".
5. Remover validações locais de saldo/valor que dupliquem o backend; exibir sempre os valores devolvidos.
6. Manter Renova e voucher funcionando como hoje.

## Forma de trabalhar
Mostre o plano e espere aprovação. Commits: serviços → seleção da condição → linhas por condição/financiar → resumo. `npm run build` a cada commit. No fim, descreva o teste: iPhone 17 Pro Max 512GB Controle Alto Valor → PIX R$ 10.079,10 → À vista R$ 11.199,00 → 21x R$ 12.581,12 → entrada de R$ 2.000 em dinheiro + financiar 21x (total R$ 12.334,29, 21 × R$ 492,11).