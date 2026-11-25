# Design: chave de serviço

**Status:** vigente
**Data:** 2026-11-25
**ADR:** [Chave de serviço emitida pelo admin](https://wmreis-labs.github.io/wmreis-docs/mudancas/adr/2026-11-25-chave-de-servico/)
**Tarefas:** [airtestto #413](https://github.com/wmreis-labs/airtestto/issues/413), [airtestto #414](https://github.com/wmreis-labs/airtestto/issues/414), [airtestto #420](https://github.com/wmreis-labs/airtestto/issues/420), [airtestto #421](https://github.com/wmreis-labs/airtestto/issues/421)

## Objetivo

O platform-admin grava a chave e o authorizer da API principal deixa passar só a empresa e as rotas daquela chave. A tela fica no design do admin.

## Fora deste desenho

Lista de passos da operação `agenda.consultar`, canal, conhecimento, auditoria, escrita, religar chave, reexibir o segredo e o segredo único da conta no authorizer da API principal.

## Fluxo

Quem chama a API do platform-admin é o access token do operador. O handler só aceita `OperadorPlataforma` e `Administracao`. `Identidade` recebe 403, mesmo com o authorizer do pool deixando passar.

Criar escolhe acessos gravados. As rotas desses acessos são copiadas para a chave. Mudar o acesso depois não alarga uma chave já gravada. O segredo vai só na resposta 201. Listar, trocar acessos e revogar não devolvem segredo.

A chamada de negócio manda `Authorization: Bearer sk_...` e `x-tenant` igual ao da chave. O authorizer não chama o Cognito. Calcula o SHA-256, lê o registro e confere empresa e rota. O cache do authorizer continua 0, para a revogação valer na chamada seguinte.

## Contrato

Base `/platform-admin`.

`GET /admin/service-keys/route-groups` devolve os grupos da referência publicada. Cada item traz `slug`, `title` e `routes` com `method` e `path`. Entram as rotas que exigem sessão nas APIs de negócio. Ficam de fora a rota pública, o console do ATO e o admin da plataforma.

`GET /admin/service-keys/accesses` e `GET /admin/service-keys/catalog` devolvem os acessos gravados, no mesmo formato:

```json
{
  "items": [
    {
      "id": "identificador-gerado",
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

`POST /admin/service-keys/accesses` e `PATCH /admin/service-keys/accesses/{id}` recebem `{ "name", "routes" }`. O nome vai até 80 caracteres. Cada rota precisa existir na referência. Rota desconhecida: 400. `DELETE /admin/service-keys/accesses/{id}` apaga o acesso. A chave que já copiou as rotas continua com elas.

`GET /admin/service-keys` devolve a lista sem `secret` e sem `secretHash`. Cada item traz `id`, `name`, `tenant`, `routes`, `enabled`, `createdAt`, `createdBy` e `revokedAt` quando houver.

`POST /admin/service-keys` recebe `{ "name", "tenant", "catalogIds" }`. `catalogIds` são os ids dos acessos gravados. Nome até 80 caracteres. Tenant no padrão `[a-z0-9-]+` e existente. Sem `catalogIds`, acesso desconhecido ou tenant inexistente: 400. Resposta 201 com a chave da lista mais `secret` uma única vez.

`PATCH /admin/service-keys/{id}` recebe `{ "catalogIds" }` e troca as rotas de uma chave ligada. Chave revogada: 409.

`POST /admin/service-keys/{id}/revoke` desliga. A resposta não traz segredo. Chamar de novo em chave já revogada devolve a mesma linha.

Segredo: prefixo `sk_` mais 32 bytes em base64url.

## Dados

A tabela da chave é do platform-admin. A tabela do acesso também. Imóvel, calendário e ATO não as leem. O authorizer só faz `GetItem` na tabela da chave, pela chave do hash. Não lê a tabela do acesso.

O registro da chave tem `id` gerado pelo servidor, `name`, `tenant`, `routes` copiadas dos acessos, `secretHash` em hex, `enabled`, `createdAt`, `createdBy` e `revokedAt` quando houver. O texto puro não é gravado. O acesso guarda `id`, `name` e a cópia das rotas marcadas.

## Authorizer

Vale para o authorizer da API principal e para o authorizer de sessão das outras APIs de negócio. Se o Bearer começa com `sk_`:

1. Não chama o Cognito.
2. Sem registro, revogada ou desligada: 401.
3. `x-tenant` ausente ou diferente do `tenant` da chave: 401.
4. Método e caminho fora da lista: 401. `{id}` casa um segmento não vazio. A query não entra na permissão.
5. Casou: autoriza com o `tenant` da chave, `tenantSource` `session`, `sub` igual ao `id`, `username` `service-key` e grupos vazios. Não passa na conferência de papel.

`GET /contracts`, `POST /properties` e `DELETE` de evento ficam de fora da primeira chave. Um access token de pessoa segue o fluxo de hoje.

## Riscos

O hash permite achar a chave sem varrer a tabela. Quem tiver o segredo chama até a revogação. O segredo não volta na lista para não ficar na tela depois do diálogo de criação.
