# Histórico de Interação com IA

## Informações gerais

| Campo | Valor |
|-|-|
| **Grupo** | 15 |
| **Integrantes** | Jakson José, Nayro Ganzer |
| **API NASA escolhida** | POWER (inicialmente DONKI/MPC, trocada no início do projeto) |
| **IA utilizada** | Claude (Anthropic) |
| **Data de início** | 12-11-2026 |
| **Data de conclusão** | 13-11-2026 |

---

## Interação 1: Escolha da API e plano geral

**Data:** 12-11-2026
**Objetivo:** Entender a atividade, receber um plano de execução e definir a API do projeto.

**Prompt enviado à IA (1ª mensagem):**

```
[PDF da atividade e template ai-interaction.md anexados]
DONKI / MPC
Cruzamentos da magnetopausa: quando o vento solar penetra o campo magnético terrestre
essa é minha API, pode me instruir e me ajudar a fazer essa atividade ?
```

**Prompt enviado à IA (2ª mensagem, troca de API):**

```
Na vdd, vou usar outra API
POWER
Dados climatológicos e energia solar global por coordenada geográfica
é essa aqui
```

**Resumo da resposta:**
Na 1ª mensagem, a IA propôs a ordem de trabalho (contas, banco, secrets, script, workflow, painel e documentação) e gerou um `setup.sql`, um `fetch_nasa.py` e um workflow para a DONKI/MPC. Na 2ª, o grupo trocou para a NASA POWER, e a IA gerou um novo `setup.sql` (tabela `clima_diario` com `UNIQUE (local, data)` e tabela `execucoes`), o `fetch_nasa.py` para várias cidades, com `-999` tratado como `NULL`, e o workflow sem `NASA_API_KEY`, já que a POWER não exige chave.

**O que funcionou:**
A ordem de trabalho, a modelagem do banco (tabelas, UNIQUE, RLS e GRANTs), a deduplicação por (`local`, `data`) e o tratamento de valores ausentes.

**O que precisou ajuste:**
O código da DONKI/MPC foi descartado com a troca de API, e os campos dessa API tinham sido descritos de memória, sem teste no endpoint. O cabeçalho `Authorization: Bearer` do script da POWER não funciona com as chaves novas do Supabase e foi corrigido na Interação 5.

---

## Interação 2: Passo a passo de Supabase, GitHub e integração

**Data:** 12-11-2026
**Objetivo:** Obter o roteiro completo de configuração das plataformas.

**Prompt enviado à IA:**

```
Vou integrar tudo com o supabase e github. Após, me ajude com o html e o js
```

**Resumo da resposta:**
Roteiro em cinco partes: Supabase, GitHub, Secrets, execução do workflow e entrega, com lista de erros comuns e teste da API REST.

**O que funcionou:**
A sequência de passos e o teste da API REST.

**O que precisou ajuste:**
Nada nesta etapa. Os problemas apareceram nas interações seguintes.

---

## Interação 3: Planilha de reserva e organização do repositório

**Data:** 12-11-2026
**Objetivo:** Entender como preencher a planilha e como organizar o repositório no padrão do PDF.

**Prompt enviado à IA:**

```
[print da planilha de reserva] As pessoas colocaram essas coisas ai, organização e o repositorio
[print do repositório] onde vou pra salvar o SQL no repositorio?
é pra mudar o nome do repositorio do git para "POWER"?
```

**Resumo da resposta:**
A IA explicou como preencher as colunas G e H e como criar os arquivos pelo GitHub (`Add file > Create new file`). Apontou que o repositório estava na conta pessoal, com o nome da organização, e que devia ser transferido para a organização e renomeado para `POWER`.

**O que funcionou:**
A orientação de transferir o repositório e renomeá-lo, conforme a seção 2.3 do PDF.

**O que precisou ajuste:**
A organização estava com `N14` no nome, e o número 14 já era usado por outro grupo na planilha. O grupo passou a adotar o número 15.

---

## Interação 4: Credenciais do Supabase e Secrets do GitHub

**Data:** 12-11-2026
**Objetivo:** Localizar a Project URL e as chaves e cadastrá-las como Secrets.

