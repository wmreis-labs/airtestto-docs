# Modelo de dados

A persistência principal é DynamoDB, uma tabela por domínio, em pay-per-request. Arquivo fica em S3.

## Chaves e índices

A chave composta `PK` / `SK` usa prefixo de entidade, por exemplo `PROPERTY#<id>` e `DETAILS`, quando vários tipos convivem na mesma coleção. Tabela dedicada pode usar `PK` igual ao id e `SK` opcional, como `METADATA` ou um timestamp de histórico.

GSI nasce de uma consulta conhecida e o nome diz a intenção, no padrão `<atributo>Index`. Exemplos: hierarquia de imóvel por `ParentPropertyIdIndex`, evento de auditoria por tipo e data. Índice genérico sem caso de uso não entra.

Dado temporário, como sessão, token ou evento já processado, usa atributo `ttl` em epoch segundos.

## Migração

Script de migração é reexecutável: upsert condicional e verificação de versão. Item que muda de forma ganha `schemaVersion`. A leitura convive com as duas versões enquanto a migração anda.

Backfill corre em lote, com paginação, e manda falha para DLQ. Em quebra de formato, a escrita dupla permanece até o corte. Antes de remover campo antigo, é preciso conseguir reprocessar a fonte ou restaurar backup.

## Retenção

Dado pessoal segue minimização e expurgo quando a finalidade acaba. O critério de log está em [Logs e PII](../arquitetura/adr/logs-e-pii.md).

Tabela crítica liga Point-in-Time Recovery. Bucket relevante liga versionamento e lifecycle. RPO e RTO acompanham os [requisitos não funcionais](../arquitetura/requisitos-nao-funcionais.md).
