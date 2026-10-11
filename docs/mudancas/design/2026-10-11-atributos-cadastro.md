# Design: atributos do cadastro

**Status:** vigente
**Data:** 2026-10-11

## Objetivo

O cadastro grava no usuário do Cognito o que a tela já coleta: nome, telefone e documento, além do e-mail e do tenant.

## Fora deste desenho

Confirmação de e-mail, grupos, pessoa e permissão não mudam. Usuário já existente não é regravado.

## Fluxo

A tela envia o cadastro. O serviço valida telefone e documento, cria o usuário e grava os atributos. Telefone vazio não cria `phone_number`.

## Contrato

| Atributo | Origem | Regra |
| --- | --- | --- |
| `email` | e-mail | obrigatório, como já era |
| `custom:tenant` | header `x-tenant` | obrigatório, como já era |
| `name` | nome | gravado quando vem preenchido |
| `phone_number` | telefone | E.164. Número brasileiro sem país recebe `+55` |
| `custom:document` | documento | só dígitos, 11 (CPF) ou 14 (CNPJ) |

Telefone que não vira E.164, ou documento com outro tamanho, responde erro de validação e não cria o usuário.

## Dados

O User Pool já tem o atributo `document`, mutável, sem limite de tamanho. A checagem de 11 ou 14 dígitos fica no cadastro. `name` e `phone_number` já são atributos padrão. `sub` continua gerado pelo Cognito.

## Riscos

Atributo customizado não sai do User Pool depois de criado, e o tamanho dele não muda. O efeito só aparece depois do deploy do stack de auth.
