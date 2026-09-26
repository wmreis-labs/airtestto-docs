# Contrato de flipping

Congelado em 2026-04-10 para a implementação em fases. Quebra controlada de payload antigo é permitida. Registro já gravado continua legível. A leitura do formato anterior está em [Migração de legado](migracao-legado.md).

## Rotas

- `GET /flipping/flipping-project`
- `GET /flipping/flipping-project/{id}`
- `POST /flipping/flipping-project`
- `PUT /flipping/flipping-project/{id}`
- `DELETE /flipping/flipping-project/{id}`
- `POST /flipping/opportunities/parse`

Variação fora de `flipping-project` não é contrato principal. Deal não viaja mais dentro do projeto: a API é `/flipping/deals/*`.

## Feasibility

Cada oportunidade carrega `opportunity.feasibility.inputs` e `opportunity.feasibility.results`.

Entradas: `advertisedPrice`, `usableArea`, `referencePricePerM2`, `purchasePrice`, `itbiRate`, `deedAndRegistryRate`, `renovationRate`, `renovationCost`, `condoMonthly`, `iptuMonthly`, `utilitiesMonthly`, `holdingMonths`, `reserveFundRate`, `brokerFeeRate`, `incomeTaxRate`.

Resultados: `announcedPricePerM2`, `salePrice`, `discountVsReference`, `itbiValue`, `deedAndRegistryValue`, `renovationCost`, `monthlyExpenses`, `reserveFundValue`, `investmentTotal`, `brokerFeeValue`, `grossProfit`, `incomeTaxValue`, `netProfit`, `roi`.

`POST` e `PUT` recalculam os resultados. O cliente pode enviar `results`; o valor persistido é o do servidor. `GET` devolve entradas normalizadas e resultados coerentes com este modelo.

## Cálculo

```text
announcedPricePerM2 = advertisedPrice / usableArea
salePrice = referencePricePerM2 * usableArea
discountVsReference = 1 - (purchasePrice / salePrice)
itbiValue = purchasePrice * itbiRate
deedAndRegistryValue = purchasePrice * deedAndRegistryRate
monthlyExpenses = (condoMonthly + iptuMonthly + utilitiesMonthly) * holdingMonths
reserveFundValue = purchasePrice * reserveFundRate
investmentTotal = purchasePrice + itbiValue + deedAndRegistryValue + renovationCost + monthlyExpenses + reserveFundValue
brokerFeeValue = salePrice * brokerFeeRate
grossProfit = salePrice - investmentTotal - brokerFeeValue
incomeTaxValue = max(grossProfit, 0) * incomeTaxRate
netProfit = grossProfit - incomeTaxValue
roi = netProfit / investmentTotal
```

`renovationCost` explícito prevalece. Sem ele, o custo é `purchasePrice * renovationRate`.

## Validação

`usableArea` e `purchasePrice` são maiores que zero. `holdingMonths` é pelo menos 1. Taxa fica entre 0 e 1. Lucro bruto menor ou igual a zero zera o imposto.

```json
{
  "code": "validation_error",
  "message": "Invalid feasibility inputs",
  "details": {
    "field": "reason"
  }
}
```

## Status e categoria

O tráfego usa a chave do enum, não o rótulo.

Status: `CAPTURED`, `SCHEDULED_VIEW`, `VISITED`, `ANALYZED`, `PROPOSAL_SENT`, `IN_NEGOTIATION`, `NEGOTIATED`, `DISCARDED`.

Categoria: `OPPORTUNITY` e `DEAL`.

Dinheiro com duas casas. Taxa interna com quatro. `roi` guarda a precisão no backend e a interface formata. A mesma entrada produz a mesma saída.
