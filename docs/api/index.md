# APIs e contratos

O contrato de cada domínio fica em `contracts/<domínio>/openapi.yaml`. Ao criar um arquivo novo, inclua a linha nesta tabela.

| Domínio | Caminho |
| --- | --- |
| Auth | `contracts/auth/openapi.yaml` |
| API gateway | `contracts/api/openapi.yaml` |
| Property | `contracts/property/openapi.yaml` |
| Person | `contracts/person/openapi.yaml` |
| Product | `contracts/product/openapi.yaml` |
| Sales | `contracts/sales/openapi.yaml` |
| Delivery | `contracts/delivery/openapi.yaml` |
| Contract | `contracts/contract/openapi.yaml` |
| Calendar | `contracts/calendar/openapi.yaml` |
| Orchestrator | `contracts/orchestrator/openapi.yaml` |
| Assistant | `contracts/assistant/openapi.yaml` |
| Message | `contracts/message/openapi.yaml` |
| Flipping | `contracts/flipping/openapi.yaml` |

Contrato que ainda não existe começa com a versão inicial e exemplos mínimos. O guia já escrito do assistente está em [Assistant](assistant.md).

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

1. Atualizar o OpenAPI.
2. Declarar validação de entrada e saída.
3. Incluir exemplo de request e response.
4. Atualizar teste e a página do domínio neste portal.
