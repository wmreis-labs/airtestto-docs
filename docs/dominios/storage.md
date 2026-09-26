# Storage

Arquivo genérico, com URL pré-assinada e metadado ligado a uma referência de negócio. Imóvel usa o bucket de Property; este domínio cobre o caso geral.

## Fluxos

Gerar URL de upload ou download, com expiração curta. Confirmar o upload e gravar o metadado. Buscar arquivo por id ou por referência. Publicar evento depois da confirmação é opcional, via Message.

Bucket e tabela de metadados ficam no stack. Rotas de usuário passam pelo authorizer, salvo endpoint público declarado. Nome de arquivo sensível não entra em log.

O deploy isolado usa `packages/storage/bin/storage.ts`.