**Prompt enviado à IA:**

```
[print da tela API Keys] estou aq pra pegar as credenciais, oque faço agora ?
[print do formulário New secret] Project URL ?
[print da tela Data API] isso?
Acabei de colocar a secret key no repositorio do git, proximo passo?
```

**Resumo da resposta:**
A IA indicou onde ficam a URL, a publishable key e a secret key, e que o secret `SUPABASE_URL` deve conter só `https://ID.supabase.co`.

**O que funcionou:**
A separação entre chave pública (painel) e secret key (somente nos Secrets).

**O que precisou ajuste:**
A URL copiada da tela Data API termina em `/rest/v1/` e precisou ser cortada, senão as chamadas falhariam com 404.

---

## Interação 5: Script corrigido, sem comentários

**Data:** 12-11-2026
**Objetivo:** Obter o `fetch_nasa.py` corrigido.

**Prompt enviado à IA:**

```
Manda os scripts/fetch_nasa.py dnv e arrumado de novo pra mim
```

**Resumo da resposta:**
Nova versão do script com cabeçalhos compatíveis com as chaves novas do Supabase (`Bearer` só para chaves JWT), retentativas na chamada à API e erros mais detalhados no log.

**O que funcionou:**
Após o ajuste, o workflow terminou com ícone verde e gravou 546 registros (6 cidades × 91 dias).

**O que precisou ajuste:**
O primeiro script tinha comentários, e o grupo pediu código sem comentários em todos os arquivos seguintes.

---

## Interação 6: Workflow do GitHub Actions

**Data:** 12-11-2026
**Objetivo:** Criar o arquivo `update-data.yml` e executá-lo.

**Prompt enviado à IA:**

```
é pra criar isso ? dentro do git ? com oque dentro? se puder mandar oque colocar dentro, lembre-se de nunca colocar comentarios nos codigos
COmo chega nisso? é dentro do supabase?
[print da tela Actions permissions] ?
apareceu isso
```

**Resumo da resposta:**
Workflow com `schedule`, `workflow_dispatch`, `permissions: contents: read`, `concurrency` e `timeout-minutes`, além das instruções para executá-lo na aba Actions.

**O que funcionou:**
Usado sem alterações. A execução manual terminou verde em 19 segundos.

**O que precisou ajuste:**
O grupo abriu primeiro a tela de permissões do Actions (em Settings) em vez da aba Actions. A IA esclareceu a diferença.

---

## Interação 7: Teste da API REST do Supabase

**Data:** 12-11-2026
**Objetivo:** Gerar a evidência da URL REST retornando JSON, exigida na entrega.

**Prompt enviado à IA:**

```
Como assim?
Como que monto esse link
[print do erro "No API key found in request"]
```

**Resumo da resposta:**
A IA explicou como montar a URL (`/rest/v1/clima_diario?select=*&limit=3&apikey=PUBLISHABLE_KEY`) e o que cada resposta significa.

**O que funcionou:**
Depois de colar a publishable key, a URL retornou JSON com dados reais.

**O que precisou ajuste:**
A primeira tentativa foi feita com `apikey=` vazio, e o Supabase respondeu "No API key found in request".

---

## Interação 8: Painel (index.html)

**Data:** 12-11-2026
**Objetivo:** Criar o painel que consome a API REST do Supabase.

**Prompt enviado à IA:**

```
Pode me mandar o codigo Html, o nome e / que colocar no git
quais linhas estão o SUPABASE_URL e SUPABASE_KEY pra alterar ?
n é melhor criar um js separado ?
Me mande oque colocar em app.js
```

**Resumo da resposta:**
A IA gerou o `index.html` com cards, gráfico (Chart.js), tabela, filtro de cidade, última atualização lida de `execucoes` e `escapeHtml()`. Depois separou o JavaScript em `app.js`, com a URL e a chave em `config.js`.

**O que funcionou:**
A estrutura do painel e a separação em arquivos.

**O que precisou ajuste:**
Ver Interação 9.

---

## Interação 9: Publicação no GitHub Pages e erros do app.js

