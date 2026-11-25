# APIs e contratos

A [referência da API](referencia.md) mostra endpoint, request e response. Ela lê o OpenAPI publicado neste site. A fonte do contrato continua em `contracts/<domínio>/openapi.yaml` no repositório airtestto.

| Domínio | Contrato publicado |
| --- | --- |
| Vendas | [sales.yaml](../openapi/sales.yaml) |
| Financeiro | [financial.yaml](../openapi/financial.yaml) |
| Flipping | [flipping.yaml](../openapi/flipping.yaml) |
| Assistant | [assistant.yaml](../openapi/assistant.yaml) |

O guia do assistente está em [Assistant](assistant.md). Domínio sem arquivo nesta tabela ainda não entra na referência.

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

1. Atualizar o OpenAPI no airtestto.
2. Publicar a cópia em `docs/openapi/` e a linha da tabela acima.
3. Declarar validação de entrada e saída.
4. Incluir exemplo de request e response.
5. Atualizar teste e a página do domínio neste portal.
