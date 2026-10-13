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

Aplicar o desenho vigente, uma lista por tarefa. As escolhas abaixo ficam de pé se esta RFC for aceita.

1. A tabela continua uma por entidade. As 46 tabelas não se fundem.
2. Lista de tela faz `Query` no índice da pergunta e devolve cursor. Número de página não entra na troca. `Scan` fica em job de manutenção: backfill, reconcile e carga.
3. Não nasce repositório genérico de CRUD. Não há troca de cliente num único esforço. `RepositoryBase` continua fora do caminho de lista.
4. Índice que já existe não muda de sort key nem de projeção no lugar. A tarefa cria o índice novo, passa a gravar a chave e carrega o que já está na tabela. Essa carga não entra no mesmo pull request do caixa.
5. `GET /orders/summary` e `GET /orders/aggregate` continuam no Athena. Não ganham GSI.
6. A ordem das tarefas é esta:
    - Product alinha escrita e leitura a `tenant` + `id` (estoque: `productId`). Preço, variante, BOM e movimento por produto usam `tenant-productId-index`. O código deixa de citar `productId-index` e `ProductStatusIndex`. A lista por status só entra quando a tarefa dessa tela criar o índice.
    - Sales operacional consulta a PK `tenant`. Igualdade de status usa o GSI cuja sort key é `status` ou `orderStatus`. Intervalo de data usa o GSI cuja sort key é `createdAt`. Pedido por cliente ganha índice novo `tenant` + `customerId` e o atributo `customerId` na raiz do item. Até a carga terminar, essa lista não varre a tabela.
    - Delivery, payment e shipment consultam a PK `tenant` e o GSI `tenant-orderId` que já existe.
    - Financial, budget e flipping mantêm as chaves compostas. A lista que hoje para em 1 MB passa a seguir o cursor. O índice não é redesenhado.
    - Person e contract ganham índice novo. Person: partição `tenant`. Contract: partição `entity`, e `tenant` quando a lista da tela for por tenant. A carga é idempotente e o item ganha `schemaVersion`. Property não ganha GSI de tenant: o item não tem esse atributo, e a listagem global permanece job até uma decisão que coloque tenant no imóvel. Bank accounts ganha índice novo em `organizationId` e `provider`, que são os recortes da lista.
7. Projeção curta em GSI de item grande (`SalesOrder`, `FinancialEntry`) espera medida de `ConsumedCapacity`. Não faz parte desta RFC.

## Alternativas

Um kit único de Document Client, com `get`, `query`, `put`, `update` e batch, e a migração de financial, budget, flipping, calendar, bank e audit no mesmo esforço. O [desenho de 12/10](../design/2026-10-12-acesso-dynamodb.md) deixa isso de fora: não cria repositório genérico e não troca o cliente de uma vez.

Fundir as tabelas num single-table. O modelo de dados e as tabelas já publicadas são uma por entidade.

Renomear o GSI de pedido para a sort key passar a ser `customerId`. Índice existente não muda no lugar. A consulta por cliente usa índice novo. A consulta por data ou status usa a sort key que o índice já tem.

Capacidade provisionada no lugar de pay-per-request. Fora desta RFC. O prejuízo atual é ler item de outro tenant, não o teto de escrita de uma partição.

## Impacto

Domínios: product, sales, delivery, financial, budget, flipping, person, contract e bank. Calendar entra só se uma lista de tela ainda usar `Scan`; evento por calendário e por pessoa já consulta GSI.

Dados: índice novo só na lista que não tem chave. A PK das tabelas atuais permanece. Item de pedido ganha `customerId` na raiz. Itens migrados ganham `schemaVersion`.

Interfaces: a lista trocada responde cursor, não `page`. Se a tela paginar por número, o registro dessa interface fica no docs da interface. Summary e aggregate de pedidos não mudam de origem.

## Decisão pedida

Aceitar os sete pontos da proposta para virar ADR. A implementação espera esse ADR. Cada linha da sequência é uma tarefa, com o desenho de 12/10 como regra da lista. A listagem global de imóveis continua job até existir tenant no item.
