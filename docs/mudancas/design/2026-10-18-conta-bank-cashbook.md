# Design: conta do bank no cashbook

**Status:** vigente
**Data:** 2026-10-18
**ADR:** [conta do bank no livro](https://wmreis-labs.github.io/wmreis-docs/mudancas/adr/2026-10-18-conta-bank-livro/)
**PRD:** [caixa pessoal e profissional](https://wmreis-labs.github.io/wmreis-docs/mudancas/prd/2026-09-27-caixa-pessoal-profissional/)

## Objetivo

Cadastrar a conta uma vez. A identidade fica no `bank`. O livro fica no `cashbook`. A lista devolve a visão junta. A tela não junta as duas fontes.

## Fora deste desenho

A rota e os estados da tela estão em [Conta no admin](https://wmreis-labs.github.io/admin-docs/mudancas/design/2026-10-18-conta-bank-admin/). O agregado do mês, o upload e a classificação do extrato continuam em [Cashbook](2026-09-27-caixa-cashbook.md). O lembrete continua em [Lembrete](2026-10-17-lembrete-cashbook.md). A coleta do Inter não passa a ler `/bank/accounts` neste corte. O Hostto continua em `/bank/accounts`, com crédito, débito e saldo.

## Fluxo

1. O cadastro chega em `POST /cashbook/contas`.
2. O `cashbook` grava a conta no `bank`: provedor, nome, agência e número, ou os quatro últimos dígitos quando o produto é cartão. Gerente e telefone entram só se a pessoa informou.
3. O `cashbook` grava o vínculo: identificador da conta do `bank`, livro, produto e, na conta, corrente ou poupança.
4. A resposta e a lista devolvem a visão junta. Agência e número não são copiados para a tabela do `cashbook`.

## Contrato

`POST /cashbook/contas` recebe livro, nome, provedor, produto (`conta` ou `cartao`) e, quando o produto é conta, modalidade (`corrente` ou `poupanca`), agência e número. No cartão recebe os quatro últimos dígitos, sem agência. Nome e telefone do gerente são opcionais.

A resposta traz a visão: identificador do vínculo, identificador da conta no `bank`, livro, nome, provedor, agência, número ou final do cartão, produto, modalidade, gerente, telefone e situação.

`GET /cashbook/contas` devolve essa mesma visão, filtrada por livro quando o filtro vier. Conta sem livro continua fora do resultado.

Conta Inter nos livros TESTTO e WMREIS volta com a marca de coleta automática. A marca não liga o coletor.

## Dados

A conta do `bank` segue a chave que já existe: provedor e identificador da conta no provedor. Na conta corrente ou poupança, esse identificador é o número. No cartão, são os quatro últimos dígitos.

O vínculo no `cashbook` guarda o identificador da conta do `bank`, o livro, o produto e a modalidade. A partição continua o livro. A lista é `Query` com cursor. Não usa `Scan` nem grava em `FinancialEntry`.

Uma conta do `bank` entra em um livro só. Conta do `cashbook` já gravada sem esse identificador permanece legível e não entra no resultado até ser ligada.

## Riscos

Dois números iguais no mesmo provedor conflitam no `bank`. A resposta de conflito volta para a tela. Falha depois da conta do `bank` gravada não pode deixar o vínculo pela metade sem a situação de revisão. Nenhum desses riscos autoriza copiar agência para o `cashbook` nem classificar a transação do `bank`.
