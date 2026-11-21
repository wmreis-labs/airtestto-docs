# Design: domínio de pagamentos (Testto Pay)

**Status:** rascunho
**Data:** 2026-11-21
**ADR:** [Testto Pay, pagamentos como domínio central](https://wmreis-labs.github.io/wmreis-docs/mudancas/adr/2026-11-21-testto-pay-pagamentos/)
**PRD:** [Testto Pay](https://wmreis-labs.github.io/wmreis-docs/mudancas/prd/2026-11-21-testto-pay/)

## Objetivo

O pacote `payments` cria a cobrança por link no provedor, confirma o pagamento pelo aviso conferido e publica o resultado no tópico de mensagens. Ele não conhece reserva nem pedido: cada cobrança carrega a empresa e a origem. O primeiro provedor é o PagBank, pelo checkout hospedado. O primeiro consumidor é a reserva do `calendar`.

Este desenho cobre o corte 1: [airtestto#279](https://github.com/wmreis-labs/airtestto/issues/279), [#280](https://github.com/wmreis-labs/airtestto/issues/280) e [#314](https://github.com/wmreis-labs/airtestto/issues/314).

## Fora deste desenho

- O layout da EDI e a coleta no `bank` ([#282](https://github.com/wmreis-labs/airtestto/issues/282)). O formato real só se conhece na primeira coleta; o desenho entra numa revisão desta página.
- A conciliação ([#283](https://github.com/wmreis-labs/airtestto/issues/283)), pelo mesmo motivo. Aqui só se garante que a cobrança guarda os identificadores do provedor de que ela vai precisar.
- O console, o pool do Testto Pay, a chave de API e os webhooks de saída para sistemas de fora (cortes 2 e 3).
- A tela do Hostto, que fica no [hostto-docs](https://wmreis-labs.github.io/hostto-docs/).
- Pix, boleto, cartão salvo, split e checkout transparente.

## Fluxo

### Gerar o link da reserva

1. O Hostto chama `POST /calendars/{calendarId}/events/{eventId}/charge`. O corpo leva só as opções do link: parcelamento máximo, parcelas sem juros e validade. Não leva valor.
2. O `calendar` lê a reserva da empresa da sessão e calcula o valor em aberto. Reserva sem valor em aberto, cancelada ou de outro tipo recebe 409.
3. O `calendar` invoca a função de criação do `payments` com a empresa, a origem (`hostto`, `reserva`, identificador do evento), o valor, a descrição e as opções.
4. O `payments` procura uma cobrança aberta com a mesma origem e o mesmo valor. Se houver e o link não tiver vencido, devolve a mesma. Se o valor mudou, inativa o checkout antigo no provedor, marca a cobrança antiga como cancelada e segue.
5. O `payments` grava a cobrança como `aberta`, lê o token da empresa no Secrets Manager e cria o checkout no PagBank com o identificador da cobrança como `reference_id`. Guarda o id do checkout e o link de pagamento.
6. O `calendar` grava na reserva o identificador da cobrança, o link, a validade e o estado `aberta`, e devolve isso ao Hostto.

Falha no provedor deixa a cobrança como `falhou` e devolve 502 ao Hostto. Uma nova tentativa cria outra cobrança.

### Confirmar o pagamento

1. O PagBank chama `POST /payments/webhooks/pagbank`, rota pública, sem authorizer.
2. O `payments` lê o `reference_id`, carrega a cobrança e, com ela, a empresa e o token. Aviso sem cobrança conhecida é registrado e respondido com 200, para o provedor não repetir.
3. Confere a autenticidade do aviso com o token da empresa e, em seguida, consulta o pedido no PagBank. O estado gravado é sempre o da consulta, nunca o do corpo do aviso.
4. Registra o aviso na tabela de avisos com chave condicional (pedido, cobrança no provedor e estado). Aviso já registrado termina aqui com 200.
5. Aplica a transição permitida, guarda o id do pedido e da cobrança no provedor, a forma de pagamento, as parcelas e a data do pagamento, e publica o evento.
6. O `calendar` consome `payments.charge.paid` da sua fila, confere a origem, soma o valor pago na reserva e recalcula o valor em aberto, uma vez por `eventId`.

### Expirar

O link vence no provedor. O `payments` não depende do aviso de expiração: a cobrança aberta com validade passada é tratada como `expirada` na leitura e por um job diário, que publica `payments.charge.expired`.

## Contrato

### Função de criação (interna)

Invocada por backends do airtestto com IAM. O token do provedor só é lido pelas funções do `payments`; quem consome nunca recebe permissão no segredo.

Entrada: empresa, origem (sistema, tipo e identificador), valor em centavos, descrição, nome e e-mail do pagador quando houver, parcelamento máximo (1 a 12, padrão 12), parcelas sem juros (0 até o máximo, padrão 0), validade (padrão 7 dias, máximo 30) e `correlationId`.

Saída: identificador da cobrança, estado, link de pagamento e validade. Erros: entrada inválida (400), conta do provedor não configurada para a empresa (412), falha no provedor (502).

A mesma função atende a API pública do corte 3, que só acrescenta a chave de API na frente.

### Rotas HTTP

| Rota | Quem chama | Autorização |
| --- | --- | --- |
| `POST /calendars/{calendarId}/events/{eventId}/charge` | Hostto | Sessão; empresa da sessão (`tenantSource: 'session'`); papéis Admin, Financeiro e Operacional |
| `POST /payments/webhooks/pagbank` | PagBank | Pública; autenticidade conferida e pedido consultado no provedor |
| `GET /payments/charges/{chargeId}` | Hostto e, depois, console | Sessão; empresa da sessão |

A resposta da rota da reserva e da consulta traz identificador, estado, valor, link, validade, parcelas escolhidas e data do pagamento. Não traz dado de cartão; o provedor nunca nos envia o número.

### Estados

`aberta` → `paga` → `estornada`; `aberta` → `expirada`; `aberta` → `cancelada`; `aberta` → `falhou` (só na criação). Tentativa recusada não muda o estado: o link continua valendo e o evento `payments.charge.declined` é publicado. Qualquer outra transição é ignorada e registrada.

### Eventos

Publicados no `MessageTopic` com os atributos `domain = payments` e `type` igual ao tipo do evento, e corpo no [envelope de eventos](../../arquitetura/cqrs-eventos.md): `eventId`, `eventType`, `eventVersion` (`v1`), `tenant`, `occurredAt`, `correlationId` e `payload`.

| Tipo | Quando |
| --- | --- |
| `payments.charge.paid` | Pagamento confirmado na consulta ao provedor |
| `payments.charge.declined` | Tentativa recusada; a cobrança continua aberta |
| `payments.charge.expired` | Validade passou sem pagamento |
| `payments.charge.canceled` | Cobrança substituída ou cancelada |
| `payments.charge.refunded` | Estorno ou chargeback confirmado no provedor |

O `payload` leva identificador da cobrança, origem, valor, valor pago, parcelas, forma de pagamento e data do pagamento. Não leva nome nem e-mail do pagador. Cada consumidor assina a fila com filtro de `domain` e `type`; o `calendar` assina `paid`, `expired`, `canceled` e `refunded`.

### PagBank

Criação: `POST /checkouts` com `reference_id` igual ao identificador da cobrança, um item com a descrição e o valor, forma de pagamento cartão de crédito, `INSTALLMENTS_LIMIT` e `INTEREST_FREE_INSTALLMENTS`, `expiration_date`, e a rota de aviso em `notification_urls` e `payment_notification_urls`. O link é o `href` de `rel = PAY`.

Consulta: o pedido pelo id que chega no aviso (`GET /orders/{id}`). Cancelamento: inativar o checkout. Sandbox e produção mudam só a URL base e o token.

O adaptador implementa a porta do provedor (criar, consultar, inativar, conferir aviso). Outro provedor entra como outro adaptador.

## Dados

Tabela `payments-charges`:

| Item | Partição | Ordenação | Para quê |
| --- | --- | --- | --- |
| Cobrança | `CHARGE#<id>` | `META` | Leitura pelo id, inclusive no aviso |
| Índice de lista | `<empresa>#<AAAA-MM>` | `<criadaEm>#<id>` | Lista do console por mês, com cursor |
| Índice de origem | `<empresa>#<sistema>#<tipo>#<id>` | `<criadaEm>` | Cobrança aberta da mesma origem |

A cobrança guarda empresa, origem, valor, descrição, opções, estado, validade, link, provedor, ids do checkout, do pedido e da cobrança no provedor, parcelas, forma de pagamento, datas de criação e de pagamento, e o histórico de transições. Não guarda dado de cartão.

Tabela `payments-notifications`: partição `<provedor>#<pedido>#<cobrança no provedor>#<estado>`, gravada com `attribute_not_exists`, com TTL de 90 dias. É a deduplicação do aviso.

Segredo por empresa: `airtestto/payments/<ambiente>/<empresa>/pagbank`, com o token e o ambiente do provedor (sandbox ou produção). Empresa sem segredo recebe 412 na criação.

A reserva ganha, em `financialInfo`, o bloco da cobrança: identificador, estado, link e validade. Valor pago e valor em aberto continuam onde estão.

## Riscos

- Sem token de sandbox, o adaptador é testado contra um PagBank falso montado com os exemplos da documentação. A conferência de autenticidade do aviso precisa ser revista com o token real antes do deploy.
- A documentação diverge sobre a validade padrão do checkout (2 horas ou sem validade). O `payments` sempre envia `expiration_date`.
- A rota pública de aviso aceita qualquer chamada. A proteção vem da consulta ao provedor: um aviso forjado não muda estado, porque o estado gravado é o da consulta.
- Pagamento de link já substituído pode chegar. A cobrança cancelada que recebe pagamento confirmado vira `paga` e publica o evento; a reserva soma o valor e o excedente aparece no valor em aberto negativo, para o financeiro devolver.
- O provedor pode atrasar ou perder o aviso. A consulta `GET /payments/charges/{chargeId}` sempre confere no provedor quando a cobrança está aberta há mais de 10 minutos.
