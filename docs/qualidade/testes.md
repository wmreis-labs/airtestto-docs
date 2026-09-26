# Testes

A pirâmide é unidade, depois integração, depois ponta a ponta.

## Em cada mudança

- Regra de negócio: teste de unidade do serviço ou do handler.
- Contrato ou rota: teste de integração, ou snapshot da rota, e exemplo no OpenAPI.
- Correção de defeito: teste do caso que quebrou.
- Infra CDK: `cdk synth` no CI.

Fixture fica em `packages/<domínio>/__tests__/fixtures/` quando o pacote já organiza assim. O dado é sintético. Dado real de pessoa não entra em teste. Produção não é fonte de fixture.

## Cobertura

Meta inicial de 70% de linhas e branches nos domínios com Jest. Auth, property, sales e orchestrator buscam 80% conforme amadurecem. Código gerado e infra ficam de fora da meta.

## Comandos

```bash
cd packages/sales
npm test
```

No CI da raiz: `npm test --workspaces --if-present` e `npm run build`. `cdk synth` entra quando a mudança altera stack.
