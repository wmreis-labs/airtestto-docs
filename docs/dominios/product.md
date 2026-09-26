# Product

Catálogo de categorias, produtos e variações, com estoque básico. Alimenta Sales e PDV.

## Preço

`POST /product/prices/resolve` escolhe o preço nesta ordem:

1. variação e cliente
2. variação
3. produto e cliente
4. produto
5. preço da variação
6. preço padrão do produto

`validFrom` e `validTo` são inclusivos e avaliados em UTC.

Há também resolução interna entre serviços, usada por Sales, autenticada à parte da sessão do usuário e com o tenant no cabeçalho da chamada. A regra de escolha do preço é a mesma.

## Fluxos

CRUD de categoria, produto e variação. Estoque e backfill para o PDV. A tabela tem índices por categoria e produto. Rotas de usuário passam pelo authorizer.

O deploy isolado usa `packages/product/bin/product.ts`.
