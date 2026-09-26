# Setup das interfaces

As interfaces consomem a API do airtestto. Nenhuma delas substitui o backend.

| Produto | Stack | Comando de desenvolvimento |
| --- | --- | --- |
| [Admin](../produtos/admin.md) | React (Create React App) | `npm install` e `npm start` |
| [Hostto](../produtos/hostto.md) | React, TypeScript, Vite, Redux Toolkit, MUI | `npm install` e `npm run dev` |
| [Hostto App](../produtos/hostto-app.md) | React Native e Expo | `npm install` e `npx expo start` |
| [Zé Salgados](../produtos/zesalgados.md) | React e TypeScript | `npm install` e `npm start` |
| [PulseAI](../produtos/pulseai.md) | React Native e Expo | `npm install` e `npx expo start` |

Variáveis de ambiente e segredos de cada interface ficam no repositório correspondente. Este portal não republica arquivos `.env` nem chaves.
