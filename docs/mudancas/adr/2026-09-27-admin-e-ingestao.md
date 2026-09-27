# ADR: admin é a interface e o extrato entra por arquivo

**Status:** aceita em 2026-09-27.

## Contexto

A tela precisa existir onde o operador já entra. O admin em `https://admin.testto.com.br/login` e `https://dev-admin.testto.com.br/login` já consome os microsserviços do airtestto. O Hostto é o produto de imóvel. Itaú, Santander e Nubank não entram por API neste projeto. O Inter já tem conector.

O [PRD](../prd/2026-09-27-caixa-pessoal-profissional.md) descreve o que a pessoa precisa ver. Este ADR escolhe onde isso aparece e como o extrato chega.

## Decisão

A interface é um módulo novo dentro do admin, no layout e no login que já existem. O cliente HTTP continua o de `admin/src/services/api/baseApi.ts`, com `Authorization` e `x-tenant`, na mesma base `REACT_APP_API_URL`. Não nasce outro aplicativo.

Itaú, Santander e Nubank entram por arquivo. A ordem de leitura é OFX, depois CSV de cada banco. PDF de extrato não vira lançamento sozinho: vai para revisão. Open Finance fica fora. Certificado e consentimento são outro projeto.

Há três portas para o mesmo evento `TRANSACTIONS_CAPTURED`: upload no admin, pasta do Google Drive por banco e label de extrato no Gmail. A leitura automática do Google só existe quando houver credencial no ambiente da API. Até lá, o caminho oficial é o upload no admin.

## Consequências

O Hostto não ganha tela deste caixa. O desenho das telas, da rota e dos estados vazios está em [Admin](../design/2026-09-27-caixa-admin.md). O mapa de colunas de cada CSV fica no desenho do [cashbook](../design/2026-09-27-caixa-cashbook.md), porque o formato muda por banco.

## Alternativas

Um aplicativo novo foi rejeitado: o login e o tenant já existem no admin. Open Finance nesta entrega foi rejeitado. Tratar PDF como fonte automática foi rejeitado, porque erra valor e data. Colocar a tela no Hostto foi rejeitado: Hostto continua só com imóvel.
