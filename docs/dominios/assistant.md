# Assistant

Conversa do assistente do Hostto. Interpreta a intenção, pede o que falta e executa consulta pelo orchestrator. O contrato HTTP está em [API do Assistant](../api/assistant.md).

Na primeira fase a conversa usa `POST /assistant/message`, persiste sessão e turno, e atende intenções de leitura: disponibilidade, aluguel médio e busca de pessoa. Agendamento exige confirmação em endpoint separado e devolve um deeplink; o evento de calendário só nasce quando a pessoa salva na tela.

CPF aparece mascarado na mensagem ao usuário. Texto bruto com dado pessoal não entra em log.
