# Auth

Autenticação no Cognito e administração de usuários e grupos para o acesso multi-tenant.

## Fluxos

Cadastro, confirmação, entrada, refresh e saída. No administrativo: listar usuários, listar grupos de um usuário, incluir ou remover usuário de grupo, listar grupos com seus usuários.

A política de senha exige no mínimo 8 caracteres, com minúscula, maiúscula e dígito, e confirmação de e-mail. A claim `custom:tenant` carrega o tenant. O cadastro também grava nome, telefone e documento nos atributos do usuário, no desenho [atributos do cadastro](../mudancas/design/2026-10-11-atributos-cadastro.md). Tokens de acesso duram 12 horas; o refresh dura 30 dias.

## Recursos

User Pool, User Pool Client e Lambdas dos fluxos de autenticação e de grupo. As Lambdas administrativas ficam restritas a esse User Pool. Token e PII não entram em log.

O deploy isolado usa `packages/auth/bin/auth.ts` com o contexto `env`.
