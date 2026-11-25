# APIs e contratos

A [referência da API](referencia.md) lista cada API e cada rota declarada nas stacks. O OpenAPI é gerado do `addMethod` em `packages/api/cdk`. Uma rota nova entra no contrato quando o código muda e o gerador roda de novo. O teste do pacote `api` falha se o arquivo gerado ficar para trás.

O gerador grava caminho, método, parâmetro de path e se a rota exige sessão. O JSON do corpo não sai da stack, porque a stack não declara esse contrato. A contagem de rotas está em [index.json](../openapi/index.json).

| API | Contrato |
| --- | --- |
| API principal | [api.yaml](../openapi/api.yaml) |
| Assistant | [assistant.yaml](../openapi/assistant.yaml) |
| Console do ATO | [ato-console.yaml](../openapi/ato-console.yaml) |
| Bank | [bank.yaml](../openapi/bank.yaml) |
| Budget | [budget.yaml](../openapi/budget.yaml) |
| Caixa | [cashbook.yaml](../openapi/cashbook.yaml) |
| Entregas | [delivery.yaml](../openapi/delivery.yaml) |
| Financeiro | [financial.yaml](../openapi/financial.yaml) |
| Flipping | [flipping.yaml](../openapi/flipping.yaml) |
| Pagamentos | [payments.yaml](../openapi/payments.yaml) |
| PDV | [pdv.yaml](../openapi/pdv.yaml) |
| Pessoas | [person.yaml](../openapi/person.yaml) |
| Admin da plataforma | [platform-admin.yaml](../openapi/platform-admin.yaml) |
| Produtos | [product.yaml](../openapi/product.yaml) |
| Vendas | [sales.yaml](../openapi/sales.yaml) |
| Impostos | [tax.yaml](../openapi/tax.yaml) |

O guia do assistente está em [Assistant](assistant.md).

## Convenções

Breaking change sobe o path (`/v1`, `/v2`). Mudança compatível permanece na versão atual. Autenticação padrão é JWT do Cognito.

Erro em JSON:

```json
{
  "code": "validation_error",
  "message": "texto estável para o cliente",
  "details": {},
  "requestId": "opcional"
}
```

`code` é curto e estável, por exemplo `validation_error`, `unauthorized` ou `not_found`. `details` descreve campo inválido e não traz PII.

Códigos HTTP usados: 400, 401, 403, 404, 409, 422, 429, 500 e 503.

## Rota nova

1. Declarar a rota com `addMethod` na stack em `packages/api/cdk`.
2. Rodar `npm run openapi -w api`. O teste falha se esse passo ficar de fora.
3. Publicar a pasta `contracts/generated` em `docs/openapi/` deste site.
