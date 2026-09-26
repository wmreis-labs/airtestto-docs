# Aceite da fase 5

Registro de 2026-04-12. Os critérios obrigatórios da fase 5 têm teste correspondente no pacote `flipping`.

| Critério | Evidência |
| --- | --- |
| Cálculo à vista preservado, financiado base e imposto zero com lucro menor ou igual a zero | `feasibility-calculator.spec.ts` |
| Criar, obter e atualizar à vista e financiado | `flipping-handlers.spec.ts` |
| Payload antigo sem modalidade de compra | `flipping-handlers.spec.ts` e `flip-project-service.spec.ts` |
| `results` do request ignorado; a resposta reflete o cálculo do backend | `flip-project-service.spec.ts` e `flipping-handlers.spec.ts` |
| Financiado com campo ausente ou inválido | `flipping-feasibility-schema.spec.ts` |

O changelog da entrega está em [Changelog](changelog.md).
