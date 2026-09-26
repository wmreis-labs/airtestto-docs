# ADR: Person publica pessoas para o PDV

**Status:** aceita. Fase 3A do contrato `person-pdv/v1`. O original não traz data.

## Contexto

O PDV precisa receber alteração de pessoa sem ler a tabela de Person. A integração é um evento versionado em `shared/contracts`.

## Decisão

O contrato `person-pdv/v1` cobre a entidade `PERSON`, com ações `UPSERT` e `DELETE`.

Todo evento traz `eventId`, `tenant`, `entityType`, `action` e `occurredAt`.

## Compatibilidade

Campo opcional novo permanece em `v1`. Campo obrigatório ou mudança de significado cria `v2`. O consumidor ignora campo desconhecido.
