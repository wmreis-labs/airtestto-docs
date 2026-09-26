# ADR: Zé Salgados permanece por pacotes

**Status:** aceita em 2026-04-01.

## Contexto

A interface já está organizada em `pages`, `components`, `hooks`, `services`, `schemas`, `types` e `utils`, com módulos grandes em produção. Trocar esse desenho por uma árvore nova de features aumenta o risco operacional sem ganho proporcional agora.

## Decisão

A arquitetura atual por pacotes permanece. A evolução padroniza contrato, validação e responsabilidade dentro dessa estrutura.

## Trade-offs

O risco de regressão e o custo de transição ficam menores, e a adoção pode ser incremental. O isolamento por domínio fica mais fraco do que num desenho feature-first.

## Consequências

1. `src/features` não vira padrão neste momento.
2. Integração HTTP fica em `src/services`.
3. Tipo fica em `src/types` e validação em `src/schemas`.
4. Regra repetida vai para hook ou utilitário.

Adoção: consolidar o padrão na documentação de frontend, aplicar em mudança nova e refatoração incremental, e reavaliar com métrica de manutenção e defeito.
