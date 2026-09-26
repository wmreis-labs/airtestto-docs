# PDV

Ponto de venda: catálogo projetado, pedidos e sessão de caixa, em sincronia com Sales e Product.

## Fluxos

- Catálogo: snapshot e projeção a partir de produto e venda.
- Pedidos: sincronização em lote, status e resolução.
- Caixa: abrir, fechar e consultar a sessão atual.

A tabela do PDV guarda catálogo projetado, pedido e sessão. Consumidores escutam eventos de catálogo e pedido via Message. Dado de pagamento e de sessão não entra em log.

O deploy isolado usa `packages/pdv/bin/pdv.ts`.
