# Decisões de arquitetura

Decisões aceitas. O contexto de cada uma permanece estável; o status não é rascunho.

| Data | Decisão | Status |
| --- | --- | --- |
| 2026-03-25 | [Um stack CDK por domínio](stack-por-dominio.md) | Aceita |
| 2026-03-25 | [Versionamento da API por path](versionamento-api.md) | Aceita |
| 2026-03-25 | [Logs estruturados sem PII](logs-e-pii.md) | Aceita |
| 2026-04-05 | [CQRS incremental com Athena em pedidos](cqrs-athena-orders.md) | Aceita |
| 2026-04-05 | [Envelope único de evento](cqrs-eventos-fase1.md) | Aceita |

Contratos entre Product, Person, PDV e Sales também existem como ADR dentro dos pacotes compartilhados. Eles fixam a forma da integração entre esses domínios e convivem com as decisões desta seção.
