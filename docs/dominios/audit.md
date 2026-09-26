# Audit

Trilha de eventos de negócio e consulta filtrada por tipo e data.

## Fluxos

A fila `audit-events` alimenta o consumidor, que grava na tabela `AuditEvents` (`pk`, `sk`, TTL e índice `eventType-createdAt-index`). A consulta HTTP usa o handler de leitura, protegido pelo authorizer quando exposta na API.

O payload sensível do evento não entra em log. Métricas: mensagens consumidas, falha de gravação e profundidade da fila.

A stack também pode ser publicada sozinha por `packages/audit/bin/audit.ts`.
