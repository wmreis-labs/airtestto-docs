# Design: acesso ao DynamoDB

**Status:** vigente
**Data:** 2026-10-12
**RFC:** [Aplicar o acesso por chave](../rfc/2026-10-13-acesso-dynamodb.md) (em revisão). O inventário e a ordem das tarefas estão lá. Esta página continua sendo a regra da lista.

## Objetivo

Lista disparada por tela consulta por chave. O tenant entra na chave. A data e a ordem entram na sort key. A página anda por cursor.

O modelo de referência é o razão de imóvel: a lista escolhe um índice pela pergunta e devolve `nextCursor`.

## Fora deste desenho

Não cria repositório genérico de CRUD. `RepositoryBase` lista com `Scan` e filtro de tenant; não é o caminho. Não troca o cliente de uma vez só. Não altera índice que já existe: índice novo, gravação da chave nova e carga do que já está na tabela. Não mistura essa carga com o caixa no mesmo pull request.

## Fluxo

1. A tela pede uma lista com um recorte (tenant, e quando couber entidade, status ou intervalo).
2. O repositório faz `Query` no índice desse recorte.
3. A resposta traz os itens da página e o cursor da próxima. Não usa número de página.
4. `Scan` fica em job de manutenção, fora do clique.

## Contrato

| Pergunta | Chave | O que não vale |
| --- | --- | --- |
| Lista da tela | partição com o tenant, ou `tenant` composto com a entidade | `FilterExpression` só para separar tenant |
| Ordem e intervalo de data | sort key | percorrer a tabela e filtrar depois |
| Próxima página | cursor | `page` que repete as páginas anteriores |
| Manutenção | `Scan` em job | `Scan` no request da tela |

## Dados

Tabelas novas seguem o razão: partição da pergunta e sort key de data. Partição só com o tenant cabe no volume de hoje. Histórico que cresce, como extrato, usa partição mais estreita. No caixa, a partição é livro e mês.

Índice cuja partição é a data exata não responde “de hoje em diante”. Esse caso pede outra chave, não um `Scan`.

## Riscos

`Scan` no clique lê até 1 MB, descarta no filtro e, junto com outras telas, disputa capacidade. A tabela não trava; as outras chamadas esperam ou recebem throttle. Passado 1 MB, a lista que não segue o cursor corta em silêncio.

GSI novo não substitui o antigo no mesmo nome. A tarefa que troca uma lista cria o índice, grava a chave e carrega o que já existe.
