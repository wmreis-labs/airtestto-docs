# Stack CDK por domínio

**Status:** aceita em 2026-03-25.

## Contexto

O monorepo tem vários domínios em `packages/*`. Cada um traz infraestrutura própria, como DynamoDB, S3, SNS ou SQS, e as próprias Lambdas. O deploy precisa isolar o raio de uma mudança.

## Decisão

Cada domínio mantém um stack em `packages/<domínio>/cdk`, com entrypoint em `packages/<domínio>/bin`. A API central fica em `packages/api` e integra as rotas com permissão explícita para a Lambda do domínio. Contextos padrão: `isLocal`, `assetStorageMode` e `stage`.

## Consequências

Deploys podem correr em paralelo, com menos risco cruzado. A permissão de cada stack fica visível. O número de stacks e artefatos aumenta.

## Alternativas

Stack único foi rejeitado pelo acoplamento e pelo tempo de deploy. Stacks por camada (API, dados, assíncrono) foram rejeitados porque dispersam a responsabilidade do domínio.
