# Flipping

Análise de oportunidade de compra e revenda de imóvel, com apoio de modelo e cálculo de viabilidade no backend.

## Rotas oficiais

O contrato congelado usa `flipping-project` e o parse de oportunidade. O detalhe de campos, fórmulas e status está em [Contrato de flipping](../flipping/contrato.md).

Atualização do projeto não aceita mais a lista `deals` embutida. Deal tem API própria em `/flipping/deals/*`. Com a trava ligada, que é o padrão, um payload com `deals` no update do projeto volta o erro `embedded_deals_forbidden`.

## Cálculo

`POST` e `PUT` recalculam `feasibility.results` no backend. Resultado enviado pelo cliente é ignorado. `GET` e listagem devolvem o shape canônico. Registro antigo sem modalidade de compra é tratado como pagamento à vista. A primeira atualização persiste o formato novo. O mapa de campos legados está em [Migração](../flipping/migracao-legado.md).

O score de investimento distingue pagamento à vista e financiado. No financiado entram retorno sobre capital próprio e penalidades de custo do financiamento e de quitação na saída.

## Recursos

Tabelas de oportunidade, publicação opcional em Message e artefato eventual em S3. Rotas passam pelo authorizer. O pacote tem Jest. O contexto local usa `isLocal` e `assetStorageMode`.
