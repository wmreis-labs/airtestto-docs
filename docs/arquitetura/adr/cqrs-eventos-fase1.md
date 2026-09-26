# Fundação de eventos

**Status:** aceita em 2026-04-05. Esta é a fase 1, em cima da [fase 0](cqrs-athena-orders.md).

## Contexto

A trilha analítica de pedidos, entregas e auditoria precisa do mesmo formato de evento, da mesma regra de versão e do mesmo tratamento de falha. Sem isso, cada domínio inventa um contrato.

## Decisão

Todo evento desses domínios usa o envelope mínimo: `eventId`, `eventType`, `eventVersion`, `tenant`, `occurredAt`, `correlationId` e `payload`. O formato e os exemplos estão em [Contratos de evento](../cqrs-eventos.md).

O envelope não perde campo obrigatório em versão nova. Campo opcional no payload é mudança compatível. Mudança incompatível sobe `eventVersion`. O consumidor convive com as versões da transição.

A idempotência usa `eventId` numa store de deduplicação. Reprocessar o mesmo identificador não altera o estado de novo. O upsert no lado de leitura é determinístico.

Falha transitória recebe retry com backoff. Esgotadas as tentativas, a mensagem vai para a DLQ com o original e o metadado da falha. Replay tem escopo: domínio, período, tenant e tipo.

O padrão é obrigatório para `SalesOrder`, `Delivery` e `AuditEvents`. A implementação em cada domínio vem nas fases seguintes.

## Consequências

O contrato de evento fica único e o acoplamento entre comando e consulta diminui. DLQ e replay passam a ter regra, não improviso. Versão e compatibilidade viram governança.

## Alternativas

Envelope diferente por domínio foi rejeitado. Seguir sem deduplicação por `eventId` foi rejeitado pelo risco de aplicar duas vezes. Replay sem procedimento foi rejeitado pelo risco operacional.

## Aceite desta fase

1. O padrão de evento está publicado e validado.
2. Retry e DLQ estão definidos.
3. O replay foi exercitado em desenvolvimento.
