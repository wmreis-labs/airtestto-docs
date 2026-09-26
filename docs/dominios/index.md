# Domínios

Cada pasta em `packages/` é um domínio: stack CDK, Lambdas e regra de negócio. A API central compõe as rotas. Bibliotecas sem stack própria aparecem no fim da tabela.

| Domínio | Papel |
| --- | --- |
| [API](api.md) | Gateway e authorizer |
| [Auth](auth.md) | Cognito e grupos |
| [Tenant](tenant.md) | Cadastro de tenants |
| [Property](property.md) | Imóveis e arquivos |
| [Person](person.md) | Pessoas |
| [Contract](contract.md) | Contratos, PDF e assinatura |
| [Calendar](calendar.md) | Agendas e eventos |
| [Product](product.md) | Catálogo, preço e estoque |
| [Sales](sales.md) | Carrinho, pedido e pagamento |
| [PDV](pdv.md) | Ponto de venda |
| [Delivery](delivery.md) | Entrega |
| [Storage](storage.md) | Arquivo genérico |
| [Message](message.md) | SNS e SQS |
| [Audit](audit.md) | Trilha de auditoria |
| [Flipping](flipping.md) | Oportunidade de imóvel |
| [Budget](budget.md) | Orçamento de obra por imóvel |
| [Bank](bank.md) | Ingestão bancária normalizada |
| [Inter](inter.md) | Conector do Banco Inter |
| [Orchestrator](orchestrator.md) | Fluxos entre domínios |
| [Assistant](assistant.md) | Conversa do assistente |
| [AI](ai.md) | Biblioteca de modelos |
| [Shared](shared.md) | Utilitários comuns |

Isolamento de tenant usa a claim `custom:tenant` e a partição das tabelas. O critério de log está em [Logs e PII](../arquitetura/adr/logs-e-pii.md).
