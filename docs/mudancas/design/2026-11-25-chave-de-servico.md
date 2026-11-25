# Design: chave de serviço

**Status:** vigente
**Data:** 2026-11-25
**ADR:** [Chave de serviço emitida pelo admin](https://wmreis-labs.github.io/wmreis-docs/mudancas/adr/2026-11-25-chave-de-servico/)
**Tarefas:** [airtestto #413](https://github.com/wmreis-labs/airtestto/issues/413), [airtestto #414](https://github.com/wmreis-labs/airtestto/issues/414)

## Objetivo

O platform-admin grava a chave e o authorizer da API principal deixa passar só a empresa e as rotas daquela chave. A tela fica no design do admin.

## Fora deste desenho

Lista de passos da operação `agenda.consultar`, canal, conhecimento, auditoria, escrita, religar chave, reexibir o segredo e o segredo único da conta no authorizer da API principal.

## Fluxo

Quem chama a API do platform-admin é o access token do operador. O handler só aceita `OperadorPlataforma` e `Administracao`. `Identidade` recebe 403, mesmo com o authorizer do pool deixando passar.

Criar escolhe itens do catálogo. As rotas desses itens são copiadas para o registro. O segredo vai só na resposta 201. Listar, trocar acessos e revogar não devolvem segredo.

A chamada de negócio manda `Authorization: Bearer sk_...` e `x-tenant` igual ao da chave. O authorizer não chama o Cognito. Calcula o SHA-256, lê o registro e confere empresa e rota. O cache do authorizer continua 0, para a revogação valer na chamada seguinte.

## Contrato

Base `/platform-admin`.

`GET /admin/service-keys/catalog`

```json
{
  "items": [
    {
      "id": "agenda.imovel",
      "name": "Agenda do imóvel",
      "routes": [
        { "method": "GET", "path": "/properties" },
        { "method": "GET", "path": "/properties/{id}/calendars" },
        { "method": "GET", "path": "/properties/{id}/calendars/{calendarId}/events" }
      ]
    }
  ]
}
```

`GET /admin/service-keys` devolve a lista sem `secret` e sem `secretHash`. Cada item traz `id`, `name`, `tenant`, `routes`, `enabled`, `createdAt`, `createdBy` e `revokedAt` quando houver.

`POST /admin/service-keys` recebe `{ "name", "tenant", "catalogIds": ["agenda.imovel"] }`. Nome até 80 caracteres. Tenant no padrão `[a-z0-9-]+` e existente. Sem `catalogIds`, catálogo desconhecido ou tenant inexistente: 400. Resposta 201 com a chave da lista mais `secret` uma única vez.

`PATCH /admin/service-keys/{id}` recebe `{ "catalogIds": ["agenda.imovel"] }` e troca as rotas de uma chave ligada. Chave revogada: 409.

`POST /admin/service-keys/{id}/revoke` desliga. A resposta não traz segredo. Chamar de novo em chave já revogada devolve a mesma linha.

Segredo: prefixo `sk_` mais 32 bytes em base64url.

## Dados

A tabela é do platform-admin. Imóvel, calendário e ATO não a leem. O authorizer da API principal só faz `GetItem`, pela chave do hash.

O registro tem `id` gerado pelo servidor, `name`, `tenant`, `routes` copiadas do catálogo, `secretHash` em hex, `enabled`, `createdAt`, `createdBy` e `revokedAt` quando houver. O texto puro não é gravado.

## Authorizer

Vale para o authorizer que protege `/properties` e os calendários. Se o Bearer começa com `sk_`:

1. Não chama o Cognito.
2. Sem registro, revogada ou desligada: 401.
3. `x-tenant` ausente ou diferente do `tenant` da chave: 401.
4. Método e caminho fora da lista: 401. `{id}` casa um segmento não vazio. A query não entra na permissão.
5. Casou: autoriza com o `tenant` da chave, `tenantSource` `session`, `sub` igual ao `id`, `username` `service-key` e grupos vazios. Não passa na conferência de papel.

`GET /contracts`, `POST /properties` e `DELETE` de evento ficam de fora da primeira chave. Um access token de pessoa segue o fluxo de hoje.

## Riscos

O hash permite achar a chave sem varrer a tabela. Quem tiver o segredo chama até a revogação. O segredo não volta na lista para não ficar na tela depois do diálogo de criação.
