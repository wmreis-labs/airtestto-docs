# ADRs

Registro da decisão vigente. O contexto explica o problema. A decisão é a escolha. As consequências dizem o que passa a ser obrigatório. Uma decisão substituída não é apagada: o status muda para `substituída` e o texto aponta para o ADR novo.

## Status

`proposta`, `aceita`, `substituída`.

## Nome do arquivo

Decisão de plataforma: `docs/mudancas/adr/AAAA-MM-DD-assunto.md`.

Decisão de um produto ou contrato: prefixo do contexto, como `zesalgados-` ou `pdv-sales-`.

## Modelo

```md
# ADR: título

**Status:** proposta
**Data:** AAAA-MM-DD

## Contexto

## Decisão

## Consequências

## Alternativas
```

## Registro

| Data | Decisão | Contexto | Status |
| --- | --- | --- | --- |
| 2026-03-25 | [Stack CDK por domínio](stack-por-dominio.md) | Plataforma | Aceita |
| 2026-03-25 | [Versionamento da API por path](versionamento-api.md) | Plataforma | Aceita |
| 2026-03-25 | [Logs estruturados sem PII](logs-e-pii.md) | Plataforma | Aceita |
| 2026-04-01 | [Zé Salgados permanece por pacotes](zesalgados-arquitetura-por-pacotes.md) | Zé Salgados | Aceita |
| 2026-04-05 | [CQRS incremental com Athena em pedidos](cqrs-athena-orders.md) | Sales | Aceita |
| 2026-04-05 | [Envelope único de evento](cqrs-eventos-fase1.md) | Sales, Delivery, Audit | Aceita |
| — | [PDV e Sales não se importam](pdv-sales-v1.md) | PDV, Sales | Aceita |
| — | [Product publica catálogo para o PDV](product-pdv-v1.md) | Product, PDV | Aceita |
| — | [Person publica pessoas para o PDV](person-pdv-v1.md) | Person, PDV | Aceita |

Os três contratos de PDV estavam nos pacotes compartilhados, sem data no original.
