# ADR: livros PF e PJ

**Status:** aceita em 2026-09-27.

## Contexto

Há duas vidas financeiras no mesmo tenant. A pessoal usa Itaú, Santander e Nubank. A da empresa usa Inter. Pró-labore, distribuição e aporte circulam entre elas. Se cada crédito contar como receita, o consolidado mente.

O [PRD](../prd/2026-09-27-caixa-pessoal-profissional.md) pede um número que diga se o mês melhorou.

## Decisão

Dois livros no mesmo tenant: **PF** e **PJ**. Cada movimento nasce no livro da conta.

A classificação tem quatro naturezas:

- **Externo.** Cliente, salário, mercado, imposto, aluguel. Entra em receita ou despesa real.
- **Entre contas do mesmo livro.** Itaú para Nubank. É transferência e sai do resultado daquele livro.
- **Entre livros.** Inter para Nubank. Transferência nos dois lados, com o par ligado. Some na visão consolidada.
- **Alocação.** Aporte em corretora ou o tipo `INVESTIMENTO` do Inter. Não é despesa operacional e fica fora do resultado do mês.

O resultado de um livro e o consolidado usam a mesma conta do financeiro de imóveis: receita real menos despesa real. Transferência e alocação aparecem ao lado, sem entrar na conta.

## Consequências

O painel mostra os dois livros e o consolidado. Um PIX sem o outro lado, ou dois candidatos do mesmo valor, não fecha sozinho. O pareamento e a fila de revisão estão em [Cashbook](../design/2026-09-27-caixa-cashbook.md).

## Alternativas

Um livro só foi rejeitado: pessoa e empresa se misturam. Tratar pró-labore como receita do conjunto foi rejeitado: o dinheiro só mudou de livro. Contar aporte como despesa foi rejeitado: a reserva e a sobra investível deixam de fazer sentido.
