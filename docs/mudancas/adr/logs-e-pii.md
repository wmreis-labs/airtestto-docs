# Logs, PII e observabilidade

**Status:** aceita em 2026-03-25.

## Contexto

As Lambdas tratam dados de pessoas e de contratos. A trilha precisa existir sem colocar PII em log ou métrica.

## Decisão

O log é JSON com `traceId`, `tenantId`, `userId` quando existir, `domain`, `operation` e `status`. PII não entra no log. Identificador sensível é mascarado antes de registrar.

Métricas técnicas (latência e erro) e de negócio (eventos-chave) vão para o CloudWatch, com alarme. X-Ray cobre rotas críticas e propaga `traceId`.

## Consequências

A correlação por `traceId` e `tenantId` encurta o diagnóstico. O custo extra é o de armazenar log e métrica.

## Alternativas

Log livre foi rejeitado porque dificulta a investigação e vaza PII. Log só em erro foi rejeitado pela falta de visibilidade.
