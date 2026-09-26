# Requisitos não funcionais

## Desempenho

Latência alvo no p95:

| Tipo de rota | Alvo |
| --- | --- |
| Leitura simples | até 300 ms |
| Escrita ou processo simples | até 500 ms |
| Trabalho pesado, como PDF ou agregação | até 1500 ms |

APIs críticas de autenticação e leitura de imóveis são planejadas para até 50 requisições por segundo em dev e stage, e 200 em produção. Operação que estoura o orçamento de latência sai do caminho síncrono.

## Confiabilidade

- Disponibilidade mensal de 99,5% para auth, leitura de property e checkout de sales.
- Disponibilidade mensal de 99,0% para as demais rotas.
- Cliente: retry exponencial com jitter em 5xx e 429. Sem retry em 4xx.
- Lambda assíncrona: duas tentativas e DLQ na fila. SNS para falha crítica quando couber.
- EventBridge: retries da própria regra, com DLQ por regra.

## Observabilidade

Log JSON com `traceId`, `tenantId`, `userId`, `domain`, `operation`, `status` e `latencyMs`. Métricas cobrem latência e erro por rota, sucesso de fila, volume de negócio e profundidade de DLQ. X-Ray fica nas rotas críticas e nas Lambdas de orquestração. O `traceId` propaga por cabeçalho.

## Escalabilidade

A chave do DynamoDB precisa de cardinalidade alta, no padrão `tenant#id` ou `entity#id`. GSI existe para uma consulta real, não como índice genérico. Monitore `ConsumedCapacity` e `ThrottledRequests`.

Funções quentes, como auth e leitura de property, podem ter concorrência reservada para não esgotar o downstream. Função pesada limita a concorrência e usa fila.

## Manutenção de contrato

- Breaking change de API sobe de path: `/v1`, `/v2`. Ver [versionamento](../mudancas/adr/versionamento-api.md).
- Contrato quebra junto com a rota nova e com nota de release.
- Stack leva tag `schemaVersion`. Mudança destrutiva precisa de plano e de caminho de volta.
- Rota obsoleta anuncia `Deprecation` e `Sunset`. Durante a transição, leitura e escrita convivem. O formato antigo sai na data combinada.

## Consulta analítica

O recorte aprovado começa em `SalesOrder`, segue para `Delivery` e depois para `AuditEvents`. Escrita e fluxo operacional permanecem no DynamoDB. Athena atende só agregação e relatório.

Toda consulta analítica exige `tenant`, `startDate` e `endDate`. A janela máxima é 31 dias em `/orders/summary` e 7 dias em `/orders/aggregate`. Consulta sem esses filtros retorna erro de validação.

| Situação | Alvo |
| --- | --- |
| p95 com cache | até 800 ms |
| p95 sem cache | até 3000 ms |
| Disponibilidade mensal | 99,5% |

Teto inicial do Athena: até 3 USD por mês em dev e até 15 USD por mês no início de produção. Alarmes em 50%, 80% e 100% do orçamento. O workgroup limita bytes por query. A decisão completa está em [CQRS e Athena](../mudancas/adr/cqrs-athena-orders.md).
