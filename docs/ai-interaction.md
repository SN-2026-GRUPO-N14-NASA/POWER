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

## Interação 1 — Leitura do enunciado, escolha da API e planejamento

**Data:** 12-11-2026 **Objetivo:** Entender os requisitos da atividade e definir a estrutura do projeto antes de escrever código.

**Prompt enviado à IA:**

```
[Anexados: Atividade_Avaliativa_3_Trim.pdf, ai-interaction.md]

DONKI / MPC
Cruzamentos da magnetopausa: quando o vento solar penetra o campo magnético terrestre
essa é minha API, pode me instruir e me ajudar a fazer essa atividade ?
```

```
Na vdd, vou usar outra API
POWER
Dados climatológicos e energia solar global por coordenada geográfica
é essa aqui
```

**Resumo da resposta:** A IA leu o enunciado e propôs a ordem de trabalho (contas, banco, secrets, script, workflow, painel e documentação), já com um `setup.sql`, um `fetch_nasa.py` e um workflow para a DONKI/MPC. Depois da troca para a POWER, refez tudo: tabela `clima_diario` com `UNIQUE (local, data)`, tabela `execucoes`, script que percorre uma lista de cidades e trata o valor `-999` como `NULL`, e workflow sem `NASA_API_KEY`, já que a POWER não exige chave.

**O que funcionou:** A ordem de trabalho, a modelagem do banco (UNIQUE, RLS e GRANTs), a deduplicação por (`local`, `data`) antes do upsert e o tratamento dos valores ausentes.

**O que precisou ajuste:** O código da DONKI/MPC foi descartado com a troca de API, e os campos dessa API tinham sido descritos de memória, sem teste no endpoint. O script da POWER também precisou de correção no cabeçalho de autenticação (Interação 3).

---

## Interação 2 — Configuração do Supabase, GitHub e Secrets

**Data:** 12-11-2026 **Objetivo:** Montar a infraestrutura (organização, repositório, projeto, credenciais) e integrar as plataformas.

**Prompt enviado à IA:**

```
PReciso do passo a passo, desde o SupaBase até o git hub e dps integrar tudo
```

```
[print da planilha de reserva] As pessoas colocaram essas coisas ai, organização e o repositorio
```

```
[print do repositório] onde vou pra salvar o SQL no repositorio?
```

```
[print da tela API Keys] estou aq pra pegar as credenciais, oque faço agora ?
```

```
[print do formulário New secret] Project URL ?
```

```
[print da tela Data API] isso?
```

```
Acabei de colocar a secret key no repositorio do git, proximo passo?
```

**Resumo da resposta:** A IA entregou um roteiro em cinco partes (Supabase, GitHub, Secrets, execução do workflow e entrega) e explicou como preencher a planilha de reserva. Apontou que o repositório estava na conta pessoal, com o nome da organização, e que devia ser transferido para a organização e renomeado para `POWER`. Indicou onde achar a URL do projeto, a publishable key e a secret key, e como cadastrar os Secrets.

**O que funcionou:** A separação entre a chave pública (usada no painel) e a secret key (somente nos Secrets do GitHub), e a orientação de criar os arquivos pela interface web do GitHub.

**O que precisou ajuste:** A URL copiada da tela Data API termina em `/rest/v1/` e precisou ser cortada, senão as chamadas dariam erro 404. O nome da organização estava com `N14` e o número 14 já era usado por outro grupo na planilha, então o grupo passou a adotar o número 15.

---

## Interação 3 — Script de coleta e workflow do GitHub Actions

**Data:** 12-11-2026 **Objetivo:** Obter o `fetch_nasa.py` e o `update-data.yml` funcionando e executar o pipeline.

**Prompt enviado à IA:**

```
Manda os scripts/fetch_nasa.py dnv e arrumado de novo pra mim
```

```
é pra criar isso ? dentro do git ? com oque dentro? se puder mandar oque colocar dentro, lembre-se de nunca colocar comentarios nos codigos
```

```
COmo chega nisso? é dentro do supabase?
```

```
[print da tela Actions permissions] ?
```

```
apareceu isso
```

**Resumo da resposta:** A IA enviou uma nova versão do script, com cabeçalhos compatíveis com as chaves novas do Supabase (`Bearer` só para chaves JWT), três tentativas na chamada à API e erros mais detalhados no log. Entregou também o workflow, com `schedule`, `workflow_dispatch`, `permissions: contents: read`, `concurrency` e `timeout-minutes`, e explicou que a aba Actions fica no GitHub, não no Supabase.

**O que funcionou:** Os arquivos foram usados sem alterações. A execução manual terminou com ícone verde em 19 segundos e gravou 546 registros (6 cidades × 91 dias).

**O que precisou ajuste:** A primeira versão do script usava o cabeçalho `Authorization: Bearer` mesmo com as chaves novas, que não são JWT. O grupo também abriu primeiro a tela de permissões do Actions (em Settings) em vez da aba Actions, e a IA esclareceu a diferença.

---

## Interação 4 — Validação dos dados pela API REST

**Data:** 12-11-2026 **Objetivo:** Gerar a evidência da URL REST do Supabase retornando JSON, exigida na entrega.

**Prompt enviado à IA:**

```
Como assim?
```

```
Como que monto esse link
```

```
[print do erro "No API key found in request"]
```

```
[print do JSON retornado]
```

**Resumo da resposta:** A IA explicou como montar a URL (`/rest/v1/clima_diario?select=*&limit=3&apikey=PUBLISHABLE_KEY`) e o que significa cada tipo de resposta. Ao ver o erro do print, apontou que o parâmetro `apikey=` estava vazio.

