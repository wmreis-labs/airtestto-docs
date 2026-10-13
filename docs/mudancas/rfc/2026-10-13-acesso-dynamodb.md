# RFC: aplicar o acesso por chave no DynamoDB

**Status:** em revisão
**Data:** 2026-10-13
**Desenho:** [Acesso ao DynamoDB](../design/2026-10-12-acesso-dynamodb.md)
**ADR relacionado:** [CQRS e Athena para pedidos](../adr/cqrs-athena-orders.md)

## Problema

Há 46 tabelas, uma por entidade, todas em pay-per-request. A lista de várias telas ainda varre a tabela e filtra o tenant depois. O DynamoDB cobra o que foi lido, não o que voltou. O [desenho de 12/10](../design/2026-10-12-acesso-dynamodb.md) já exige `Query` por chave e página por cursor. O código não segue esse desenho, e não há ADR deste assunto: só o design doc.

O inventário abaixo é o que a leitura faz hoje. Ele serve para a próxima tarefa não redescobrir o mesmo mapa.

| Domínio | Leitura atual | Chave que já existe |
| --- | --- | --- |
| Product: estoque, BOM, movimento, tamanho, recheio, variante | Grava `PK`/`SK` e consulta `productId-index`, que a tabela não tem | `tenant` + `id`. Estoque: `tenant` + `productId` |
| Product: preço e categoria | `Scan` com filtro de tenant. Categoria também tem um `Query` correto ao lado do `Scan` | `tenant` + `id`. Preço, BOM, movimento e variante têm `tenant-productId-index` |
| Product: status | Consulta `ProductStatusIndex`, que a tabela não tem | Nenhuma. A tela de status espera índice novo |
| Sales: pedidos | `Scan` da tabela e filtro na memória (cliente, status, data, texto) | PK `tenant`. Os GSIs ordenam por `createdAt`, `status` ou `orderStatus`. O nome do índice não descreve essa sort key |
| Delivery | `Scan` com filtro de tenant | PK `tenant` e GSI `tenant-orderId` |
| Payment e shipment | Tabela e GSI `tenant-orderId` existem. Nenhum repositório consulta | A mesma chave da tabela |
| Financial, budget, flipping | `Query` no GSI da pergunta (`unitLookupKey`, `propertyLookupKey`, `tenantProjectKey`) | Manter. Algumas listas param no primeiro 1 MB |
| Person | `Scan` com filtro de tenant | PK só `id`. Tenant não é chave |
| Property | `Scan` sem filtro na listagem e no sync | PK `id`. Filho usa `ParentPropertyIdIndex`. O item não tem tenant |
| Contract e template | `Scan` com filtro de `entity` | PK só `id` |
| Bank accounts | `Scan` com `begins_with` em `PK` | Lista por `provider` e `organizationId`, não por um campo `tenant` |

Financial, flipping, contract webhook, storage e audit também criam cliente próprio. Bank e audit usam Document Client. O restante usa o cliente de baixo nível. Isso é custo de manutenção, não o custo de RCU da lista.

## Proposta

A casa vem antes da lista. A casa é um cliente só e as mesmas operações. A lista de cada tela muda numa fase seguinte, com teste, e o fluxo que já está em produção continua no caminho antigo até essa fase apontar a leitura nova.

