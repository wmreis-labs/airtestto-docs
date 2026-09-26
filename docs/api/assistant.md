# Assistant

API de conversa do assistente do Hostto. O backend não inventa dado: se falta informação, pede só o mínimo. A resposta de negócio vem no envelope padrão.

Base path `assistant`:

- `POST /assistant/message`
- `POST /assistant/confirm`

## Autenticação

JWT do Cognito no header `Authorization`. O tenant vai em `x-tenant`. `X-Operation-Id` é opcional; se o cliente não enviar, o backend gera.

A resposta pode trazer `x-session-id`, para continuar a conversa, e `x-correlation-id`.

## Envelope

Sucesso:

```json
{
  "success": true,
  "data": {}
}
```

Erro:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "texto",
    "details": {},
    "correlationId": "..."
  }
}
```

Códigos de erro: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`.

## AssistantResponse

```json
{
  "intent": "availability_check",
  "confidence": 0.95,
  "needs_confirmation": false,
  "missing_fields": [],
  "entities": {
    "property_name": null,
    "start_date": null,
    "end_date": null,
    "reference_date": null,
    "cpf": null,
    "title": null,
    "event_type": null
  },
  "message": "texto curto para a interface",
  "backend_action": {
    "tool": "check_property_availability",
    "payload": {}
  }
}
```

`intent` é uma de: `availability_check`, `average_rent_check`, `create_schedule`, `person_cpf_lookup`, `unknown`.

`confidence` vai de 0 a 1. `entities.cpf` chega mascarado, no formato `***.***.***-09`. O cliente exibe a mensagem e as entidades mascaradas. Não exibe documento completo.

## Mensagem

`POST /assistant/message`

```json
{
  "session_id": "opcional",
  "message": "obrigatória"
}
```

Se `missing_fields` vier preenchido, a próxima fala do usuário volta neste mesmo endpoint, com o `session_id`.

## Confirmação

`POST /assistant/confirm` vale para mutação. No MVP, a mutação é `create_schedule`.

```json
{
  "session_id": "obrigatória",
  "action_id": "obrigatória",
  "confirmation": "sim"
}
```

`confirmation` aceita `sim`, `nao` ou `não`. Confirmação repetida da mesma ação devolve o mesmo resultado.

Aceita, o `backend_action.payload` traz `status: EXECUTED` e um deeplink. Recusada, traz `status: CANCELED` e a mensagem de cancelamento. No MVP o backend não cria o evento: a tela de calendário faz o salvamento final.

## Intenções e ferramentas

| Intent | Ferramenta |
| --- | --- |
| `availability_check` | `check_property_availability` |
| `average_rent_check` | `get_average_rent` |
| `person_cpf_lookup` | `find_person_by_cpf` |
| `create_schedule` | `create_calendar_event` |

Datas de referência aceitam `YYYY-MM`, `YYYY-MM-DD` e texto em português, como `maio de 2026` ou `12 de maio de 2026`. O backend normaliza. `create_schedule` exige `reference_date` ou `start_date`.

Quando a referência é um mês, a disponibilidade inclui `freeDates` e `occupiedDates` em `YYYY-MM-DD`, dentro do resultado da ação.

Consulta com confiança baixa cai em `unknown`. Confiança média pode pedir sim ou não na própria conversa, sem usar `/assistant/confirm`. Mutação sempre cria `action_id` e exige esse endpoint.

## Deeplink

```json
{
  "route": "/calendar",
  "query": {
    "propertyId": null,
    "date": "YYYY-MM-DD",
    "openQuick": "1",
    "title": "Novo agendamento",
    "eventType": "RESERVA",
    "source": "assistant",
    "session_id": "uuid",
    "action_id": "uuid"
  },
  "label": "Abrir calendário"
}
```

A interface monta `route` com a query. `propertyId` pré-seleciona o imóvel. `date` posiciona o calendário. `openQuick=1` abre o formulário rápido com título e tipo. `session_id` e `action_id` servem à trilha e não aparecem para o usuário.

## Modelo

O classificador pode usar um modelo gerenciado quando a função está habilitada no ambiente. Timeout, região e identificador do modelo são configuração do serviço, não contrato do cliente.
