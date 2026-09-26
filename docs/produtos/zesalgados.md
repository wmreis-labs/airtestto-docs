# Zé Salgados

Interface web de PDV e pedidos: produtos, estoque e venda. React e TypeScript, em desenvolvimento. O backend de catálogo, pedido e caixa está em [Product](../dominios/product.md), [Sales](../dominios/sales.md) e [PDV](../dominios/pdv.md).

## Organização

| Pasta | Responsabilidade |
| --- | --- |
| `components` | Apresentação. Recebe prop e emite callback |
| `pages` | Compõe a tela, usa hook e serviço |
| `hooks` | Busca, debounce, formulário |
| `services` | HTTP, DTO e erro normalizado. Não mexe na UI |
| `store` | Sessão, usuário e carrinho. Só o estado compartilhado |
| `types` | Contratos TypeScript |

Componente em PascalCase, função e hook em camelCase. Export nomeado. Erro de serviço aparece no snackbar global. Estilo segue o tema existente.

## Desenvolvimento

Node.js 16 ou superior.

```bash
npm install
npm start
npm test
npm run build
```

O modo de desenvolvimento usa a porta 3000. O build sai em `build/`. Branch de contribuição sai de `main`, no padrão `feature/descricao-curta`.
