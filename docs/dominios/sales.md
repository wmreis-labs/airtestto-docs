# Sales

Carrinho, checkout, pedidos e pagamentos. Integra Delivery e Message.

## Carrinho e interpretação

O carrinho cria, altera e remove itens, aplica desconto e ajusta a entrega.

`POST /sales/cart/interpret` recebe o cliente e o texto do pedido, junta catálogo e preços de Product e devolve um preview pronto ou uma lista do que falta confirmar. Cada interpretação guarda um snapshot temporário para o passo seguinte.

`POST /sales/cart/interpret/confirm` recebe o cliente, o identificador de correlação e as seleções. Revalida catálogo e preço e devolve o pedido pronto ou um novo pedido de confirmação.

O apoio de modelo tem três modos: desligado, sombra e ligado. Desligado usa só a regra determinística. Sombra mede o acordo do modelo e não muda a decisão. Ligado aplica a sugestão acima do limiar de confiança e volta à regra determinística se o modelo falhar ou o formato vier inválido. O modo pode ser limitado por tenant.

## Pedido e pagamento

O checkout cria o pedido e publica evento para entrega e mensageria. Pagamento entra, sai e é finalizado nos handlers do carrinho.

Tabelas de pedido, contador e carrinho. Dado de pagamento não entra em log. A separação entre leitura operacional e agregação analítica está em [CQRS e Athena](../mudancas/adr/cqrs-athena-orders.md).

O pacote tem Jest. O deploy isolado usa `packages/sales/bin/sales.ts`.
