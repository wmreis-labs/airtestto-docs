# Design docs

Desenho de uma solução já decidida ou em revisão. O design doc explica fluxo, contrato, dado e sequência. A escolha de caminho fica no [ADR](../adr/index.md). O problema de produto fica no [PRD](../prd/index.md).

## Status

`rascunho`, `em revisão`, `vigente`, `substituído`.

## Nome do arquivo

`docs/mudancas/design/AAAA-MM-DD-assunto.md`

## Modelo

```md
# Design: título

**Status:** rascunho
**Data:** AAAA-MM-DD
**ADR:** link da decisão que este desenho detalha
**PRD:** link, quando a origem for de produto

## Objetivo

## Fora deste desenho

## Fluxo

## Contrato

## Dados

## Riscos
```

## Já publicados

Estes textos nasceram como desenho de contrato, antes desta prateleira existir. O conteúdo continua na página original. Esta tabela é o índice.

| Desenho | Status | Página |
| --- | --- | --- |
| Envelope e tipos de evento CQRS | Vigente | [Contratos de evento](../../arquitetura/cqrs-eventos.md) |
| Contrato de viabilidade do flipping | Vigente | [Contrato](../../flipping/contrato.md) |
| Leitura do feasibility legado | Vigente | [Migração](../../flipping/migracao-legado.md) |
| Caixa no domínio cashbook | Vigente | [Cashbook](2026-09-27-caixa-cashbook.md) |
| Módulo de caixa no admin | Vigente | [Admin](2026-09-27-caixa-admin.md) |

O [changelog](../../flipping/changelog.md) e o [aceite](../../flipping/aceite.md) do flipping registram a entrega desse desenho, não uma decisão nova.
