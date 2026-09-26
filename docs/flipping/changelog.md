# Changelog da viabilidade

Entrega consolidada em 2026-04-11. O contrato de campos está em [Contrato](contrato.md).

## Fase 5

Testes de pagamento à vista, financiado e legado. Contrato de criar, obter, atualizar e listar, com `results.financing` quando a compra é financiada. Validação de financiamento ausente, parcelas insuficientes para o mês de saída, modalidade inválida e juros opcional negativo. Regressão de registro antigo, de `results` ignorado no request e de score diferente por modalidade.

## Fase 4

`POST` e `PUT` recalculam `feasibility.results`. `GET` e listagem devolvem entradas e resultados. Compra financiada inclui `results.financing`. Registro sem modalidade é tratado como à vista e, ao ser atualizado, passa a ser gravado no formato canônico.

## Fase 3

O score distingue à vista e financiado. No financiado, além de ROI e lucro líquido, entram retorno sobre capital próprio e penalidades pelo custo do financiamento durante a posse e pela quitação na saída. A mesma base econômica pode gerar score diferente conforme a modalidade. À vista mantém score por ROI, lucro líquido e desconto.

## Fases anteriores

A fase 0 congelou o contrato. A fase 1 levou domínio, DTO e cálculo. A fase 2 aplicou os endpoints. A compatibilidade com o registro antigo ficou na fase de migração, descrita em [Migração de legado](migracao-legado.md).

Depreciação relevante: `deals` embutido no projeto deixou de ser aceito. A evidência de teste da fase 5 está no [aceite](aceite.md).
