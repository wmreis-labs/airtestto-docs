# ADR: acesso ao DynamoDB em fases

**Status:** aceita em 2026-10-13
**RFC:** [Aplicar o acesso por chave](../rfc/2026-10-13-acesso-dynamodb.md)
**Desenho da lista:** [Acesso ao DynamoDB](../design/2026-10-12-acesso-dynamodb.md)
**Desenho das fases:** [Fases do acesso](../design/2026-10-13-fases-acesso-dynamodb.md)

## Contexto

Há uma tabela por entidade. Várias listas varrem a tabela e filtram o tenant depois. O desenho de 12/10 já pede `Query` por chave. Os repositórios ainda criam cliente próprio, ou usam o cliente de baixo nível, e copiam a mesma operação.

Summary e aggregate de pedidos já têm origem no Athena, pelo [ADR de 05/04](cqrs-athena-orders.md).

## Decisão

Um cliente só em `shared` entra antes de qualquer lista. As operações são `get`, `queryPage`, `put`, `update`, `delete` e `batch`. O repositório do domínio monta a chave. Não há classe de CRUD.

Cada lista muda no próprio pull request, com teste, e pode ir a produção sozinha. A leitura antiga permanece até o índice novo estar ativo e a carga terminar. A resposta HTTP, com `page` e `total`, não muda nestas fases. `GET /orders/summary` e `GET /orders/aggregate` continuam no Athena.

A ordem é a da RFC: kit, um repositório piloto que já faz `Query`, product na chave que a tabela já tem, sales na partição do tenant, delivery com payment e shipment, financial com budget e flipping, e por último um índice novo por issue.

## Consequências

A implementação lê este ADR e o [desenho das fases](../design/2026-10-13-fases-acesso-dynamodb.md). A fase 0 não altera chamada de produção. Índice existente não muda de sort key nem de projeção no lugar. A listagem global de imóvel continua job até o item ter tenant. Projeção curta de `SalesOrder` e `FinancialEntry` espera medida de `ConsumedCapacity`.

## Alternativas

Trocar cliente e acabar com o `Scan` no mesmo pull request foi rejeitado: não dá para provar que produção segue igual. Começar pelas listas e deixar cada pacote copiar o client foi rejeitado: a fase seguinte repetiria o código. Uma classe de CRUD que lista com `Scan` foi rejeitada pelo desenho de 12/10. Single-table e capacidade provisionada ficam de fora.
