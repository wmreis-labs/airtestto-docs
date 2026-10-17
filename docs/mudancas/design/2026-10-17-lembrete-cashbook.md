# Design: lembrete no cashbook

**Status:** vigente
**Data:** 2026-10-17
**ADR:** [lembrete antes do painel](https://wmreis-labs.github.io/wmreis-docs/mudancas/adr/2026-10-17-lembrete-caixa/)
**PRD:** [caixa pessoal e profissional](https://wmreis-labs.github.io/wmreis-docs/mudancas/prd/2026-09-27-caixa-pessoal-profissional/)

## Objetivo

Guardar a cobrança a vencer e devolver a lista que o sino e a tela exibem. O número e o grupo saem daqui. A tela não classifica de novo.

## Fora deste desenho

O sino, a rota e os estados da tela estão em [Lembrete no admin](https://wmreis-labs.github.io/admin-docs/mudancas/design/2026-10-17-lembrete-admin/). O agregado do mês, o upload e a classificação do extrato continuam em [Cashbook](2026-09-27-caixa-cashbook.md). A pasta do Drive e a conciliação do previsto com o pagamento no extrato não entram neste corte. `message` não lê caixa de e-mail.

## Fluxo

1. O modelo de conta e livro existe. Sem livro, o lembrete não é gravado.
2. O job diário lê os rótulos de boleto, fatura e imposto. Milton vai para o livro Milton. Mensagem do rótulo WMREIS vai para o livro WMREIS. Miralis e Testto são ignoradas.
3. Cobrança que casa com lembrete ativo atualiza vencimento, valor e evidência. Cobrança sem par entra com situação `novo`.
4. A pessoa confirma, dá baixa, encerra ou ajusta pela API. O job não reabre linha encerrada com o mesmo credor e a mesma descrição.

## Contrato

A lista e o sino saem em `/cashbook`. A tela não recalcula grupo nem contagem.

`GET /cashbook/lembretes` devolve a gestão, filtrada por livro, natureza e janela (`atrasado`, `hoje`, `7dias`). `GET /cashbook/lembretes/sino` devolve os três grupos e a contagem. A contagem soma atrasado, vence hoje e novo.

Cada item traz livro, credor, descrição, natureza, situação, dia, data de vencimento, valor, origem e evidência. A evidência não carrega código de barras, senha nem linha digitável.

Confirmar como rotina grava o dia do mês e a situação `ativo`. Confirmar como avulso grava a data de vencimento e a situação `ativo`. A baixa registra a ocorrência e tira o alerta dela; a rotina continua. Encerrar grava motivo e data, e a situação passa a `encerrado`. Ajustar dia ou valor vale para a próxima ocorrência e não altera extrato.

A chave de não duplicar é livro, credor e descrição.

## Dados

Três naturezas de situação: `novo`, `ativo`, `encerrado`. A natureza da cobrança é `rotina` ou `avulso`. Rotina exige dia de 1 a 31. Avulso exige data de vencimento. Encerrado exige motivo.

O acesso segue o [desenho do DynamoDB](2026-10-12-acesso-dynamodb.md). A lista é `Query` com cursor. A partição é o livro, não o tenant inteiro. Não usa `Scan` nem grava em `FinancialEntry`.

## Riscos

Rótulo errado deixa cobrança de fora ou coloca guia de outra empresa no livro. O job não varre a caixa para compensar. Credor escrito de dois jeitos cria dois novos; a confirmação na tela é o momento de unir. Nenhum desses riscos autoriza ler a caixa inteira nem gravar o lembrete em `FinancialEntry`.
