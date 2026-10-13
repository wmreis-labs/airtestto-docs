# Design: fases do acesso ao DynamoDB

**Status:** vigente
**Data:** 2026-10-13
**ADR:** [Acesso ao DynamoDB em fases](../adr/2026-10-13-acesso-dynamodb.md)
**Desenho da lista:** [Acesso ao DynamoDB](2026-10-12-acesso-dynamodb.md)

## Objetivo

Cada fatia abaixo vira uma issue. A issue implementa uma fase, com teste, e pode ir a produção sozinha. A fase 0 não muda chamada que já está no ar.

## Fora deste desenho

Não há PRD: a tela não muda. `page` e `total` continuam na resposta HTTP. `GET /orders/summary` e `GET /orders/aggregate` continuam no Athena. Property não ganha GSI de tenant. Lista de produto por status fica de fora até existir índice dessa pergunta. Projeção curta de `SalesOrder` e `FinancialEntry` espera `ConsumedCapacity`. A carga de índice novo não entra no mesmo pull request do caixa. Não nasce classe de CRUD.

## Fluxo

1. Entra o kit em `shared`. Nenhum repositório de produção passa a usá-lo nessa fase.
2. Um repositório que já faz `Query` passa a chamar o kit. O teste confere a mesma chave e o mesmo item.
3. As listas seguintes trocam `Scan` por `Query` na chave que já existe, ou esperam índice novo.
4. Índice novo segue quatro pull requests: criar, gravar a chave nos itens novos, carregar os antigos, apontar a leitura. A leitura antiga permanece até o último passo.

## Contrato

O kit mora em `packages/shared` do monorepo. Um `DynamoDBDocumentClient` com `removeUndefinedValues`. As operações são `get`, `queryPage`, `put`, `update`, `delete` e `batch`. `batch` retenta `Unprocessed*`. O cursor é opaco, em cima de `LastEvaluatedKey`. `ReturnValues` é `NONE`, salvo quando o chamador usa o item devolvido, como o contador de pedidos.

O repositório do domínio monta a chave e chama o kit. `RepositoryBase` deixa de ser caminho de lista.

## Dados

A PK das tabelas atuais permanece. Product grava e lê `tenant` + `id`. Estoque usa `tenant` + `productId`. Preço, variante, BOM e movimento por produto usam o GSI `tenant-productId-index`. Sales operacional usa a PK `tenant`, ou o GSI cuja sort key já é `status`, `orderStatus` ou `createdAt`. Delivery, payment e shipment usam a PK `tenant` e o GSI `tenant-orderId`. Financial, budget e flipping mantêm `unitLookupKey`, `propertyLookupKey` e `tenantProjectKey`.

Índice novo, um por issue: `customerId` na raiz do pedido, `tenant` em person, `entity` em contract, `organizationId` e `provider` em bank accounts. O item carregado ganha `schemaVersion`.

## Riscos

Apontar a leitura de pedido por cliente para o índice novo antes da carga some pedido antigo da lista. A fase 3 consulta a partição do tenant e deixa essa troca para a fase 6.

Product que grava `PK`/`SK` e a tabela espera `tenant` + `id` precisa do teste do mesmo id na fase 2. Sem esse teste, a escrita nova não encontra o item antigo.

Cursor na resposta HTTP quebraria a tela. Nenhuma fatia desta página troca `page` por cursor.

## Fatias

Cada linha é uma issue. O aceite é o que o teste prova. A coluna da produção é o que não pode mudar nesse pull request.

| Issue | Fase | Pacote | Aceite | Produção continua |
| --- | --- | --- | --- | --- |
| Kit de acesso ao DynamoDB | 0 | `packages/shared` | Teste de página, cursor, update e batch com retry. Nenhum repositório de produção importa o kit ainda | Toda leitura e escrita atual |
| Cart usa o kit | 1 | `packages/sales` `CartRepository.findByCustomerId` | O teste confere `tenant-customerId-index`, a mesma chave e o mesmo item | A lista do carrinho igual |
| Product na chave da tabela | 2 | `packages/product` | Escrita e leitura em `tenant` + `id` (estoque: `productId`). Preço, variante, BOM e movimento por produto usam `tenant-productId-index`. O código não cita `productId-index` nem `ProductStatusIndex`. O mesmo id é encontrado | Lista por status fora. Resposta HTTP igual |
| Pedidos na partição do tenant | 3 | `packages/sales` leitura de `SalesOrder` | `Query` na PK `tenant`, ou no GSI cuja sort key já é `status`, `orderStatus` ou `createdAt`. O handler devolve `page` e `total` como hoje | Pedido por cliente no caminho antigo. Summary e aggregate no Athena |
| Delivery, payment e shipment por chave | 4 | `packages/delivery` e `packages/sales` | `list` por tenant na PK. Busca por `orderId` no GSI `tenant-orderId` | A forma da lista igual |
| Financial, budget e flipping no kit | 5 | `packages/financial`, `packages/budget`, `packages/flipping` | Usam o kit. Mantêm `unitLookupKey`, `propertyLookupKey` e `tenantProjectKey`. Lista que parava em 1 MB segue o cursor por dentro | A função devolve a mesma coleção |
| Índice `customerId` em pedido | 6 | `packages/sales` | Índice `tenant` + `customerId`. Itens novos gravam `customerId`. Carga dos antigos. A leitura por cliente só muda depois da carga | Até a carga, a fase 3 permanece |
| Índice `tenant` em person | 6 | `packages/person` | Índice novo, carga com `schemaVersion`, leitura por tenant só depois | `Scan` com filtro até o corte |
| Índice `entity` em contract | 6 | `packages/contract` | Índice em `entity`. `tenant` só se a lista da tela for por tenant. Leitura só depois da carga | `Scan` com filtro de `entity` até o corte |
| Índices de bank accounts | 6 | `packages/bank` | Índice em `organizationId` e `provider`. Leitura só depois da carga | `Scan` com `begins_with` até o corte |
