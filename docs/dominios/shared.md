# Shared

Biblioteca comum: erro HTTP, validação, resposta JSON, paginação, publicação de auditoria, middleware de tenant e clientes de DynamoDB, S3 e filas. Não provisiona recurso e não expõe API.

Quem chama recebe credencial pela role, sem segredo no código. As bibliotecas de log e de resposta seguem a decisão de não registrar PII e propagam `traceId` quando ele existe.

O build da raiz compila as referências. Testes prioritários: validadores, publicador de auditoria e verificação de assinatura.
