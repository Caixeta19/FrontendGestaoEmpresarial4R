# Frontend: Renova pelo número do voucher + ajustes do pagamento

Leia o CLAUDE.md. O backend está na branch `feature/renova-numero-voucher` do GestaoEmpresarial4R (V28). Rode o backend nessa branch para testar. Mostre o plano e espere minha aprovação. Crie a branch `feature/renova-numero-voucher` no front.

## O que mudou no backend (contrato)
- **Voucher deixa de ser forma de pagamento:**
  - `POST /vendas/{id}/pagamentos` com `forma = VOUCHER` → 422.
  - Nenhuma condição aceita mais `VOUCHER`. A forma só aparece no histórico de vendas antigas.
- **Renova passa pelo número do voucher:**
  - `PATCH /vendas/{id}/renova` com `{ "ativo": true, "codigoVoucher": "ABC123" }` liga o Renova. O número tem até 60 caracteres, sem espaços nas pontas.
  - Ligar sem número ou sem aparelho elegível → 422. Plano pré-pago → 422.
  - Número já usado em outra venda não cancelada → **409** "Voucher já usado na venda #id".
  - `{ "ativo": false }` limpa o número e volta os aparelhos para a Regular.
- **Resposta da venda:** passa a trazer `codigoVoucher` no nível da venda (null com o Renova desligado).
- **Finalizar:**
  - O backend reprecifica pela tabela vigente. Se o total mudou, grava o total novo e devolve **422** "O preço da venda mudou: o total passou de X para Y. Confira os pagamentos e finalize de novo."
  - Venda com Renova sem número → 422.
- **Serviço Vivo:** fica sempre com valor 0, e o `valorUnitario` enviado é ignorado.

## Tarefas

### 1. `src/services/vendasApi.js`
- `aplicarRenova(id, ativo, codigoVoucher)` envia `{ ativo, codigoVoucher }`. Com `ativo = false`, envia só `{ ativo: false }`.
- `vendaParaTela` passa a mapear `codigoVoucher` da venda.
- Retirar `Voucher` do `FORMA_ENUM` usado nos formulários. O rótulo `FORMA_ROTULO.VOUCHER = 'Voucher'` continua, para exibir vendas antigas.

### 2. `src/pages/Venda.jsx`: formas de pagamento
- Tirar `'Voucher'` de `FORMAS_PIX`, `FORMAS_A_VISTA` e `FORMAS_ENTRADA`.
- Tirar o campo "Código do voucher" do formulário de pagamento, o `codigoVoucher` do `pgtoForm` e a validação de voucher em `handleAdicionarPagamento`.

### 3. Bloco Renova (aba Pagamento)
- **Com o Renova desligado:**
  - campo **Número do voucher** (texto, `maxLength` 60, sem espaços nas pontas);
  - botão **Aplicar Renova**, habilitado só com número preenchido, venda aberta e aparelho elegível (`grupoPlano` diferente de vazio e de `SEM_PLANO`). Ele chama `aplicarRenova(vendaId, true, numero)`.
- **Com o Renova ligado:**
  - mostrar o número do voucher (somente leitura);
  - mostrar o desconto fabricante (informativo, "já embutido no preço Renova");
  - mostrar a lista de aparelhos com o selo Renova/Regular, como já é hoje;
  - botão **Remover Renova**, que chama `aplicarRenova(vendaId, false)`.
- Erros 409 e 422 aparecem embaixo do campo, em vermelho, sem `alert`. Limpar o erro quando o número mudar.
- `temVoucher` passa a ser `Boolean(codigoVoucher da venda)`, e não mais a busca em `pagamentos`. Trocar o checkbox atual pelos botões.
- Ao carregar uma venda (`carregarVendaExistente`), preencher o campo com o `codigoVoucher` da venda. Ao limpar a venda, zerar o campo.

### 4. Pagamento
- **Validar o valor antes de enviar.** Vazio, `NaN` ou ≤ 0 → mensagem "Informe um valor maior que zero." Aceitar vírgula (ex.: `1.199,50`).
- **Botão "Usar saldo"** ao lado do valor: preenche com o saldo restante devolvido pelo backend. No parcelado, a entrada não tem saldo fixo, então ocultar o botão.
- **Saldo negativo:** hoje `Math.max(0, saldo)` esconde quando os pagamentos passam do total. Mostrar no resumo, em vermelho: "Pagamentos acima do total em R$ X: remova ou ajuste um pagamento."
- **Aviso do backend:** exibir `avisoVenda` logo acima do resumo do pagamento.
- **Financiar saldo:** hoje fica desabilitado com `saldoRestante <= 0`; usar o `saldo` real. Habilitar quando houver saldo > 0. Se já existir a linha FINANCIADO e o saldo for 0, mostrar "Saldo financiado em Nx de R$ Y" no lugar do botão.
- **Finalizar com 422 de total alterado:**
  - recarregar a venda (`buscarVenda`) para mostrar o total novo;
  - mostrar a mensagem do backend;
  - levar o vendedor para a aba Pagamento.
- Trocar os `alert()` da aba Pagamento e do Renova por mensagens na tela (`ToastContext` já existe).
- A simulação (`simularPagamento`) também recarrega quando mudar `codigoVoucher`.

### 5. Serviço Vivo
- Na aba de serviços, não enviar nem exibir campo de valor: mostrar "R$ 0,00".

## Teste manual
Use o produto de teste com os preços do iPhone 17 Pro Max 512GB no Controle Alto Valor:
- Regular 11.199,00; PIX 10.079,10; 21x 12.581,12.
- Renova 10.699,00; desconto 500.

| # | Cenário | Esperado na tela |
|---|---|---|
| 1 | PIX, pagamento PIX 10.079,10 | saldo 0; finaliza |
| 2 | À vista, PIX 1.199 + crédito 10x 10.000 | saldo 0; finaliza |
| 3 | 21x, entrada dinheiro 2.000 → Financiar | total 12.334,29; 21 × 492,11 |
| 4 | Número "V1" → Aplicar Renova, à vista | aparelho 10.699,00 com selo Renova; desconto 500 informativo |
| 5 | Renova, 21x, entrada 2.000 → Financiar | total 11.834,29; 21 × 468,30 |
| 6 | Pagar 11.199 à vista e depois aplicar o Renova | saldo −500 em vermelho; finalizar recusado |
| 7 | Mesmo número "V1" em outra venda | mensagem 409 embaixo do campo |
| 8 | Remover Renova | volta para 11.199,00 com selo Regular; campo vazio |
| 9 | Forma "Voucher" | não aparece em nenhuma condição |
| 10 | Valor vazio + Inserir | mensagem na tela, sem chamada à API |

## Entrega
`npm run build` sem erro, um commit por etapa e PR para a main depois do merge do backend.