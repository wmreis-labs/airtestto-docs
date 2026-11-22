# Design: emissor fiscal (Emitto) e NF-e do Zé Salgados

**Status:** rascunho
**Data:** 2026-11-22
**ADR:** [Emissor fiscal próprio](https://wmreis-labs.github.io/wmreis-docs/mudancas/adr/2026-11-20-emissor-fiscal-proprio/)
**PRD:** [Emitto, emissor fiscal](https://wmreis-labs.github.io/wmreis-docs/mudancas/prd/2026-11-20-emitto-emissor-fiscal/)

## Objetivo

Dois pacotes novos fazem o Emitto. O `fiscal-core` é uma biblioteca sem nuvem: monta o XML da NF-e 4.00 a partir dos schemas oficiais, valida, assina, conversa com a SEFAZ e desenha o DANFE. O `fiscal` é o serviço: guarda emitentes, certificados, numeração, cadastro fiscal e documentos, decide a tributação, transmite por fila e publica o resultado no tópico de mensagens. Ele não conhece pedido nem reserva: cada documento carrega a empresa e a origem.

O primeiro documento é a NF-e (modelo 55) e o primeiro consumidor é o pedido do Zé Salgados, pelo `sales`. A nota sai como o Zé emite hoje: Simples Nacional, natureza "Venda Dentro do Estado", CFOP 5101, CSOSN 102 e itens fiscais agrupados (MINI SALGADO FRITO, SALGADO FRITO, SALGADO ASSADO, NCM 19023000, unidade UN).

Este desenho cobre a história [#288](https://github.com/wmreis-labs/airtestto/issues/288) (tarefas [#289](https://github.com/wmreis-labs/airtestto/issues/289) a [#293](https://github.com/wmreis-labs/airtestto/issues/293)) e a parte de backend da [#302](https://github.com/wmreis-labs/airtestto/issues/302) ([#306](https://github.com/wmreis-labs/airtestto/issues/306) a [#309](https://github.com/wmreis-labs/airtestto/issues/309)).

## Fora deste desenho

- NFC-e, NFS-e e CT-e. O modelo do documento já tem o bloco por tipo; cada um entra numa revisão desta página.
- O console do Emitto, o pool dele e as rotas do console ([#294](https://github.com/wmreis-labs/airtestto/issues/294)). Até ele existir, emitente e certificado são cadastrados por uma função operacional (ver Emitente).
- O radar normativo.
- A tela do Zé, que fica no [zesalgados-docs](https://wmreis-labs.github.io/zesalgados-docs/).
- Manifestação do destinatário, download de notas recebidas, MDF-e.

## Fluxo

### Emitir a NF-e de um pedido

1. O Zé chama `POST /sales/orders/{orderId}/fiscal/nfe`. O corpo leva só ajustes opcionais: natureza, informações complementares, modalidade de frete. Não leva valor, item nem imposto.
2. O `sales` lê o pedido da empresa da sessão. Pedido que não está pago, que já tem NF-e autorizada ou em processamento, ou que foi cancelado recebe 409. Pedido com NF-e rejeitada pode emitir de novo (reenvio).
3. O `sales` lê o cliente no `person` e confere o destinatário: CPF ou CNPJ válido, nome, endereço completo com código IBGE do município e indicador de IE. Faltando algo, devolve 422 com a lista do que falta, para a tela pedir o cadastro.
4. O `sales` monta o fato e invoca a função de emissão do `fiscal` (IAM) com a chave de idempotência `zesalgados#sales#order#<orderId>#nfe`.
5. O `fiscal` resolve a tributação (ver Cadastro fiscal), reserva o número, monta e assina o XML, grava o documento como `processando`, põe na fila de transmissão e devolve identificador, estado, série, número e chave.
6. O `sales` grava no pedido o bloco `fiscal` (identificador, estado, série, número, chave) e devolve isso à tela.

Repetir o passo 4 com a mesma chave de idempotência devolve o mesmo documento, em qualquer estado.

### Transmitir

1. O worker lê a fila, carrega o documento e, se ele não está mais `processando`, termina.
2. Lê o certificado do emitente, confere a disponibilidade da SEFAZ (`NFeStatusServico4`, guardado por 5 minutos) e envia o lote de uma nota com `indSinc=1` (`NFeAutorizacao4`).
3. Autorizada (`cStat` 100): monta o `nfeProc` (NF-e + protocolo), grava no S3, gera o DANFE, marca `autorizado` e publica `fiscal.document.authorized`.
4. Rejeitada: grava `cStat`, `xMotivo` e a explicação, marca `rejeitado` e publica `fiscal.document.rejected`. O número continua reservado para o reenvio corrigido.
5. Lote recebido sem resposta síncrona (`cStat` 103): consulta o recibo (`NFeRetAutorizacao4`) com espera crescente.
6. Sem resposta ou erro de rede: antes de reenviar, consulta pela chave (`NFeConsultaProtocolo4`). Nota já autorizada é tratada como no passo 3. Isso evita a rejeição por duplicidade.
7. SEFAZ indisponível por mais de 15 minutos ou três falhas seguidas: o emitente entra em contingência SVC-AN (`tpEmis` 6, com data, hora e justificativa). A nota é reassinada com a nova chave, mantendo série e número, e transmitida à SVC-AN. A volta ao normal é automática quando o status da SEFAZ volta.

A fila tem DLQ. Mensagem na DLQ deixa o documento `processando` e dispara alarme; a nota nunca é dada como autorizada sem protocolo.

### Cancelar e corrigir

- Cancelamento: `POST /sales/orders/{orderId}/fiscal/nfe/cancel` com justificativa de 15 a 255 caracteres. O `fiscal` envia o evento 110111 (`NFeRecepcaoEvento4`) dentro do prazo da SEFAZ-SP (24 horas da autorização). Fora do prazo, devolve 409 com a orientação de nota de devolução, que fica fora desta versão.
- Carta de correção: `POST /sales/orders/{orderId}/fiscal/nfe/correction` com o texto (15 a 1000 caracteres). Evento 110110 com sequência de 1 a 20; a última vale. A tela avisa o que a CC-e não pode corrigir (valor, imposto, quantidade, destinatário, data).
- Número reservado e não usado (documento descartado antes de autorizar): inutilização (`NFeInutilizacao4`) por um job diário que junta as faixas por emitente e série.

### Arquivos

`GET /sales/orders/{orderId}/fiscal/nfe/files` devolve URLs assinadas, válidas por 5 minutos, do DANFE em PDF e do XML (`nfeProc`), e dos XMLs de evento quando houver. A tela nunca recebe o caminho do bucket.

### Modo simulado

Cada emitente tem um ambiente: `simulado`, `homologacao` ou `producao`. No `simulado`, o adaptador da SEFAZ não sai da Lambda: devolve autorização com protocolo falso depois de 2 segundos, ou o cenário configurado no emitente (rejeição com um `cStat` escolhido, indisponibilidade, demora). O DANFE sai com a tarja "SEM VALOR FISCAL – SIMULAÇÃO". É o modo de desenvolver o back e a tela sem certificado; ele nunca existe em produção.

## Contrato

### Funções internas do `fiscal`

Invocadas por backends do airtestto com IAM. O certificado só é lido pelas funções do `fiscal`; quem consome nunca recebe permissão no segredo nem no bucket.

| Função | Entrada | Saída |
| --- | --- | --- |
| Emitir | Empresa, emitente (opcional; padrão da empresa para o modelo), tipo (`nfe`), origem (sistema, tipo, identificador), chave de idempotência, natureza (opcional), destinatário, itens, frete, descontos, pagamentos, informações complementares, `correlationId` | Identificador, estado, modelo, série, número, chave, ambiente |
| Consultar | Empresa, identificador | Documento (ver Leitura) |
| Cancelar | Empresa, identificador, justificativa | Estado e protocolo do evento |
| Corrigir | Empresa, identificador, texto | Sequência e protocolo do evento |
| Arquivos | Empresa, identificador | URLs assinadas do DANFE e dos XMLs |

O item do fato traz produto, variante, categoria, tamanho, nome, quantidade vendida, unidade vendida, preço unitário e subtotal. O destinatário traz tipo e documento, nome, e-mail, endereço com código IBGE do município, indicador de IE e IE. O pagamento traz forma (`dinheiro`, `pix`, `credito`, `debito`, `outros`) e valor.

Erros: entrada inválida (400), emitente não configurado ou certificado vencido (412), item sem item fiscal ou destinatário incompleto (422, com a lista), documento em estado que não aceita a operação (409), falha da SEFAZ (o documento segue `processando` ou `rejeitado`; a função nunca devolve 5xx por causa da SEFAZ depois de gravar o documento).

A API pública `/v1` ([#293](https://github.com/wmreis-labs/airtestto/issues/293)) é a mesma função com a chave de API na frente; o formato do corpo é o mesmo.

### Rotas HTTP do `sales`

| Rota | Autorização |
| --- | --- |
| `POST /sales/orders/{orderId}/fiscal/nfe` | Sessão do pool do Zé; empresa da sessão; escrita de pedidos (GestorCozinha, Pdv) |
| `POST /sales/orders/{orderId}/fiscal/nfe/cancel` | Igual; só GestorCozinha |
| `POST /sales/orders/{orderId}/fiscal/nfe/correction` | Igual; só GestorCozinha |
| `GET /sales/orders/{orderId}/fiscal/nfe/files` | Sessão; empresa da sessão; leitura de pedidos |

As regras entram no mapa de papéis por rota do authorizer, como área própria (`fiscal`) dentro do `sales`.

O pedido lido em `GET /sales/orders/{orderId}` passa a trazer o bloco `fiscal`: identificador, estado, série, número, chave, data de autorização, motivo e explicação da rejeição, e se cancelamento e carta de correção ainda são possíveis.

### Estados

`processando` → `autorizado` → `cancelado`; `processando` → `rejeitado` → `processando` (reenvio); `processando` → `descartado` (número vai para inutilização). `autorizado` aceita cartas de correção sem mudar de estado. Contingência é um atributo (`tpEmis`), não um estado.

### Eventos

Publicados no `MessageTopic` com `domain = fiscal` e `type` igual ao tipo, corpo no [envelope de eventos](../../arquitetura/cqrs-eventos.md).

| Tipo | Quando |
| --- | --- |
| `fiscal.document.authorized` | Protocolo de autorização recebido |
| `fiscal.document.rejected` | Rejeição da SEFAZ |
| `fiscal.document.canceled` | Evento de cancelamento homologado |
| `fiscal.document.corrected` | Carta de correção homologada |
| `fiscal.document.contingency` | Emitente entrou ou saiu de contingência |

O `payload` leva identificador, origem, modelo, série, número, chave, estado, `cStat` e `xMotivo`. Não leva destinatário. O `sales` assina `authorized`, `rejected`, `canceled` e `corrected` com filtro na origem `sales` e atualiza o bloco `fiscal` do pedido, uma vez por `eventId`.

### SEFAZ

NF-e 4.00 na SEFAZ-SP e na SVC-AN, SOAP 1.2, TLS mútuo com o A1 do emitente e a cadeia ICP-Brasil embutida no pacote, além das autoridades do sistema. Os endereços por UF, ambiente e contingência ficam numa tabela de dados do `fiscal-core`, não no código. `dhEmi` sempre com o fuso de Brasília.

O XML segue o pacote de schemas vigente, com os tipos gerados dele. Os grupos de IBS e CBS existem no modelo e são omitidos enquanto a regra para o Simples Nacional (CRT 1) dispensar o preenchimento; a dispensa é um dado com vigência.

## Cadastro fiscal

A tributação sai de camadas. A mais específica ganha:

1. **Emitente:** CNPJ, razão social, fantasia, IE, CRT, endereço com código IBGE, série por modelo, natureza padrão, texto padrão das informações complementares ("Documento emitido por ME ou EPP optante pelo Simples Nacional..."), modalidade de frete padrão, CNPJs autorizados a baixar o XML (`autXML`, vazio por padrão).
2. **Natureza da operação:** descrição dentro e fora do estado, CFOP dentro (5101) e fora (6101), finalidade, `indFinal` (consumidor final quando o destinatário não é contribuinte), `indPres` (1 retirada, 4 entrega) e modalidade de frete.
3. **Item fiscal:** código (`cProd`), descrição, NCM, CEST, GTIN (`SEM GTIN`), CSOSN, origem, unidades comercial e tributável.
4. **Mapeamento do catálogo:** regras ordenadas por empresa, de quem casa mais para quem casa menos: variante, produto, categoria e tamanho. Cada regra aponta um item fiscal e um fator (unidades fiscais por unidade vendida; cento = 100). Pedido com item sem regra recebe 422.
5. **Exceção por cliente:** natureza, CFOP ou texto adicional para um destinatário.
6. **Ajuste na nota:** natureza, informações complementares e frete no próprio pedido de emissão.

Na montagem, as linhas do pedido viram linhas fiscais agrupadas por item fiscal e preço por unidade fiscal. Quantidade com até 4 casas, valor unitário com até 10, valor do item com 2. Desconto do pedido é rateado pelos itens em proporção ao valor, com o resto de centavo no maior item. Taxa de entrega vira `vFrete` com frete por conta do emitente; sem taxa, vale a modalidade do emitente ou da natureza.

O valor aproximado dos tributos (Lei 12.741) vem da tabela do IBPT por NCM e UF, com versão e vigência, e entra por item e no total, com a fonte no texto complementar.

Cada camada tem vigência (`vigenteDe`, `vigenteAte`). A emissão usa o que vale na data de emissão e grava no documento a versão de cada regra usada.

## Dados

Tabela `fiscal-documents`:

| Item | Partição | Ordenação | Para quê |
| --- | --- | --- | --- |
| Documento | `DOC#<id>` | `META` | Leitura pelo id e pelo worker |
| Idempotência | `IDEM#<empresa>#<chave>` | `META` | Gravado com `attribute_not_exists`; aponta o documento |
| Índice de lista | `<emitente>#<modelo>#<AAAA-MM>` | `<emitidoEm>#<id>` | Lista e pacote mensal |
| Índice por chave | `<chave de acesso>` | `META` | Busca pela chave |

O documento guarda empresa, emitente, origem, modelo, série, número, chave, ambiente, `tpEmis`, estado, totais, destinatário copiado no momento da emissão, versões das regras usadas, `cStat`, `xMotivo`, explicação, protocolo, data de autorização, eventos (tipo, sequência, protocolo), chaves dos arquivos no S3 e o histórico de transições.

Tabela `fiscal-config`: emitentes (`EMITTER#<id>`), contador de numeração (`SEQ#<emitente>#<modelo>#<série>`, incrementado com escrita condicional), faixas a inutilizar, naturezas, itens fiscais, regras de mapeamento, exceções por cliente e a tabela do IBPT, todos com partição por empresa.

Bucket `fiscal-documents-<ambiente>`: versionado, cifrado com KMS, sem regra de expiração antes de 5 anos e meio. Caminho `<empresa>/<emitente>/<modelo>/<AAAA>/<MM>/<chave>-<tipo>.xml` e `.pdf`.

Segredo por emitente: `airtestto/fiscal/<ambiente>/<empresa>/<emitente>/a1`, com o PFX e a senha, cifrado com a chave KMS `fiscal-certificates`. Só as funções que assinam e transmitem leem. O cadastro confere senha, CNPJ do certificado igual ao do emitente e validade, e guarda no emitente só a validade e o titular. Aviso a 30, 15 e 7 dias do vencimento.

### Emitente

Até o console existir, o emitente e o certificado são cadastrados por uma função operacional, invocada por quem opera a plataforma, que recebe os dados do emitente e o PFX e grava o emitente e o segredo. A série do Emitto no Zé é diferente da série usada pelo emissor atual, para que os dois nunca disputem o mesmo número durante a transição.

## Explicação da rejeição

Uma tabela de dados liga `cStat` a uma frase em português, ao campo afetado e à correção sugerida, começando pelas rejeições mais comuns de destinatário, NCM, CFOP, totais e duplicidade. Código sem explicação mostra o `xMotivo` da SEFAZ.

## Logs

Seguem o [ADR de logs e PII](../adr/logs-e-pii.md): o log leva empresa, emitente, documento, chave, estado e `cStat`, nunca o XML, o documento ou o endereço do destinatário. O XML só existe no bucket.

## Riscos

- Número repetido ou buraco na numeração: contador com escrita condicional, número preso ao documento até autorizar ou inutilizar, série própria do Emitto.
- Resposta perdida da SEFAZ gerar duplicidade: consulta pela chave antes de todo reenvio.
- Rejeição em produção sem homologação equivalente: o corpus de testes reproduz as NF-e reais do Zé, com dados pessoais trocados, e roda em homologação antes da virada.
- Certificado vencido parar a emissão: aviso antecipado e 412 claro na emissão.
- Mudança de regra do Simples e de IBS/CBS: dispensa e regras como dados com vigência.
- Endereço do destinatário: a NF-e exige endereço completo; cliente genérico do PDV, só com CPF, não emite NF-e nesta versão e fica para a NFC-e.
