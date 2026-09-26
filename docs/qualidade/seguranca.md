# Segurança

Práticas do backend. Este portal não publica segredo, identificador de conta nem procedimento de resposta a incidente.

## Autenticação

Cognito User Pool, grupos e claims. Claims obrigatórias: `sub`, `email` e `custom:tenant`. Grupo representa domínio e papel, por exemplo leitura ou administração de imóvel e de venda. A rota declara se exige leitura ou escrita. O authorizer coloca os grupos no contexto.

Rota pública é allowlist explícita e não alcança dado.

## Segredos

Credencial fica no Secrets Manager. Configuração que não gira fica em parâmetro criptografado. A Lambda acessa com permissão mínima e cache curto em memória. Segredo não entra no código. Rotação automática vale quando o provedor suporta; caso contrário, a rotação é manual e alarmada.

## Dados

PII não entra em log. O critério está em [Logs e PII](../arquitetura/adr/logs-e-pii.md). Repouso criptografado em DynamoDB e S3. Trânsito em HTTPS.

## Superfície

Entrada é validada. Cada Lambda tem role própria, no menor privilégio. API exposta na internet usa WAF com limite por IP e bloqueio de padrão conhecido. O estágio do API Gateway define throttle coerente com o SLO. Evento crítico segue para [Audit](../dominios/audit.md).
