# Design: saldo atualizado após o extrato

**Status:** vigente
**Data:** 2026-10-23
**PRD:** [dashboard bancário](https://wmreis-labs.github.io/wmreis-docs/mudancas/prd/2026-10-17-dashboard-bancario/)

## Objetivo

O saldo que a tela mostra acompanha o Inter depois que o extrato registra movimento. O sync horário de saldo continua como conferência.

## Fora deste desenho

O Hostto não muda. A matriz, o extrato e os cards continuam lendo o summary e os saldos já publicados. Não há webhook do Inter neste corte. O domínio `bank` não chama a API do banco.

## Fluxo

1. O sync horário de extrato detalhado busca o período e publica `TRANSACTIONS_CAPTURED`.
2. Se a resposta trouxer lançamentos, o conector Inter busca o saldo e publica `BALANCE_CAPTURED` no mesmo fluxo.
3. O sync horário de saldo segue independente e também publica `BALANCE_CAPTURED`.
4. O `bank` grava o snapshot do dia. Uma nova captura no mesmo dia sobrescreve o valor anterior. A chave do dia usa o calendário de Brasília.

## Contrato

Os eventos `TRANSACTIONS_CAPTURED` e `BALANCE_CAPTURED` não mudam de formato. Falha na busca de saldo depois do extrato não impede o extrato de ser publicado; o sync horário tenta de novo.

## Dados

A tabela de saldos continua com um item por conta e dia (`BALANCE#YYYY-MM-DD`). O `Put` atualiza o item do dia. `getLatestBalance` e a lista por período continuam iguais.

## Riscos

O Inter pode demorar a alinhar extrato e saldo. Se a captura imediata vier atrasada, o sync horário corrige. Dois syncs na mesma hora podem gravar o saldo duas vezes; a última escrita vale.
