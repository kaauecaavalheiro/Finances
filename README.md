# Sobra

Painel de finanças da casa, para duas pessoas. As transações vêm sozinhas do banco pelo
[Meu Pluggy](https://meu.pluggy.ai) (Open Finance). O que não passa pelo banco você lança
à mão, e isso fica guardado numa planilha do Google.

Telas: **Visão geral** (quanto sobrou no mês e para onde foi), **Transações**, **Fixos e
parcelas**, **Cartões** (fatura por cartão, no formato da planilha antiga), **Contas**,
**Investimentos** e **Ajustes**.

Sem nenhuma configuração, o app mostra **dados de exemplo**. Dá para ver tudo funcionando
antes de ligar qualquer coisa.

---

## 1. Rodar no seu computador

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Sem variáveis de ambiente, aparecem os dados de exemplo.

Para usar seus dados localmente, copie `.env.example` para `.env.local` e preencha.
O `.env.local` nunca vai para o Git.

## 2. Publicar na Vercel (link para vocês dois)

1. Suba esta pasta para um repositório **privado** no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório. Não precisa mudar
   nada no build.
3. Em **Settings → Environment Variables**, cadastre as variáveis dos passos 3, 4 e 5.
4. Faça um novo deploy (**Deployments → ⋯ → Redeploy**) sempre que mudar uma variável.

O app avisa e esconde os dados se o Pluggy estiver ligado sem o login configurado.

## 3. Login

| Variável | O que é |
|---|---|
| `PEOPLE` | Quem usa, no formato `id:Nome`, separado por vírgula. Ex.: `kaue:Kauê,ana:Ana` |
| `AUTH_SECRET` | Texto aleatório com 32+ caracteres. Gere com `openssl rand -base64 48` |
| `PASSWORD_KAUE`, `PASSWORD_ANA` | O **hash** da senha de cada pessoa (o nome segue o `id`, em maiúsculas) |

Para gerar o hash de uma senha, rode na pasta do projeto:

```bash
npm run hash-password -- "a senha que você quer"
```

Copie a linha que começa com `scrypt.` para a variável. A senha em si não fica guardada
em lugar nenhum.

## 4. Pluggy (dados do banco)

O Meu Pluggy é gratuito para uso pessoal: até **5 conexões por pessoa**, atualizadas
**uma vez por dia**. Cada um de vocês faz estes passos com a própria conta:

1. Crie a conta em [meu.pluggy.ai](https://meu.pluggy.ai) e autorize seus bancos pelo
   Open Finance (cada banco é autorizado separadamente).
2. Entre no [dashboard.pluggy.ai](https://dashboard.pluggy.ai) **com o mesmo e-mail**
   e crie uma aplicação.
3. Na aplicação, vá em **Demo → Connect Account** e escolha **MeuPluggy** (não o banco
   direto, nem o Sandbox). Repita para cada banco.
4. Copie:
   - o **Client ID** e o **Client Secret** da aplicação (o Secret só aparece uma vez;
     se perdeu, gere outro);
   - o **itemId** de cada banco, que aparece em **Connected Items** na página Demo.
5. Cadastre na Vercel (troque `KAUE` pelo `id` da pessoa, em maiúsculas):

```
PLUGGY_KAUE_CLIENT_ID=...
PLUGGY_KAUE_CLIENT_SECRET=...
PLUGGY_KAUE_ITEM_IDS=itemId1,itemId2
```

Com a planilha ligada (passo 5), novos bancos podem ser adicionados pela tela **Ajustes**,
sem novo deploy.

A autorização do Meu Pluggy vale **um ano**. O app avisa em Ajustes quando faltar menos de
30 dias. Para renovar, repita o passo 3; o itemId pode mudar.

## 5. Google Sheets (opcional, para lançar à mão e corrigir categorias)

Use uma **conta Google pessoal** (contas de empresa costumam bloquear chaves de conta de
serviço).

1. Crie uma planilha vazia. O ID dela é o trecho entre `/d/` e `/edit` no link.
2. No [Google Cloud Console](https://console.cloud.google.com), crie um projeto e ative
   a **Google Sheets API** (APIs e serviços → Biblioteca).
3. Em **IAM e administrador → Contas de serviço**, crie uma conta de serviço. Depois, em
   **Chaves → Adicionar chave → JSON**, baixe o arquivo.
4. Compartilhe a planilha com o e-mail da conta de serviço (termina em
   `.iam.gserviceaccount.com`) como **Editor**.
5. Cadastre na Vercel, usando os campos do JSON:

```
GOOGLE_SHEETS_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...   (campo client_email)
GOOGLE_PRIVATE_KEY=...             (campo private_key, inteiro, com os \n)
```

O app cria sozinho as abas **Lançamentos**, **Regras**, **Ajustes** e **Conexões**.
Dá para editar direto na planilha; o app relê a cada 5 minutos ou quando você toca em
atualizar. Depois de configurar, apague o arquivo JSON do seu computador.

---

## Como o app faz as contas

- **Mês do cartão.** Compras no cartão contam no mês da **fatura**, não no da compra.
  É o mesmo jeito da planilha antiga: a fatura de novembro entra em novembro.
- **Pagamento de fatura** e **transferência entre contas** não contam como gasto nem
  como receita. Um Pix de um para o outro aparece como gasto/receita na visão de cada um,
  e some na visão **Juntos**.
- **Investimentos.** Aplicações e resgates ficam fora dos gastos e aparecem como
  "Investido" (aplicações menos resgates).
- **Categorias.** Nesta ordem: correção sua → regra sua (aba Regras) → lista de lojas
  conhecidas → categoria do Pluggy → código da loja (MCC) → Outros. Ao trocar a categoria
  de uma transação, marque "usar sempre" para virar regra.
- **Fixos.** Detectados sozinhos quando o mesmo gasto aparece em 2 dos últimos 3 meses,
  até 2 vezes por mês, com valor parecido, em categorias como assinaturas, contas e
  moradia. Você marca ou desmarca à mão na transação.
- **Parcelas.** Vêm do banco (ou do texto "03/10" na descrição). O app projeta as parcelas
  que faltam nos próximos meses.

## Segurança

- Chaves e senhas só nas variáveis de ambiente. Se alguma vazar, gere outra no Pluggy ou
  no Google e troque na Vercel.
- O app pede login em todas as páginas e ações, e pede aos buscadores para não indexar.
- O app só **lê** o banco: não move dinheiro nem altera nada lá.

## Estrutura

```
app/(app)/          telas (visão geral, transações, fixos, cartões, contas, investimentos, ajustes)
app/actions.ts      ações do servidor (login, lançamentos, regras, conexões)
lib/pluggy.ts       cliente da API do Pluggy (só leitura)
lib/sheets.ts       Google Sheets como armazenamento
lib/categories.ts   categorias e lista de lojas conhecidas
lib/classify.ts     categoria, tipo, regras e transferências internas
lib/analytics.ts    resumo do mês, fixos, parcelas, faturas
lib/demo.ts         dados de exemplo
components/         interface e gráficos
proxy.ts            exige login antes de qualquer página
```

Cores dos gráficos validadas para daltonismo (contraste e separação entre séries).
