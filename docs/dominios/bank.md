# Bank

Ingestão de eventos bancários de mais de um provedor, com normalização de transação e saldo. O domínio não chama o banco. Quem integra publica na fila; Bank consome.

## Evento

A fila `bank-events-queue` recebe mensagem neste formato:

```json
{
  "eventId": "uuid",
  "eventType": "TRANSACTIONS_CAPTURED",
  "bankProvider": "INTER",
  "occurredAt": "2026-03-05T10:00:00Z",
  "payload": {
    "accountId": "123456",
    "transactions": []
  }
}
```

## Peças

Consumidor da fila, contrato do evento, entidade normalizada, mapper por provedor, repositório, serviço de ingestão, tipos e stack com a fila e a Lambda. O conector do Inter está em [Inter](inter.md).
