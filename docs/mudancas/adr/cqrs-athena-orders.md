# CQRS e Athena para pedidos

**Status:** aceita em 2026-04-05. Esta é a fase 0 da separação.

## Contexto

Sales mistura consulta operacional e consulta analítica na mesma tabela de pedidos. Agregação por período e dimensão não é o trabalho dessa tabela. O custo mensal da stack era baixo, abaixo de 5 USD, e havia restrição explícita para não repetir o custo fixo visto antes com OpenSearch.

## Decisão

A ordem de adoção é `SalesOrder`, depois `Delivery`, depois `AuditEvents`.

O lado de comando continua no DynamoDB, fonte da escrita e do fluxo operacional. O lado de consulta analítica usa Athena, na primeira onda só para pedidos. A troca de origem é por endpoint, com volta rápida. Não há migração única.

| Endpoint | Origem na fase 0 | Motivo |
| --- | --- | --- |
| `GET /orders` | Transacional | Lista operacional, com paginação |
| `GET /orders/all` | Transacional | Uso operacional |
| `GET /orders/{id}` | Transacional | Leitura por chave |
| `GET /customers/{id}/orders` | Transacional | Pedidos de um cliente |
| `GET /orders/summary` | Athena | Agregação por período e status |
| `GET /orders/aggregate` | Athena | Agregação por dimensão |

Consulta no Athena exige tenant, data inicial e data final. A janela máxima é 31 dias no summary e 7 dias no aggregate. Filtro ausente é erro de validação. O SQL sai de template aprovado, sem consulta livre. A resposta analítica usa cache.

Metas: p95 de 800 ms com cache e 3000 ms sem cache; disponibilidade mensal de 99,5%. Teto do Athena: 3 USD por mês em dev e 15 USD por mês no início de produção. O workgroup limita bytes por query. Alarmes em 50%, 80% e 100% do orçamento.

## Consequências

A carga analítica deixa de competir com a transacional. A evolução é incremental. O contrato da consulta fica rígido: filtro obrigatório e janela curta. A consistência entre comando e consulta é eventual.

## Alternativas

Migrar tudo para o Athena de uma vez foi rejeitado pelo custo e pela regressão. Manter só DynamoDB foi rejeitado para agregação. Voltar o OpenSearch como trilha principal foi rejeitado pelo custo fixo e pela operação.
