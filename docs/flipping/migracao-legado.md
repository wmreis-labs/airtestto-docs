# Migração de feasibility legado

Objetivo: ler e atualizar oportunidade antiga sem quebrar o cliente que já espera o [contrato canônico](contrato.md).

## Leitura

`GET` e listagem normalizam o registro em memória. Campos antigos da oportunidade mapeiam assim:

| Legado | Canônico |
| --- | --- |
| `numero` | `listingNumber` |
| `link` | `url` |
| `areaUtil` | `usableArea` |
| `valor` | `price` |
| `precoPorM2` | `pricePerM2` |

`feasibility.inputs` antigo vira entrada canônica antes do recálculo.

## Atualização

No primeiro `PUT`, a oportunidade existente é normalizada e persistida. Se o payload não trouxer `opportunities`, o backend ainda grava as oportunidades já migradas.

## Fallback de custos

| Legado | Canônico |
| --- | --- |
| `monthlyCosts` | `condoMonthly` |
| `brokerFeePercent` | `brokerFeeRate` |
| `taxPercent` | `incomeTaxRate` |
| `expectedSalePrice / usableArea` | `referencePricePerM2` |

`renovationCost` antigo permanece como custo explícito. `advertisedPrice` e `purchasePrice` caem para `opportunity.price` quando faltam. `usableArea` cai para `opportunity.usableArea`.

Registro antigo continua legível. A primeira gravação persiste o formato novo. Esta etapa não exige job de backfill em lote.
