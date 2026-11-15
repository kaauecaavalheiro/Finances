# Sobra — contexto para o Claude Code

App pessoal de finanças (Next.js 16, App Router, Tailwind 4). Dados do banco via Meu Pluggy
(só leitura), lançamentos manuais e regras numa planilha do Google. Sem banco de dados.

@AGENTS.md

## Regras
- Nunca escreva chave, secret, senha ou hash no código, em arquivos versionados ou no chat.
  Tudo vem de variáveis de ambiente (`lib/config.ts`, `.env.example`).
- Toda ação do servidor (`app/actions.ts`) confere o login com `guard()`/`guardWrite()`.
- Dados de exemplo (`lib/demo.ts`) são fictícios; não use dados reais em testes ou prints.
- Interface em português do Brasil, frases curtas, sentence case.

## Comandos
- `npm run dev` — roda com dados de exemplo se não houver `.env.local`
- `npm run typecheck`
- `npm run build`
- `npm run hash-password -- "senha"`

## Onde mexer
- Categorias e lojas conhecidas: `lib/categories.ts`
- Como uma transação vira gasto/receita/transferência: `lib/classify.ts`
- Contas do mês, fixos, parcelas, faturas: `lib/analytics.ts`
- Cores (tokens e séries de gráfico): `app/globals.css`
