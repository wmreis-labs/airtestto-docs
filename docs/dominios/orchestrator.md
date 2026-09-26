# Orchestrator

Casos que cruzam domínio: contrato com PDF, sincronização de calendários, validação de tenant e planning de entrega.

## Fluxos

- Gerar contrato e PDF, usando contrato, pessoa, imóvel, template e arquivo.
- Sincronizar calendários por regra do EventBridge, a cada uma hora.
- Validar o tenant antes da operação.
- Criar planning com entregas, pedidos e contadores, e publicar no tópico de Message quando ele é informado.

As tabelas e o bucket chegam por propriedade, a partir do aplicativo da API. Não há bin isolado: o deploy acompanha o deploy da API. Payload de contrato e de pessoa não entra em log. X-Ray segue a decisão de observabilidade.
