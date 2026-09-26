# API

Gateway REST que compõe as rotas dos domínios e aplica o authorizer do Cognito.

## Onde vive

- Composição: `packages/api/bin/api.ts`, que instancia tabelas, filas, buckets e o API Gateway.
- Rotas por domínio: `packages/api/cdk/*-api-stack.ts`.
- Authorizer: valida o access token do Cognito, consulta o usuário e injeta username, e-mail, tenant e `sub` no contexto da Lambda.

## Fluxo

Cliente, API Gateway, authorizer, Lambda do domínio. Rotas seguem versionamento por path, descrito em [Versionamento da API](../mudancas/adr/versionamento-api.md).

## Segurança

O cliente envia `Authorization: Bearer` com o access token. Rota pública, como health check, entra numa allowlist explícita e não alcança dado de negócio.

## Deploy

Na raiz, `npm run deploy:api`. O contexto de ambiente é `env=dev|staging|prod`. No local, `./scripts/start-local.sh`.
