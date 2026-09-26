# Hostto

Painel para gestão de aluguel de curta e longa duração: reserva, contrato, recebimento e alerta.

## Stack

React, Redux Toolkit, Vite, TypeScript, Material UI e Cognito.

## O que a interface cobre

- Entrada, cadastro e confirmação de conta.
- Resumo de reserva, contrato e pagamento.
- Tabela das últimas reservas.
- Alerta de vencimento e inadimplência.
- Tema escuro e painel responsivo.

A organização do código separa `components`, `pages`, `hooks`, `services`, `schemas`, `types` e `utils`. Chamada HTTP fica em `services`. Estado global usa Redux Toolkit; estado de tela fica no hook. Formulário valida o schema antes do envio. Posição de assinatura em PDF é persistida com trilha mínima de quem assinou e quando.

## Desenvolvimento

```bash
npm install
npm run dev
npm run build
npm run lint
```

Testes iniciais cobrem a aplicação. Fluxos críticos para evoluir a suíte: assinatura, contrato e login. Build de produção vai para hospedagem estática. Segredo de pipeline fica no cofre do repositório, não neste portal.

O backend correspondente está em [Domínios](../dominios/index.md), em especial Property, Contract, Calendar e Sales.
