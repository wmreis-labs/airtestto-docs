# PRD: caixa pessoal e profissional

**Status:** aprovado
**Data:** 2026-09-27
**Produto:** Admin, com o cálculo no airtestto

## Problema

O caixa pessoal e o da empresa se misturam. Transferência entre contas próprias aparece como receita ou despesa. Conta a pagar chega por e-mail e se perde no volume. Não dá para ver se o mês melhorou, nem quanto sobra para investir depois da reserva.

## Quem usa

Quem opera o admin da plataforma, com duas vidas financeiras no mesmo tenant: a pessoal e a da empresa. O Hostto continua o produto de imóvel e não é esta tela.

## Resultado esperado

Um painel, por livro e consolidado, que mostra receita real, despesa real e o resultado do mês. Transferência entre contas próprias e aporte não entram nesse resultado. A sobra investível só aparece depois que a reserva do período está completa.

## Escopo

1. Painel por livro e consolidado, com a série dos meses.
2. Cadastro das contas, cada uma num livro. A conta PJ do Inter segue automática. Itaú, Santander e Nubank entram por arquivo.
3. Extrato por arquivo: upload no admin, pasta do Google Drive por banco e label de extrato no Gmail. OFX primeiro, depois CSV. PDF de extrato vai para revisão.
4. Fila de revisão do que não fechou sozinho.
5. Lançamento manual, com data de competência, para o que não veio de banco.
6. Contas que chegam por e-mail, numa segunda label só de boleto e fatura. O que tiver valor e vencimento vira despesa prevista e concilia quando o extrato mostrar o pagamento.
7. Plano para investir: meta de reserva, reserva atual, quanto falta, resultado do período, aportes já feitos e sobra investível. Sem corretora e sem sugestão de ativo.

## Fora do escopo

- Open Finance e API de Itaú, Santander ou Nubank.
- Corretora, carteira de ativos ou recomendação de investimento.
- Lançamento de imóvel, reforma ou qualquer tela do Hostto.
- Ler a caixa de e-mail inteira.
- Tratar PDF de extrato como fonte automática.

## Critério de aceite

Fase 1. Dá para ver receita real, despesa real e transferência, por livro e no consolidado. O Inter está no livro PJ. Itaú, Santander e Nubank entram por OFX ou CSV. O que não fecha vai para a revisão. O painel não mostra número inventado.

Fase 2. Drive e Gmail, por label, entregam extrato. Boleto e fatura viram despesa prevista e conciliam com o pagamento no extrato. O que não casar continua na lista de contas a vencer.

Fase 3. A reserva, a sobra investível e o histórico de aportes aparecem no painel. Aporte não entra como despesa operacional.

## Métrica

Receita real, despesa real, resultado, volume de transferência, aportes do período e sobra investível. A pergunta que o painel responde é se o mês melhorou.

## Decisões e desenho

As escolhas fechadas estão nos ADRs [domínio cashbook](../adr/2026-09-27-dominio-cashbook.md), [livros e naturezas](../adr/2026-09-27-livros-pf-pj.md) e [admin e ingestão](../adr/2026-09-27-admin-e-ingestao.md). O funcionamento está nos design docs [cashbook](../design/2026-09-27-caixa-cashbook.md) e [admin](../design/2026-09-27-caixa-admin.md).