**O que funcionou:** Depois de colar a publishable key, a URL retornou JSON com dados reais, o que confirmou que o RLS e os GRANTs de leitura estavam corretos.

**O que precisou ajuste:** A primeira tentativa foi feita com `apikey=` sem valor, e o Supabase respondeu "No API key found in request".

---

## Interação 5 — Painel, GitHub Pages e correção do app.js

**Data:** 12-11-2026 **Objetivo:** Criar o painel, publicá-lo no GitHub Pages e corrigir o erro que impedia o carregamento.

**Prompt enviado à IA:**

```
Pode me mandar o codigo Html, o nome e / que colocar no git
```

```
quais linhas estão o SUPABASE_URL e SUPABASE_KEY pra alterar ?
```

```
n é melhor criar um js separado ?
```

```
Me mande oque colocar em app.js
```

```
como abre o link do pages
```

```
[print: "Upgrade or make this repository public to enable Pages"]
```

```
Está carregando infinitamente, e n aparece nd em cidade
```

```
Eu tenho app.js e config.js, os 2 linkados no html no final, me manda o email do professor gil
```

```
dnv
```

```
Agora foi certin
```

**Resumo da resposta:** A IA gerou o `index.html` com cards, gráfico (Chart.js), tabela, filtro de cidade, última atualização lida da tabela `execucoes` e `escapeHtml()`, e depois separou o JavaScript em `app.js`, com a URL e a chave em `config.js`. Explicou que o Pages gratuito exige repositório público e orientou o diagnóstico pelo Console do navegador (F12). Identificou que o `app.js` estava cortado na linha 140 e, depois da primeira correção, que sobrou texto no final do arquivo (linha 173), e forneceu o arquivo completo para substituição.

**O que funcionou:** A estrutura do painel e a separação em três arquivos. Com o `app.js` completo e o repositório público, o painel carregou os dados.

**O que precisou ajuste:** O repositório estava privado e o Pages não habilitava. O `app.js` colado ficou truncado, causando `SyntaxError`, porque a cópia de um bloco de código longo não veio inteira. A solução foi apagar o arquivo e colar tudo de uma vez.

---

## Interação 6 — Melhoria visual e interatividade do painel

**Data:** 12-11-2026 **Objetivo:** Deixar o painel mais colorido e interativo.

**Prompt enviado à IA:**

```
[print do painel] Tudo certo? queria deixar mais bonito, menos mono cromatico e mais interativo
```

```
ficou top
```

**Resumo da resposta:** A IA confirmou que o painel já cumpria os requisitos do enunciado e entregou uma nova versão de `index.html` e `app.js`, com seleção de várias cidades com cores próprias, abas de variável e de período, gráfico de ranking clicável, cards coloridos e tabela ordenável pelo título da coluna.

**O que funcionou:** A nova versão funcionou após substituir os dois arquivos, mantendo o `config.js`.

**O que precisou ajuste:** Nada.

---

## Interação 7 — README, documentação e preparação para o seminário

**Data:** 12-11-2026 **Objetivo:** Gerar o README, o histórico de IA, a reflexão e o tutorial, e se preparar para a apresentação.

**Prompt enviado à IA:**

```
Não consigo mudar o nome, aparece que ja existe, ja convidei o gil, dps disso como faço esses?
```

```
como arruma aqui
```

```
Manda o ai-interaction.md todo mudado e novo
```

```
[pedidos para trocar o primeiro prompt pelo da POWER e para reescrever os prompts do registro]
```

```
quero algo mais assim no ai-interaction.md
```

```
Vamos comelar onde preferir ent
```

```
tutorial.pdf
```

**Resumo da resposta:** A IA explicou que o nome da organização já estava em uso por outro grupo (conflito de número) e gerou o `README.md`, o `ai-interaction.md` e o `reflexao.md`. Ao ser pedida para reescrever os prompts, recomendou manter o registro fiel ao que foi enviado e documentar a troca de API de forma transparente. Depois montou um roteiro de estudo (fluxo Actions → Supabase → Pages, decisões de projeto e perguntas prováveis da banca) e gerou o `tutorial.pdf`, com 12 páginas.

**O que funcionou:** A estrutura dos documentos e o roteiro de estudo para o seminário.

**O que precisou ajuste:** Os nomes de organização e os links do tutorial dependem do número de grupo definido, e o grupo precisou conferir e ajustar os textos para refletir o que foi feito de fato.

---

## Resumo final

**Total de interações:** 7 (agrupadas por tema; cada bloco reúne vários prompts)

**Principais contribuições da IA:**

- Plano de trabalho e roteiro de configuração de Supabase, GitHub, Secrets e Pages
- Geração do `setup.sql`, do `fetch_nasa.py`, do workflow e do painel
- Diagnóstico de erros a partir de prints, do Console do navegador e dos logs do Actions
- Geração da documentação (README, tutorial) e roteiro de estudo para o seminário

**Principais limitações encontradas:**

- Descreveu campos da API DONKI/MPC de memória, sem testar o endpoint
- A primeira versão do script usava um cabeçalho incompatível com as chaves novas do Supabase
- Os arquivos longos colados no GitHub chegaram truncados, causando erro de sintaxe no painel
- Não tinha como saber de conflitos de nome e de número de grupo que só aparecem na planilha da turma

**Avaliação geral do uso da IA:**
A IA acelerou a montagem do pipeline completo e do painel e ajudou a diagnosticar erros a partir de prints. Em contrapartida, o código precisou ser testado e conferido pelo grupo: houve erro de compatibilidade nas chaves do Supabase, um arquivo truncado na colagem e informação não verificada sobre a primeira API. Os conflitos de organização e de número de grupo só puderam ser resolvidos com a planilha e o professor.