**Data:** 12-11-2026
**Objetivo:** Publicar o painel e corrigir o erro que o impedia de carregar.

**Prompt enviado à IA:**

```
como abre o link do pages
[print: "Upgrade or make this repository public to enable Pages"]
Está carregando infinitamente, e n aparece nd em cidade
Eu tenho app.js e config.js, os 2 linkados no html no final, me manda o email do professor gil
dnv
Agora foi certin
```

**Resumo da resposta:**
A IA explicou que o Pages gratuito exige repositório público e orientou o diagnóstico pelo Console do navegador (F12). Identificou que o `app.js` estava cortado na linha 140 e, depois da primeira correção, que sobrou conteúdo no final do arquivo. Forneceu o arquivo completo para substituição.

**O que funcionou:**
Com o `app.js` completo e o repositório público, o painel carregou os dados.

**O que precisou ajuste:**
O repositório estava privado. O `app.js` colado ficou truncado (`SyntaxError` na linha 140) e depois com sobra de texto (linha 173), e a causa foi a cópia de um bloco de código longo. A solução foi apagar o arquivo e colar tudo de uma vez.

---

## Interação 10: Melhoria visual e interatividade

**Data:** 12-11-2026
**Objetivo:** Deixar o painel mais colorido e interativo.

**Prompt enviado à IA:**

```
[print do painel] Tudo certo? queria deixar mais bonito, menos mono cromatico e mais interativo
ficou top
```

**Resumo da resposta:**
Nova versão de `index.html` e `app.js` com seleção de várias cidades com cores próprias, abas de variável e período, gráfico de ranking clicável, cards coloridos e tabela ordenável.

**O que funcionou:**
Funcionou após atualizar os dois arquivos, mantendo o `config.js`.

**O que precisou ajuste:**
Nada.

---

## Interação 11: README e documentação

**Data:** 12-11-2026
**Objetivo:** Gerar o README, o histórico de IA e a reflexão.

**Prompt enviado à IA:**

```
Não consigo mudar o nome, aparece que ja existe, ja convidei o gil, dps disso como faço esses?
como arruma aqui
[pedido de reescrita do primeiro prompt para a API correta]
Manda o ai-interaction.md todo mudado e novo
[pedido para trocar o primeiro prompt pelo da POWER]
```

**Resumo da resposta:**
A IA explicou que o nome da organização já estava em uso por outro grupo (conflito de número) e gerou o `README.md`, o `ai-interaction.md` e o `reflexao.md`. Ao ser pedida para reescrever o primeiro prompt com a API correta, recomendou manter o prompt original no registro e documentar a troca de API de forma transparente, o que levou à junção das duas mensagens na Interação 1.

**O que funcionou:**
A estrutura dos três documentos.

**O que precisou ajuste:**
O grupo completou a divisão de tarefas, o número do grupo e as datas, e escreveu a avaliação final com as próprias palavras.

---

## Resumo final

**Total de interações:** 11 (agrupadas por tema; cada bloco reúne vários prompts)

**Principais contribuições da IA:**

- Plano de trabalho e roteiro de configuração de Supabase, GitHub, Secrets e Pages
- Geração do `setup.sql`, do `fetch_nasa.py`, do workflow e do painel
- Diagnóstico de erros a partir de prints, do Console do navegador e dos logs

**Principais limitações encontradas:**

- Descreveu campos da API DONKI/MPC de memória, sem testar o endpoint
- A primeira versão do script usava um cabeçalho incompatível com as chaves novas do Supabase
- Os arquivos longos colados no GitHub chegaram truncados, causando erro de sintaxe no painel
- Não tinha como saber de conflitos de nome e de número de grupo que só aparecem na planilha da turma

**Avaliação geral do uso da IA:**
A IA acelerou a montagem do pipeline completo e do painel e ajudou a diagnosticar erros a partir de prints. Em contrapartida, o código precisou ser testado e conferido pelo grupo: houve erro de compatibilidade nas chaves do Supabase, um arquivo truncado na colagem e informação não verificada sobre a primeira API. Os conflitos de organização e de número de grupo só puderam ser resolvidos com a planilha e o professor.
