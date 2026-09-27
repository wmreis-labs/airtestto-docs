# Hostto App

O manual vigente está em [hostto-app-docs](https://wmreis-labs.github.io/hostto-app-docs/).

Aplicativo móvel em React Native, Expo e TypeScript. A arquitetura é modular: módulo de domínio, camada HTTP tipada, React Query e armazenamento seguro da autenticação.

## Camadas

A tela não chama a API. O hook busca dado e aplica a regra. A camada `api` fala HTTP. Componentes de UI permanecem reutilizáveis.

```text
tela → hook → API → backend
```

Pastas: `api`, `modules`, `components`, `hooks`, `navigation`, `providers`, `utils` e `types`.

## Desenvolvimento

```bash
npm install
npx expo start
npm run android
npm run ios
```
