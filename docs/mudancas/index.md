# Mudanças

Este é o lugar das decisões que mudam só o backend. Demanda que também obriga um front fica no [wmreis-docs](https://wmreis-labs.github.io/wmreis-docs/mudancas/). Uma IA que for alterar o serviço lê o índice da prateleira correspondente e os registros aceitos daquele assunto. O código privado não é a fonte da decisão: o registro publicado é.

Cada mudança usa um tipo só. Se a pergunta ainda está aberta, é uma RFC. Se a escolha já foi feita, é um ADR. Se o texto descreve como a solução funciona, é um design doc. Se descreve o problema de produto e o que entra na entrega, é um PRD.

| Tipo | Pergunta que responde | Quando escrever |
| --- | --- | --- |
| [RFC](rfc/index.md) | O que estamos propondo, e quais alternativas existem? | Antes de fechar a decisão, quando há mais de um caminho |
| [ADR](adr/index.md) | O que foi decidido, e por quê? | Quando a escolha fica vigente e não deve ser reaberta sem um registro novo |
| [Design doc](design/index.md) | Como a solução funciona? | Quando a decisão precisa de fluxo, contrato, dado ou sequência |
| [PRD](prd/index.md) | Qual problema de produto vamos resolver, e o que fica de fora? | Quando a mudança nasce de uma necessidade de usuário ou de negócio |

## Ordem de leitura para uma mudança nova

1. Procurar nesta seção um registro do mesmo assunto.
2. Se a decisão vigente contradiz a mudança, a mudança espera um ADR novo que substitua o anterior.
3. RFC aceita vira ADR. ADR que precisa de detalhe aponta para um design doc. PRD aprovado aponta para a RFC ou o ADR que o implementa.

## O que já existe

Oito ADRs valem só para o backend: stack, versionamento, logs, CQRS e os contratos do PDV. O design doc do cashbook descreve o serviço da fase 1: três livros, tipos do importador, upload lido no `bank` e classificação no `cashbook`. A demanda que também muda o admin está no [ADR da fase 1](https://wmreis-labs.github.io/wmreis-docs/mudancas/adr/2026-09-27-fase-1-caixa/). O desenho da tela está no [admin-docs](https://wmreis-labs.github.io/admin-docs/mudancas/design/2026-09-27-caixa-admin/). A [visão de negócio](../negocio/visao.md) continua como contexto geral da plataforma.
