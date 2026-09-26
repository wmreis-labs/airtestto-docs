# Visão de negócio

Operadores de locação e venda gerenciam imóvel, pessoa, contrato e entrega no mesmo fluxo, com trilha e automação. O ciclo que o sistema encurta vai da captação do imóvel à assinatura e à entrega.

## Personas

| Quem | O que faz |
| --- | --- |
| Atendimento | Cadastra imóvel e pessoa, gera proposta e contrato, acompanha status |
| Operação | Configura tenant, permissão, preço e revisa auditoria |
| Financeiro | Acompanha pedido, venda e conciliação |
| Campo | Recebe ordem de entrega, atualiza status e registra evidência |
| Parceiro | Consome catálogo, pedido e webhook |

## Valor por área

- API única, com authorizer e versão estável.
- Auth multi-tenant por grupo e perfil.
- Imóvel e arquivo com URL pré-assinada.
- Pessoa ligada a contrato e pedido.
- Catálogo, carrinho, pedido e pagamento, com evento para entrega e auditoria.
- Entrega e confirmação de recebimento.
- Template, PDF e webhook de assinatura.
- Agenda de vistoria e entrega.
- Orquestração entre esses domínios.
- Mensagem e auditoria assíncronas.

## Indicadores

Adoção: tenants ativos, usuários ativos por dia, imóveis ativos, contratos gerados por semana.

Operação: tempo de cadastro até contrato e entrega, SLA de entrega, reprocesso, erro e consumo de DLQ.

Receita: conversão de proposta em contrato, receita por pedido, churn de tenant e receita média por tenant.

## Premissas

Isolamento lógico por `custom:tenant` e pela partição das tabelas. Serverless na região `sa-east-1`. Integração externa por API e webhook. Custo desenhado para pagamento por uso.

## Riscos

Quebra de contrato para parceiro é mitigada por versionamento e nota de release. Vazamento de PII é mitigado por log mascarado e revisão de permissão. Dependência de uma região é mitigada por backup e PITR. Atraso de entrega por falha de orquestração é mitigado por DLQ monitorada e alarme.
