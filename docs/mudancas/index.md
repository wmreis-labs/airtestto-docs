# Mudanças

Este é o lugar para decidir antes de implementar. Uma IA que for alterar o sistema lê o índice da prateleira correspondente e os registros aceitos daquele assunto. O código privado não é a fonte da decisão: o registro publicado aqui é.

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

Doze ADRs estão na prateleira, incluindo os três do caixa pessoal e profissional. Os design docs catalogam eventos CQRS, flipping e o desenho do cashbook e do módulo no admin. Não há RFC: o caixa já chegou com as alternativas fechadas. O primeiro PRD é o [caixa pessoal e profissional](prd/2026-09-27-caixa-pessoal-profissional.md). A [visão de negócio](../negocio/visao.md) continua como contexto geral da plataforma.
