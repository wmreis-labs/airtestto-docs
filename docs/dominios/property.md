# Property

Imóveis e unidades, com arquivos associados e links pré-assinados para envio e download.

## Recursos

Tabela `Properties`, chave `id`, índice `ParentPropertyIdIndex`. Bucket de arquivos do imóvel, com CORS para upload e download. As origens permitidas precisam ser restritas em produção. Publicação em SNS é opcional, quando o tópico de Message é passado ao stack.

## Fluxos

Criar, listar, obter, atualizar e remover imóvel. Enviar e remover arquivo. Gerar URL pré-assinada. Contar e buscar por imóvel pai.

Rotas passam pelo authorizer. O deploy isolado usa `packages/property/bin/property.ts`.
