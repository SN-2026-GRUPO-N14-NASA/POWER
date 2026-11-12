# Histórico de Interação com IA

## Informações gerais

| Campo | Valor |
|-|-|
| **Grupo** | [ajustar número] |
| **Integrantes** | Jakson José, Nayro Ganzer |
| **API NASA escolhida** | POWER |
| **IA utilizada** | Claude |
| **Data de início** | 12-11-2026 |
| **Data de conclusão** | [ajustar] |

---

## Interação 1: Escolha da API e plano geral

**Data:** 12-11-2026
**Objetivo:** Entender a atividade e receber um plano de execução para a API escolhida.

**Prompt enviado à IA:**

```
[PDF da atividade anexado] DONKI / MPC. Cruzamentos da magnetopausa: quando o vento solar penetra o campo magnético terrestre. essa é minha API, pode me instruir e me ajudar a fazer essa atividade ?
```

**Resumo da resposta:**
A IA apresentou um plano em etapas (contas, banco, secrets, script, workflow, painel e documentação), um `setup.sql`, um `fetch_nasa.py` e um workflow para a DONKI/MPC.

**O que funcionou:**
A ordem de trabalho e a estrutura do `setup.sql` (tabelas, UNIQUE, RLS e GRANTs).

**O que precisou ajuste:**
O grupo trocou de API logo em seguida, então o código para a MPC não foi usado. Os campos da MPC foram descritos de memória, sem teste no endpoint.

---

## Interação 2: Troca para a API POWER

**Data:** 12-11-2026
**Objetivo:** Adaptar o pipeline para a NASA POWER.

**Prompt enviado à IA:**

```
Na vdd, vou usar outra API. POWER. Dados climatológicos e energia solar global por coordenada geográfica. é essa aqui
```

**Resumo da resposta:**
A IA gerou um novo `setup.sql` (`clima_diario` com `UNIQUE (local, data)` e `execucoes`), o `fetch_nasa.py` para várias cidades e o workflow sem `NASA_API_KEY`.

**O que funcionou:**
A modelagem, a deduplicação por (`local`, `data`) e o tratamento de `-999` como `NULL`.

**O que precisou ajuste:**
O cabeçalho `Authorization: Bearer` do script não funciona com as chaves novas do Supabase (`sb_secret_`). Isso foi corrigido na interação 5.

---

## Interação 3: Passo a passo Supabase, GitHub e integração

**Data:** 12-11-2026
**Objetivo:** Obter o roteiro completo de configuração das plataformas.

**Prompt enviado à IA:**

```
PReciso do passo a passo, desde o SupaBase até o git hub e dps integrar tudo
```

**Resumo da resposta:**
Roteiro em cinco partes (Supabase, GitHub, Secrets, execução do workflow e entrega).

**O que funcionou:**
A sequência de passos, o teste da API REST e a lista de erros comuns.

**O que precisou ajuste:**
O repositório estava na conta pessoal e privado, e a IA apontou a necessidade de transferir, renomear e tornar público (exigência do GitHub Pages gratuito).

---

## Interação 4: Credenciais do Supabase e Secrets

**Data:** 12-11-2026
**Objetivo:** Localizar a Project URL e as chaves e colocá-las nos Secrets.

**Prompt enviado à IA:**

```
Project URL ? / isso? / Acabei de colocar a secret key no repositorio do git, proximo passo?
```

**Resumo da resposta:**
A IA explicou onde achar a URL (somente `https://ID.supabase.co`, sem `/rest/v1/`), a publishable key e a secret key, e como criar os Secrets.

**O que funcionou:**
A orientação de separar chave pública e secret key.

**O que precisou ajuste:**
A URL da tela Data API termina em `/rest/v1/`, e a IA alertou para removê-la do secret.

---

## Interação 5: Script corrigido

**Data:** 12-11-2026
**Objetivo:** Obter o `fetch_nasa.py` completo e corrigido.

**Prompt enviado à IA:**

```
Manda os scripts/fetch_nasa.py dnv e arrumado de novo pra mim
```

**Resumo da resposta:**
Nova versão do script com cabeçalhos compatíveis com as chaves novas (`Bearer` apenas para chaves JWT), retentativas na API e logs mais completos.

**O que funcionou:**
O workflow terminou com ícone verde e 546 registros gravados.

**O que precisou ajuste:**
O script veio com comentários, e o grupo pediu código sem comentários.

---

## Interação 6: Workflow do GitHub Actions

**Data:** 12-11-2026
**Objetivo:** Criar o arquivo `update-data.yml`.

**Prompt enviado à IA:**

```
é pra criar isso ? dentro do git ? com oque dentro? se puder mandar oque colocar dentro, lembre-se de nunca colocar comentarios nos codigos
```

**Resumo da resposta:**
Workflow com `schedule`, `workflow_dispatch`, `permissions`, `concurrency` e `timeout-minutes`.

**O que funcionou:**
Usado sem alterações, com execução manual bem-sucedida.

**O que precisou ajuste:**
Nada.

---

## Interação 7: Painel (index.html)

**Data:** 12-11-2026
**Objetivo:** Criar o painel que consome a API REST do Supabase.

**Prompt enviado à IA:**

```
Pode me mandar o codigo Html, o nome e / que colocar no git
```

**Resumo da resposta:**
`index.html` com cards, gráfico (Chart.js), tabela, filtro de cidade, última atualização e `escapeHtml()`.

**O que funcionou:**
A estrutura do painel, depois separada em `config.js` e `app.js`.

**O que precisou ajuste:**
O repositório privado impedia o Pages. Depois, o `app.js` colado ficou cortado no meio (`SyntaxError` na linha 140) e foi refeito colando o arquivo inteiro.

---

## Interação 8: Melhoria visual e interatividade

**Data:** 12-11-2026
**Objetivo:** Deixar o painel mais colorido e interativo.

**Prompt enviado à IA:**

```
Tudo certo? queria deixar mais bonito, menos mono cromatico e mais interativo
```

**Resumo da resposta:**
Nova versão com seleção de várias cidades coloridas, abas de variável e período, gráfico de ranking clicável e tabela ordenável.

**O que funcionou:**
Funcionou após a atualização dos dois arquivos.

**O que precisou ajuste:**
Nada.

---

## Resumo final

**Total de interações:** [ajustar]

**Principais contribuições da IA:**

- Plano de trabalho e roteiro de configuração do Supabase, GitHub e Secrets
- `setup.sql`, `fetch_nasa.py`, workflow e painel
- Diagnóstico de erros a partir de prints e mensagens do Console

**Principais limitações encontradas:**

- Descreveu campos da API DONKI/MPC de memória, sem testar o endpoint
- Primeira versão do script usava cabeçalho incompatível com as chaves novas do Supabase
- Respostas longas coladas pelo grupo chegaram cortadas, gerando erro de sintaxe

**Avaliação geral do uso da IA:**
[escrever com as suas palavras]