1. Um `DynamoDBDocumentClient` em `shared`, com `removeUndefinedValues`. As operações são `get`, `queryPage` (cursor), `put`, `update`, `delete` e `batch`, com retry de `Unprocessed*`. `ReturnValues` fica `NONE`, salvo quando o chamador usa o item devolvido, como o contador de pedidos. O repositório do domínio continua montando a chave. Não nasce classe de CRUD. `RepositoryBase` deixa de ser caminho de lista.
2. A fase do kit não troca nenhum repositório que produção chama. O teste do kit cobre página, cursor, batch e update. O primeiro pacote que já consulta por chave passa a usar o kit, e o teste confere a mesma chave e o mesmo item. Bank e audit largam o client próprio só na fase daquele pacote.
3. Trocar `Scan` por `Query` é a fase daquela lista, depois do kit. A resposta HTTP permanece: `page` e `total` continuam até uma fase própria de cursor. O front não muda no mesmo pull request do acesso.
4. Índice que já existe não muda de sort key nem de projeção no lugar. Índice novo segue esta ordem, cada passo no seu pull request: criar o índice, gravar a chave nos itens novos, carregar os antigos, e só então apontar a leitura. Antes da carga, a leitura antiga permanece. A carga não entra no mesmo pull request do caixa.
5. `GET /orders/summary` e `GET /orders/aggregate` continuam no Athena. Não ganham GSI.
6. As fases, depois do kit, são estas. Cada uma tem teste de repositório e pode ir a produção sozinha.
    - Product alinha escrita e leitura a `tenant` + `id` (estoque: `productId`). Preço, variante, BOM e movimento por produto usam `tenant-productId-index`. O código deixa de citar `productId-index` e `ProductStatusIndex`. O teste busca o mesmo id e o encontra. A lista por status só entra quando a tarefa dessa tela criar o índice.
    - Sales operacional consulta a PK `tenant`, ou o GSI cuja sort key já é `status`, `orderStatus` ou `createdAt`. O handler devolve a mesma forma de hoje. Pedido por cliente ganha índice novo `tenant` + `customerId` e o atributo `customerId` na raiz. A leitura por cliente só muda depois da carga. Até lá, essa lista não varre a tabela inteira: consulta a partição do tenant.
    - Delivery, payment e shipment consultam a PK `tenant` e o GSI `tenant-orderId` que já existe.
    - Financial, budget e flipping passam a usar o kit e mantêm as chaves compostas (`unitLookupKey`, `propertyLookupKey`, `tenantProjectKey`). A lista que hoje para em 1 MB segue o cursor por dentro. Quem chama a função recebe a mesma coleção.
    - Person e contract ganham índice novo. Person: partição `tenant`. Contract: partição `entity`, e `tenant` quando a lista da tela for por tenant. A leitura antiga permanece até o índice estar ativo e a carga idempotente gravar `schemaVersion`. Property não ganha GSI de tenant: o item não tem esse atributo, e a listagem global permanece job. Bank accounts ganha índice em `organizationId` e `provider`.
7. Projeção curta em GSI de item grande (`SalesOrder`, `FinancialEntry`) espera medida de `ConsumedCapacity`. Não faz parte desta RFC.

| Fase | O que entra | O que produção continua fazendo |
| --- | --- | --- |
| 0 | Kit e o teste dele | Toda leitura e escrita atual |
| 1 | Um repositório que já faz `Query` passa a usar o kit | A mesma chave e o mesmo item |
| 2 | Product na chave da tabela e nos GSIs que já existem | O mesmo id continua encontrável |
| 3 | Sales consulta a partição do tenant. O HTTP não muda | Pedido por cliente no caminho antigo até a carga do índice novo |
| 4 | Delivery, payment e shipment na PK e no GSI `tenant-orderId` | A resposta da lista igual |
| 5 | Financial, budget e flipping no kit, com cursor interno | A função devolve a mesma coleção |
| 6 | Índices novos: `customerId`, tenant de person, `entity` de contract, `organizationId` e `provider` de bank | A leitura antiga até o índice estar ativo e a carga terminar |

## Alternativas

Migrar todos os repositórios para o cliente novo no mesmo esforço, junto com o fim do `Scan`. Um pull request desse tamanho não tem como provar que produção segue igual.

Começar pelas listas e deixar cada pacote copiar `marshall`, cursor e client. A casa continua espalhada e a fase seguinte repete o mesmo código.

Uma classe de CRUD que esconde a chave e lista com `Scan`. O [desenho de 12/10](../design/2026-10-12-acesso-dynamodb.md) recusa esse caminho. O kit desta RFC é operação, não lista genérica.

Fundir as tabelas num single-table. O modelo de dados e as tabelas já publicadas são uma por entidade.

Renomear o GSI de pedido para a sort key passar a ser `customerId`. Índice existente não muda no lugar. A consulta por cliente usa índice novo, e a leitura só aponta para ele depois da carga.

Capacidade provisionada no lugar de pay-per-request. Fora desta RFC. O prejuízo atual é ler item de outro tenant, não o teto de escrita de uma partição.

## Impacto

Domínios: shared na fase 0; depois product, sales, delivery, financial, budget, flipping, person, contract e bank. Calendar entra só se uma lista de tela ainda usar `Scan`. Evento por calendário e por pessoa já consulta GSI.

Dados: a PK das tabelas atuais permanece. Índice novo só na lista que não tem chave, e a leitura só muda depois da carga. Item de pedido ganha `customerId` na raiz. Itens migrados ganham `schemaVersion`.

Interfaces: nenhuma fase desta RFC troca `page` por cursor na resposta HTTP. Summary e aggregate de pedidos não mudam de origem. Uma fase futura de cursor, se a tela precisar, fica no docs da interface.

## Decisão pedida

Aceitar a ordem da tabela de fases. A fase 0 não altera produção. Cada fase seguinte é um pull request, com teste, e pode ir sozinha. A implementação espera o ADR. A listagem global de imóveis continua job até existir tenant no item.
