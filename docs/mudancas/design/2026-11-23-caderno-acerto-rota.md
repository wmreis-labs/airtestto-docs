# Design: acerto da parada e fechamento da rota

**Status:** aceita
**Data:** 2026-11-23
**História:** [Acerto do que o motorista recebeu na parada](https://github.com/wmreis-labs/zesalgados/issues/148)

## Objetivo

Gravar, na rota e no pedido, o que o motorista recebeu em cada parada e os gastos da rota. O total do pedido não muda.

## Contrato

`POST /delivery/settlement/{id}`

| Campo | Uso |
| --- | --- |
| sequence | Ordem da parada |
| method | `UNPAID`, `PIX`, `CREDIT` ou `CASH` |
| amount | Valor recebido. Não pago grava zero |
| reason | Obrigatório quando o valor é menor que o que ainda está em aberto |
| confirm | Só a cozinha. Trava a marca |

`PATCH /delivery/closing/{id}`

| Campo | Uso |
| --- | --- |
| commission, meal, fuel, other | Gastos digitados. Saem do dinheiro |
| confirm | Só a cozinha. Trava os gastos |

A resposta das duas rotas é a rota, com `metadata.settlements`, `metadata.closing` e `metadata.caderno`. O resumo traz `cashCollected`, `cardTotal` e `cashLeft`. PIX não entra no dinheiro nem no cartão. Cartão fica à parte e não é subtraído.

## Regras

- Uma parada tem um pedido. Mais de um pedido responde 422.
- Não pago não grava pagamento e deixa o pedido em aberto.
- PIX, crédito e dinheiro gravam um pagamento de id estável `pay_caderno_{rota}_{ordem}`. Pagamento que o PDV já gravou permanece.
- Valor acima do total do pedido, ou acima do que ainda está em aberto, responde 422.
- Valor menor deixa o resto em aberto e exige motivo.
- Pedido concluído ou cancelado não aceita mais pagamento.
- Parada confirmada não muda. Rota conferida não muda marca nem gasto.
- O entregador grava. Só `GestorCozinha` confirma e confere.
- As rotas ficam em `/settlement` e `/closing`, fora da área de planejamento, para o entregador poder gravar sem planejar a rota.

## Dados

A marca e o fechamento ficam em `metadata` da rota, porque a leitura da rota já devolve esse campo. O pagamento fica na lista de pagamentos do pedido. O status financeiro do pedido acompanha a soma: em aberto, parcial ou pago.
