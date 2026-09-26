# Setup do backend

O airtestto é um monorepo TypeScript. Cada domínio vive em `packages/*` e leva a própria infraestrutura CDK, as Lambdas e as regras de negócio.

## Pré-requisitos

- Node.js e npm
- Docker e Docker Compose
- AWS CLI, `jq` e `cdklocal`

## Subir o ambiente local

```bash
npm install
npm run build
./scripts/start-local.sh
```

O script local cobre sobretudo autenticação e a configuração da API nesse cenário. O LocalStack sobe pelo `docker-compose.yml` da raiz. A composição dos stacks começa em `packages/api/bin/api.ts`.

## Deploy local de um pacote

```bash
cdklocal deploy \
  --app "npx ts-node packages/<nome>/bin/<nome>.ts" \
  --require-approval never \
  --context isLocal=true \
  --context assetStorageMode=local
```

Contextos usados com frequência: `isLocal`, `assetStorageMode` e `stage` ou `env`.

## Desenvolvimento

```bash
npm install
npm run build
```

Para validar um pacote que tenha script próprio, rode `npm run build` dentro de `packages/<nome>`.

Pacotes com Jest, como `ai`, `flipping` e `sales`, guardam testes em `__tests__`.

```bash
cd packages/sales
npm test
```

## Ordem ao alterar um domínio

1. Atualize o código em `packages/<domínio>`.
2. Ajuste o stack em `packages/<domínio>/cdk`.
3. Se a rota passa pela API central, ajuste `packages/api`.
4. Rode `npm run build` na raiz.
5. Faça o deploy local e valide os endpoints no LocalStack.

A licença registrada no repositório do backend é MIT.
