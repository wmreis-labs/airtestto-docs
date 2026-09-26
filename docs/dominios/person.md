# Person

Cadastro de pessoas, vínculos com contrato e pedido, e operação em lote por tenant.

## Fluxos

Criação e atualização unitária e em lote. Garantia de uma pessoa genérica por tenant. Backfill quando o PDV precisa da pessoa. Evento de criação ou atualização pode ir ao tópico de Message.

A tabela é injetada pelo aplicativo da API e pode ter índice por tenant ou e-mail. Dado pessoal não entra em log. Rotas passam pelo authorizer.
