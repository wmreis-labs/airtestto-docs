# Contratos de evento

Estes contratos valem para `SalesOrder`, `Delivery` e `AuditEvents`. A decisão que os torna obrigatórios está na [fundação de eventos](../mudancas/adr/cqrs-eventos-fase1.md).

## Envelope

```json
{
  "eventId": "f8d91d22-0f8e-4d58-8cb5-3e9c8f5a5e2f",
  "eventType": "OrderCreated",
  "eventVersion": "v1",
  "tenant": "tenant-a",
  "occurredAt": "2026-04-05T15:33:12.123Z",
  "correlationId": "req-7cf6f2b6",
  "payload": {}
}
```

- `eventId` é único para cada evento publicado.
- `occurredAt` está em UTC, ISO-8601.
- `correlationId` atravessa o fluxo.
- `payload` não carrega PII além do necessário.

## Nomes

O tipo segue `<Entidade><Ação no passado>`.

| Domínio | Exemplos |
| --- | --- |
| SalesOrder | `OrderCreated`, `OrderStatusChanged`, `OrderItemProgressUpdated` |
| Delivery | `DeliveryAssigned`, `DeliveryInRoute`, `DeliveryDelivered` |
| AuditEvents | `AuditEventCaptured` |

A versão inicial é `v1`. Campo opcional novo no payload permanece em `v1`. Mudança incompatível cria `v2` e o consumidor convive com as duas durante a transição. Um nome de tipo não muda de significado.

## Idempotência

A chave é `eventId`. O projetor consulta se o identificador já foi aplicado. Se já foi, ignora com sucesso. Se não foi, aplica a projeção e registra o identificador. A operação precisa ser segura contra duplicidade.

## Falha e reprocessamento

Falha transitória usa retry com backoff exponencial e jitter. Falha permanente, depois das tentativas, vai para a DLQ com a mensagem original, o erro, o instante da falha e o contexto `tenant`, `eventType` e `eventId`.

Reprocessamento filtra domínio, tenant, intervalo de tempo e, se preciso, `eventType`. Não há replay em massa sem janela. Em produção a janela é curta e a monitoração fica ativa.

## Checklist de desenvolvimento

1. Publicar um evento válido e confirmar o consumo.
2. Reenviar o mesmo `eventId` e confirmar que o estado não muda de novo.
3. Forçar falha no consumidor e ver a mensagem na DLQ.
4. Reprocessar um lote pequeno e confirmar a recuperação.
