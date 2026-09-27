# Design: módulo de caixa no admin

**Status:** vigente
**Data:** 2026-09-27
**ADR:** [admin e ingestão](../adr/2026-09-27-admin-e-ingestao.md)
**PRD:** [caixa pessoal e profissional](../prd/2026-09-27-caixa-pessoal-profissional.md)

## Objetivo

Mostrar o caixa pessoal e o profissional dentro do admin que já existe, em `https://admin.testto.com.br/login` e `https://dev-admin.testto.com.br/login`. A tela não recalcula receita, despesa, resultado nem sobra. Esses números vêm de `/cashbook`, no desenho [cashbook](2026-09-27-caixa-cashbook.md).

## Fora deste desenho

Parser de OFX e CSV, pareamento, livros e a fórmula do mês ficam no backend. O Hostto não recebe este módulo. O dashboard atual do admin não passa a inventar série financeira: o painel deste módulo é outra tela.

## Onde entra

O menu principal hoje é Dashboard (`/dashboard`), Aplicativos (`/apps`), Usuários (`/users`), Grupos (`/groups`), Tenants (`/tenants`) e Logs (`/logs`). Configurações continua em `/settings`.

O módulo entra como mais um item desse menu, com o rótulo Caixa. A rota proposta é `/financeiro`. Ela não está travada num ADR: se o caminho mudar, este desenho é que se atualiza.

Login, layout autenticado e o cliente `admin/src/services/api/baseApi.ts` permanecem. Toda chamada manda `Authorization` e `x-tenant` para `REACT_APP_API_URL`.

## Telas

| Tela | O que a pessoa faz | Fase |
| --- | --- | --- |
| Painel | Vê, por livro e no consolidado, receita real, despesa real, resultado, transferências, aportes e a série dos meses | 1, e a reserva na fase 3 |
| Contas | Cadastra as quatro contas e o livro de cada uma. Inter aparece como coleta automática | 1 |
| Extrato | Envia OFX ou CSV. Mostra o que já entrou e o que foi para revisão, inclusive PDF | 1. Drive e Gmail aparecem como origem na fase 2 |
| Revisão | Escolhe despesa, receita, transferência ou aporte. Se for transferência, liga a contrapartida | 1 |
| Lançamento | Lança à mão receita, despesa, transferência ou aporte, com data de competência | 1 |
| Contas a vencer | Vê o previsto que ainda não casou com o extrato | 2 |
| Plano de reserva | Vê meta, reserva atual, quanto falta, aportes e sobra investível | 3 |

A fase 1 já responde se o mês melhorou. Drive, Gmail e o plano de reserva não bloqueiam essa tela.

## Estados

- **Vazio.** Nenhuma conta cadastrada: o painel pede o cadastro das contas e não mostra zero como se fosse um mês fechado.
- **Sem livro.** Movimento de conta antiga sem livro aparece na revisão, não no resultado.
- **Revisão.** A fila lista transferência sem par, dois PIX do mesmo valor, conta sem livro e PDF. Confirmar grava a escolha. O painel só usa o que já foi classificado.
- **Erro.** Falha de upload ou de API mostra o erro da resposta e mantém a tela anterior. A interface não completa o número em falta.
- **Google indisponível.** Sem credencial no ambiente da API, Drive e Gmail aparecem como indisponíveis. O upload segue habilitado.

## Riscos

A rota `/financeiro` é proposta. O menu não esconde Dashboard, Aplicativos nem o restante da administração. Número de resultado exibido fora de `/cashbook` quebra este desenho.
