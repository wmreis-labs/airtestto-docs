# ADR: domínio cashbook

**Status:** aceita em 2026-09-27.

## Contexto

O caixa pessoal e o profissional precisam de razão própria. O domínio `financial` guarda lançamento de imóvel, com categorias de obra, `PROPERTY` e `FLIPPING_DEAL`. O domínio `budget` é orçamento de reforma por imóvel. O pacote `bank` normaliza extrato, mas trata todo crédito como entrada. O pacote `message` só envia e-mail.

O [PRD](../prd/2026-09-27-caixa-pessoal-profissional.md) pede receita e despesa reais, sem misturar isso com imóvel.

## Decisão

Nasce o domínio `cashbook`, com stack CDK e tabela próprias, no mesmo padrão de um stack por domínio. A API fica nesse domínio, no caminho `/cashbook`. Ele não grava em `FinancialEntry` e não usa `budget`.

O extrato normalizado continua em `bank`. Qualquer origem publica o evento que já existe, `TRANSACTIONS_CAPTURED`. Conta antiga sem livro continua válida. O campo de livro é opcional.

A conta PJ do Inter permanece no pacote `inter`, na coleta de hora em hora de saldo e extrato detalhado, e passa a estar ligada ao livro PJ.

Arquivo e e-mail são produtores à parte. Eles entregam extrato para a fila do `bank` ou a conta prevista para o `cashbook`. `message` não vira leitor de caixa.

## Consequências

O financeiro de imóveis permanece como está. O resumo do `bank` não é a fonte do resultado do mês. O desenho do fluxo e do pareamento está em [Cashbook](../design/2026-09-27-caixa-cashbook.md).

## Alternativas

Estender `FinancialEntry` com categoria pessoal foi rejeitado: mistura imóvel, pessoa e empresa na mesma razão. Usar `budget` foi rejeitado: ele é orçamento de obra. Calcular o resultado dentro de `bank` foi rejeitado: lá todo crédito é entrada.
