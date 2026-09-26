# Message

Mensageria dos outros domínios: tópico SNS, filas SQS e os handlers de publicar e processar.

Não há API HTTP própria. O contrato é o esquema do evento. Sales, Delivery, Orchestrator e os demais publicam e consomem com permissão concedida pelo aplicativo da API. A fila de delivery tem DLQ.

Payload de evento não carrega PII. Métricas: publicadas, consumidas, erro, retry e profundidade da DLQ. O log do processamento leva `traceId` e `tenantId`.

A stack nasce dentro de `packages/api/bin/api.ts`. Não há bin isolado hoje.
