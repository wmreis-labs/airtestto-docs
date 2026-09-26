# AI

Biblioteca de prompt, cliente de modelo e parser. Não tem stack CDK nem API própria. Outros domínios importam o código de `client`, `flows`, `bedrock`, `promptBuilder` e `parseOpportunity`.

O consumidor chama o modelo com a role do próprio serviço. PII não entra em prompt nem em log. Quem usa a biblioteca registra `traceId` e `tenantId` e omite o conteúdo sensível da resposta.

O build da raiz compila o pacote. Os testes são Jest, em `packages/ai`.
