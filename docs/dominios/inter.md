# Inter

Conector do Banco Inter para saldo e extrato. Publica evento financeiro para o domínio [Bank](bank.md). Não é o modelo de conta: é a integração.

## Fluxos

Leitura síncrona de saldo, extrato e extrato detalhado. Publicação assíncrona na fila de eventos bancários. Uma regra do EventBridge pode agendar a coleta quando o aplicativo da API a configura.

Credenciais ficam no Secrets Manager. Token e corpo do extrato não entram em log. Rotas passam pelo authorizer.

A stack nasce com o aplicativo da API. Handlers: saldo, extrato e extrato detalhado. No local, a API do banco é mockada.
