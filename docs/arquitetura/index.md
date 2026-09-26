# Arquitetura do sistema

O airtestto é serverless por domínio, descrito em AWS CDK. A chamada síncrona entra pelo API Gateway. O trabalho assíncrono segue por SNS, SQS e regras do EventBridge. Um exemplo é a sincronização de calendários a cada uma hora.

## Visão lógica

Os componentes de plataforma são API Gateway, Lambdas por domínio, Cognito, DynamoDB, S3, SNS e SQS. O mapa de cada pacote está em [Domínios](../dominios/index.md).

## Limites e dependências

- A API integra os domínios e aplica o authorizer de Auth.
- Sales depende de Product para itens e preços, e de Delivery para a entrega do pedido.
- Delivery consome eventos de Sales e publica em Message.
- Property e Storage usam S3 e podem publicar eventos via Message.
- Contract usa pessoa, imóvel, template e arquivos.
- Orchestrator combina Contract, Person, Property, Delivery e Sales, e publica ou consome tópicos de Message quando isso está configurado.

## Disponibilidade

- Região padrão: `sa-east-1`.
- Filas: SNS para SQS, com DLQ. O handler precisa ser idempotente.
- EventBridge usa os retries gerenciados da regra.
- A maior parte das Lambdas tem timeout de 30 segundos. Chamadas externas usam retry com backoff.
- DynamoDB em pay-per-request. Tabelas que precisam de outra consulta ganham um GSI com caso de uso definido.

## Segurança e operação

Autenticação é Cognito User Pool e Client. Autorização usa grupos e a claim `custom:tenant`. Dados em repouso seguem a criptografia padrão da AWS. Logs não carregam PII; o critério está na [decisão de logs](adr/logs-e-pii.md).

Ambientes previstos: local com LocalStack, stage e produção. O deploy é um stack CDK por domínio, conforme a [decisão de stack](adr/stack-por-dominio.md).

## Observabilidade

Logs estruturados no CloudWatch, métricas técnicas e de negócio, e X-Ray nas rotas críticas. O formato dos campos está nos [requisitos não funcionais](requisitos-nao-funcionais.md).
