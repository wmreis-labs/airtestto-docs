# ADR: PDV e Sales não se importam

**Status:** aceita. Fase 0 do contrato `pdv-sales/v1`. O original não traz data.

## Contexto

O PDV local-first sincroniza a venda com Sales sem quebrar o limite dos dois contextos. Nenhum domínio importa serviço ou repositório do outro.

## Decisão

A integração vive no contrato compartilhado `pdv-sales/v1`:

- comando `CreateSalesOrderFromPdvCommand`
- sucesso `SalesOrderCreatedFromPdvEvent`
- conflito ou erro `SalesOrderRejectedFromPdvEvent`

A idempotência tem duas camadas. No PDV, a chave é `tenant`, `deviceId`, `clientOrderId` e `idempotencyKey`. Em Sales, a chave é `integrationId`.

Status de sincronização em v1: `RECEIVED`, `ACCEPTED_FOR_PROCESSING`, `SYNCED`, `CONFLICT`, `REJECTED`, `RESOLVED_RETRY`.

Razões de rejeição ou conflito: `PRICE_CHANGED`, `CATALOG_ITEM_INACTIVE`, `PERSON_INVALID`, `STOCK_DIVERGENCE`, `INVALID_SNAPSHOT`, `INVALID_PAYLOAD`, `UNKNOWN`.

## Consequências

Os contextos evoluem separados e a integração fica no contrato. O custo é um consumidor assíncrono e a observação do processamento.
