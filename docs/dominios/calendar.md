# Calendar

Calendários e eventos de vistoria, entrega e reserva, com consulta e consumo assíncrono.

## Fluxos

CRUD pela API. Consulta de eventos futuros e filtro por imóvel ou tenant. O consumidor de calendário publica e consome eventos quando está ligado a Message.

Tabelas de calendário e evento, com índices por imóvel e tenant. Rotas passam pelo authorizer. Detalhe sensível do evento não entra em log.

O deploy isolado usa `packages/calendar/bin/calendar.ts`.
