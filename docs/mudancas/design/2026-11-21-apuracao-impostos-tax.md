# Design: apuração de impostos no `tax` e receita do extrato no `financial`

**Status:** em revisão
**Data:** 2026-11-21
**ADR:** [apuração dos impostos dos imóveis por sócio](https://wmreis-labs.github.io/wmreis-docs/mudancas/adr/2026-11-21-apuracao-impostos-imoveis/)
**PRD:** [impostos dos imóveis por sócio](https://wmreis-labs.github.io/wmreis-docs/mudancas/prd/2026-11-21-impostos-imoveis-socios/)

## Objetivo

Este desenho cobre duas peças:

- **Receita no `financial`.** O crédito de aluguel no extrato do Inter vira receita do imóvel no razão.
- **Apuração no `tax`.** O pacote novo lê essa receita e devolve:
    - a base de cálculo;
    - PIS e COFINS de cada mês;
    - IRPJ e CSLL de cada trimestre;
    - a parte de cada sócio;
    - as guias e a conferência delas com o extrato.

O `tax` guarda só regra, fechamento e guia. A receita fica no `financial`. O front mostra o número que a API devolve.

## Fora deste desenho

- **Telas:** a rota `/financial/impostos` e a revisão de recebimentos ficam no design do Hostto.
- **Sócios:** o cadastro dos sócios do imóvel e a rota que lista os donos de um imóvel são entregues no corte dos sócios. Aqui só se usa o que essa rota devolve.
- **Despesas comuns:** a divisão de contabilidade e parcelamento entre os sócios, e a conta do sócio, seguem em aberto no ADR.
- **IRPJ e CSLL em três cotas:** ficam fora até aparecer um caso.
- **Reforma tributária:** os valores de CBS e IBS entram como parâmetro com vigência quando forem conhecidos. Este desenho não os define.
- **Débitos do extrato:** não viram despesa do imóvel neste desenho.

## Fluxo

### Crédito do extrato vira recebimento

1. **Publicação.** O coletor do Inter já publica `TRANSACTIONS_CAPTURED` numa lista de filas: a do `bank` e a do `cashbook`. O `financial` ganha uma terceira fila, a dos eventos do banco.
2. **Filtro.** O consumidor do `financial` descarta:
    - a transação de conta que não alimenta receita;
    - o débito.

    As contas que alimentam receita ficam numa lista por tenant, mantida no `financial`.
3. **Recebimento.** Cada crédito que sobra vira um recebimento. O identificador do recebimento é o mesmo que o `bank` grava para a transação:
    - o identificador do provedor, quando vem;
    - senão, o hash determinístico do `bank`, exportado pelo pacote para os dois lados darem o mesmo valor.

    A gravação é condicional. Evento repetido não duplica recebimento.
4. **Regra.** O recebimento passa pelas regras do tenant, em ordem. A primeira que casa decide:
    - **Aluguel:** cria um lançamento de receita do imóvel e marca o recebimento como `classificado`.
    - **Não é aluguel:** marca o recebimento como `ignorado`, com o motivo da regra. Os motivos são evento, aporte, estorno e devolução de sócio.
5. **Revisão.** O recebimento que nenhuma regra casa fica `pendente`.
    - A pessoa escolhe o imóvel ou ignora.
    - Um crédito pode ser repartido entre imóveis. As partes somam o valor do crédito.
    - A escolha pode virar regra na mesma chamada.
6. **Sugestão de temporada.** Sem regra para o repasse de temporada, a revisão sugere o imóvel pelo calendário. O critério é a reserva com repasse previsto perto da data e do valor. A sugestão não classifica sozinha.

O lançamento criado pelo recebimento tem estes campos:

| Campo | Valor |
| --- | --- |
| `economicUnitType` | `PROPERTY` |
| `entryType` | `REVENUE` |
| `categoryGroup` | `REVENUE` |
| `category` | `MONTHLY_RENT` na locação longa, `DAILY_RATE` na temporada |
| `lifecycleStatus` | `CONFIRMED` |
| `settlementAt` | data do crédito |
| `competenceAt` | o mesmo dia por padrão |
| `sourceType` | `BANK_TRANSACTION`, valor novo do enum |
| `sourceId` | identificador da transação |
| `externalId` | conta do `bank` |

O identificador do lançamento vem do identificador da transação e da ordem da parte. Reprocessar não duplica.

### Competência

- A apuração soma pelo mês de `competenceAt`.
- Para pôr o crédito em outro mês, a pessoa muda `competenceAt` no `PATCH` que já existe. O valor passa a ser o primeiro dia do mês do aluguel.
- Mudar a competência não mexe no recebimento nem na transação.

### Histórico

Créditos gravados no `bank` antes da fila existir entram por reprocessamento:

- Um comando lê a partição da conta no `bank` por faixa de data e passa cada crédito pelo mesmo caminho do consumidor.
- Os meses que a planilha cobre e o extrato não cobre entram como lançamento manual, uma vez.

### Apuração

O `tax` monta cada período assim:

1. **Receita da base.** Lê os lançamentos do `financial` pelo índice de tipo (`REVENUE`) na faixa de competência do período. Fica só o que cumpre as três condições:
    - `economicUnitType` `PROPERTY`;
    - categoria `MONTHLY_RENT`, `DAILY_RATE` ou `EXTRA_FEES`;
    - `lifecycleStatus` `CONFIRMED` ou `RECONCILED`.

    Só entram os imóveis cadastrados na apuração com vigência no período.
2. **Donos.** Lê os donos de cada imóvel no `person`, pelo papel `owner` com `propertyId` e `ownershipPercentage`.
3. **Motor.** Passa a receita, os donos e os parâmetros vigentes ao motor.
4. **Resposta.** Devolve o resultado com as pendências do período:
    - recebimentos pendentes da conta de receita no período;
    - imóveis cuja posse não soma 100%.

A apuração aberta é recalculada a cada consulta.

O fechamento grava a base, os valores, o rateio, os parâmetros usados e a posse usada. O fechamento é recusado nos casos abaixo:

- existe recebimento pendente no período;
- a posse de algum imóvel não soma 100%;
- o trimestre tem um mês com PIS ou COFINS aberto.

Período fechado volta com o valor gravado e com a diferença para o recálculo atual, quando houver. O fechado não muda. Reabrir fica fora até aparecer um caso.

### Motor

O motor é uma função pura. Ela recebe:

- a receita do período por imóvel;
- a posse de cada imóvel;
- os parâmetros do tributo.

Ela não lê banco de dados. Os testes do motor reproduzem cada guia de PIS, COFINS, IRPJ e CSLL paga desde o segundo trimestre de 2025, ao centavo.

| Tributo | Período | Base | Valor |
| --- | --- | --- | --- |
| PIS | mês do calendário | receita do mês | base × alíquota |
| COFINS | mês do calendário | receita do mês | base × alíquota |
| IRPJ | trimestre do calendário | receita do trimestre × presunção | base × alíquota + adicional |
| CSLL | trimestre do calendário | receita do trimestre × presunção | base × alíquota |

- **Adicional do IRPJ:** é a alíquota do adicional sobre a parte da base presumida do trimestre que passa do limite do trimestre. Abaixo do limite, é zero.
- **Arredondamento:** cada tributo arredonda uma vez, no fim, em centavos, meio para cima. Por isso o IRPJ do trimestre é igual à soma das três colunas mensais da planilha.

**Rateio.**

- A fatia do sócio é a soma, em cada imóvel, da receita do imóvel vezes a posse do sócio, dividida pela receita do período.
- A parte do sócio em cada tributo é o tributo vezes a fatia.
- Sem adicional, isso dá o mesmo que aplicar a alíquota à receita do sócio. Com adicional, o adicional segue a mesma fatia.
- As partes são arredondadas pelo maior resto, para a soma bater com o tributo.

### Guias

As guias são previstas no fechamento. O fechamento de um período cria as guias previstas daquele período:

- **mês:** PIS e COFINS;
- **trimestre:** IRPJ e CSLL.

O vencimento é calculado pela regra do parâmetro:

- PIS e COFINS: dia 25 do mês seguinte, ou o dia útil anterior;
- IRPJ e CSLL: último dia útil do mês seguinte ao trimestre.

Cada guia passa por quatro estados:

| Estado | Quando |
| --- | --- |
| `prevista` | Criada pelo fechamento, com o valor apurado. |
| `emitida` | A pessoa informa o código de barras e o valor da guia. Multa e juros são campos próprios. A diferença entre o apurado e o valor da guia aparece na resposta. |
| `paga` | Um débito do extrato com valor e data compatíveis é ligado à guia. |
| `cancelada` | Guia substituída ou emitida por engano. |

A parcela do parcelamento é uma guia sem período de apuração. Ela é criada à mão ou em série com vencimento mensal.

**Conciliação do pagamento.**

- Os candidatos vêm da partição da conta no `bank`. A busca é uma `Query` por faixa de data no SK, numa janela em volta do vencimento.
- O valor tem de ser igual ao total da guia.
- O `tax` não copia a transação: guarda o identificador, a data e o valor.
- Uma transação paga só uma guia.

## Contrato

As duas APIs ficam no pool do Hostto e usam a área `financeiro` das regras de papel:

- **Leitura:** `Admin`, `Financeiro` e `Leitor`.
- **Escrita:** `Admin` e `Financeiro`.

O tenant vem da sessão. Os valores trafegam como número decimal em reais. Os períodos usam `AAAA-MM` para mês e `AAAA-Tn` para trimestre.

### `financial`

O pacote já responde em `/financial` e `/financial/{id}`. Os recursos novos são irmãos estáticos de `{id}`.

| Rota | Faz |
| --- | --- |
| `GET /financial/bank-receipts` | Lista os recebimentos. Filtros: `status` (`pendente`, `classificado`, `ignorado`), `month` e cursor. Cada item traz: identificador, conta, data, valor, nome e documento do pagador quando o Inter manda, descrição, status, motivo, lançamentos criados e sugestão. |
| `POST /financial/bank-receipts/{id}/classify` | Recebe `parts` (imóvel, categoria, valor e competência opcional) e `rule` opcional (campo, valor e categoria). Devolve o recebimento e os lançamentos criados. Responde 409 se as partes não somam o crédito ou se o recebimento já foi classificado. |
| `POST /financial/bank-receipts/{id}/ignore` | Recebe `reason` e `rule` opcional. |
| `POST /financial/bank-receipts/{id}/reopen` | Volta o recebimento para `pendente` e apaga os lançamentos que ele criou. Recusa quando algum desses lançamentos está num período fechado no `tax`. |
| `GET /financial/receipt-rules` | Lista as regras na ordem. |
| `POST /financial/receipt-rules` | Cria uma regra. |
| `PATCH /financial/receipt-rules/{id}` | Altera uma regra. |
| `DELETE /financial/receipt-rules/{id}` | Apaga uma regra. |
| `GET /financial/revenue-accounts` | Lista as contas do `bank` que alimentam receita. |
| `PUT /financial/revenue-accounts` | Grava essa lista. |

Uma regra tem estes campos:

- `field`: `payerDocument`, `payerName` ou `description`;
- `match`: `equals` ou `contains`;
- `value`;
- `action`: `revenue` ou `ignore`;
- o imóvel e a categoria, quando a ação é `revenue`;
- o motivo, quando a ação é `ignore`;
- `priority`.

Regra nova não reclassifica recebimento antigo. O pendente que casar com ela é classificado no próximo reprocessamento.

### `tax`

| Rota | Faz |
| --- | --- |
| `GET /tax/regime` | Devolve o regime da empresa do tenant: `LUCRO_PRESUMIDO`, base por competência e o início da vigência. |
| `PUT /tax/regime` | Grava o regime. Só `Admin`. |
| `GET /tax/parameters` | Lista os parâmetros por tributo e vigência: presunção, alíquota, periodicidade, código de receita, regra de vencimento, limite e alíquota do adicional. |
| `POST /tax/parameters` | Abre uma vigência nova. A vigência anterior fecha no dia antes. Só `Admin`. |
| `GET /tax/properties` | Lista os imóveis da apuração, com vigência. |
| `PUT /tax/properties` | Grava os imóveis da apuração. |
| `GET /tax/base?year=AAAA` | Devolve a receita da base por imóvel e mês, os totais por mês e trimestre, e as pendências de cada mês. |
| `GET /tax/periods?year=AAAA` | Lista os meses e trimestres do ano. Cada um traz a base, cada tributo, o estado (`aberto` ou `fechado`), a diferença quando fechado, as pendências e as guias ligadas. |
| `GET /tax/periods/{period}` | Detalha o período: a base por imóvel, a posse usada, o rateio por sócio e tributo, os parâmetros usados e, quando fechado, a diferença. |
| `POST /tax/periods/{period}/close` | Fecha o período e cria as guias previstas. Responde 409 com a lista de pendências quando não pode fechar. |
| `GET /tax/partners?year=AAAA` | Por sócio: a receita dos imóveis dele e a parte em cada tributo no mês, no trimestre e no ano, com a média mensal. |
| `GET /tax/guides` | Lista as guias. Filtros: `year`, `status` e `type`. |
| `POST /tax/guides` | Cria guia manual, inclusive a série de parcelas do parcelamento. |
| `PATCH /tax/guides/{id}` | Altera código de barras, valor, multa, juros, vencimento ou estado `cancelada`. |
| `GET /tax/guides/{id}/candidates` | Devolve os débitos do extrato compatíveis com a guia. |
| `POST /tax/guides/{id}/payment` | Recebe `transactionId` e marca a guia como paga. |
| `DELETE /tax/guides/{id}/payment` | Desfaz o vínculo e volta a guia para `emitida`. |

Uma guia tem estes campos:

- identificador e tipo (`PIS`, `COFINS`, `IRPJ`, `CSLL` ou `PARCELAMENTO`);
- código de receita e período;
- valor apurado, valor principal, multa, juros e total;
- vencimento, código de barras e estado;
- o pagamento, quando houver: transação, data e valor.

## Dados

### `financial`

- **`FinancialEntry`:** ganha o valor `BANK_TRANSACTION` em `SourceType`. Os índices não mudam.
- **Tabela nova de recebimentos.** A partição é o tenant. Ela guarda três tipos de item:

| Item | SK |
| --- | --- |
| Recebimento | `REC#<data>#<transação>` |
| Regra | `RULE#<prioridade>#<id>` |
| Lista de contas de receita | `ACCOUNTS` |

O recebimento pendente tem a chave do índice esparso `pendingKey`. Ela some quando o recebimento sai de `pendente`. A fila de revisão é uma `Query` nesse índice, sem `Scan`.

- **Fila nova:** a dos eventos do banco para o `financial`, com fila de mensagens mortas. A stack do `inter` recebe a URL dela como recebe a do `cashbook`.

### `tax`

Tabela nova, com o tenant na partição. Todas as consultas são `Query` por prefixo do SK, porque o volume por tenant é de dezenas de itens por ano.

| Item | SK |
| --- | --- |
| Regime | `REGIME` |
| Parâmetro | `PARAM#<tributo>#<início da vigência>` |
| Imóvel da apuração | `PROP#<imóvel>` |
| Fechamento | `PERIOD#<período>` |
| Guia | `GUIDE#<vencimento>#<id>` |

O fechamento guarda uma cópia do que usou: base, valores, rateio, parâmetros e posse. Assim, ele não depende de o `financial` ou o `person` continuarem iguais.

A carga inicial grava os parâmetros do Lucro Presumido vigentes desde 2025-01-01: presunção, alíquotas, códigos de receita 8109, 2172, 2089 e 2372, e o adicional. Também grava os imóveis da apuração.

## Riscos

- **Crédito que não é aluguel entra na base.** Isso acontece se uma regra larga demais o classifica como receita. Mitigação: a regra mostra quantos recebimentos já casou, e a base do mês mostra cada lançamento.
- **Lançamento manual em dobro.** Um lançamento manual criado antes da fila pode duplicar a receita que o reprocessamento cria. O reprocessamento lista os meses que já têm receita manual no imóvel e não cria nada neles sem confirmação.
- **Identificador diferente entre `bank` e `financial`.** Se os dois calcularem o identificador cada um a seu modo, o recebimento perde o vínculo com a transação. Mitigação: os dois usam a função exportada pelo `bank`, com um teste que compara os dois lados.
- **Posse incompleta.** Imóvel com posse que não soma 100% bloqueia o fechamento e aparece como pendência. O motor não inventa o resto.
- **Guias diferentes do gabarito.** Se o motor não reproduzir as guias pagas, o corte da planilha não acontece. O paralelo com a planilha continua até as guias de um trimestre inteiro baterem.
