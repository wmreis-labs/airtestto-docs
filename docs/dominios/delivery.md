# Delivery

Planejamento e execução da entrega. Recebe o pedido pronto e atualiza status e logística.

## Fluxos

O evento de pedido pronto cria ou atualiza o planning. Pela API dá para criar, listar, atualizar, confirmar, iniciar e atribuir a entrega. A atualização segue para os consumidores de Message.

A tabela está no stack do domínio. Filas e tópicos vêm do aplicativo da API. Rotas passam pelo authorizer. O consumidor de fila tem permissão mínima. Dado sensível da entrega não entra em log.

Métricas úteis: entregas criadas, SLA, falha de atribuição ou início, e profundidade da DLQ.
