# ADR: Product publica catálogo para o PDV

**Status:** aceita. Fase 3A do contrato `product-pdv/v1`. O original não traz data.

## Contexto

O PDV precisa receber alteração de catálogo sem ler a tabela de Product. O limite entre os contextos se mantém com evento versionado em `shared/contracts`.

## Decisão

O contrato `product-pdv/v1` cobre categoria (`CATEGORY`), produto (`PRODUCT`) e variante (`VARIANT`). As ações são `UPSERT` e `DELETE`.

Todo evento traz `eventId`, `tenant`, `entityType`, `action` e `occurredAt`. Esses campos roteiam e garantem idempotência.

## Compatibilidade

Campo opcional novo permanece em `v1`. Campo obrigatório ou mudança de significado cria `v2`. O consumidor ignora campo desconhecido.
