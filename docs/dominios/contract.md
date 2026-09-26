# Contract

Contratos e templates: criação, atualização, pré-visualização, PDF e distribuição. Inclui assinatura eletrônica por webhook e envio por canal, como WhatsApp, quando configurado.

## Recursos

Tabelas de contrato, template, preview e evento de webhook. PDF e artefato ficam em S3, no bucket recebido da API ou do orchestrator. Evento de assinatura pode seguir para Message.

## Segurança

Rotas de usuário passam pelo authorizer. Webhook público valida o próprio token de assinatura e, quando possível, restringe origem e taxa. Conteúdo de contrato e PII não entram em log.

O deploy isolado usa `packages/contract/bin/contract.ts`. Provedor externo de assinatura é mockado no ambiente local.
