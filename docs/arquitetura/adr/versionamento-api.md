# Versionamento da API

**Status:** aceita em 2026-03-25.

## Contexto

O API Gateway central publica rotas de vários domínios. Uma mudança de contrato pode quebrar cliente externo.

## Decisão

Breaking change usa path semântico: `/v1`, `/v2`. Mudança compatível permanece na mesma versão e preserva compatibilidade. O contrato OpenAPI fica em `contracts/<domínio>/openapi.yaml` e entra no [índice de APIs](../../api/index.md).

No review de uma quebra: medir o impacto, atualizar a nota de release e anunciar a depreciação.

## Consequências

Uma quebra exige rota nova e convivência entre versões. A manutenção cresce e o consumidor ganha previsibilidade.

## Alternativas

Versionar só por header foi rejeitado pela complexidade no cliente. Seguir sem versionamento formal foi rejeitado pelo risco de quebra.
