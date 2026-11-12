# NASA POWER: Pipeline de Clima e Energia Solar

Pipeline de dados completo com a API aberta NASA POWER: coleta automatizada com GitHub Actions, armazenamento em PostgreSQL no Supabase e painel web publicado no GitHub Pages.

- **Painel:** https://sn-2026-grupo-n14-nasa.github.io/POWER/
- **Repositório:** https://github.com/SN-2026-GRUPO-N14-NASA/POWER

## Integrantes e responsabilidades

| Integrante | Responsabilidade |
|---|---|
| Jakson José | [ajustar] |
| Nayro Ganzer | [ajustar] |

Divisão de áreas: pipeline, banco de dados, painel e documentação.

## A API

A NASA POWER (Prediction Of Worldwide Energy Resources) fornece dados meteorológicos e de energia solar por coordenada geográfica, derivados de satélites e modelos de reanálise.

- Endpoint: `https://power.larc.nasa.gov/api/temporal/daily/point`
- Chave de API: não exige
- Variáveis coletadas: temperatura a 2 m (`T2M`), precipitação corrigida (`PRECTOTCORR`), radiação solar na superfície (`ALLSKY_SFC_SW_DWN`), vento a 2 m (`WS2M`) e umidade relativa (`RH2M`)
- Valores ausentes vêm como `-999` e são gravados como `NULL`
- Cidades monitoradas: Marechal Cândido Rondon, Curitiba, Manaus, Porto Alegre, Recife e Brasília

## Arquitetura

```
GitHub Actions (agendado + manual)
        |
        v
scripts/fetch_nasa.py  --->  API NASA POWER
        |
        v  upsert em lotes (REST)
Supabase (PostgreSQL + RLS)
        |
        v  leitura pública com publishable key
index.html + app.js  (GitHub Pages)
```

- **Coleta:** o workflow `update-data.yml` roda todo dia às 06:00 UTC e também manualmente (`workflow_dispatch`), com `permissions: contents: read`, `concurrency` e `timeout-minutes`.
- **Normalização e deduplicação:** o script converte os dados, troca `-999` por `NULL` e deduplica por (`local`, `data`) antes do upsert, evitando o erro PostgreSQL 21000.
- **Banco:** tabela `clima_diario` com `UNIQUE (local, data)` e tabela `execucoes` (registros processados, lotes, erros e status: `concluido`, `erro_parcial`, `erro_critico`).
- **Segurança:** RLS ativo nas duas tabelas com política de leitura pública; `SELECT` para `anon` e `authenticated` e `ALL` para `service_role`. A secret key fica só nos Secrets do GitHub.
- **Painel:** consome a API REST do Supabase com a publishable key, com filtros de cidade, variável e período, ranking, tabela ordenável, última atualização lida de `execucoes` e `escapeHtml()` em todo valor externo.

## Estrutura do repositório

```
POWER/
├── index.html
├── app.js
├── config.js
├── README.md
├── scripts/fetch_nasa.py
├── sql/setup.sql
├── .github/workflows/update-data.yml
└── docs/
    ├── tutorial.pdf
    ├── ai-interaction.md
    ├── reflexao.md
    └── apresentacao.pdf
```

## Como configurar

1. Crie a organização e o repositório público no GitHub e a organização e o projeto no Supabase (região South America - São Paulo).
2. No SQL Editor do Supabase, execute `sql/setup.sql`.
3. No GitHub, em Settings > Secrets and variables > Actions, crie `SUPABASE_URL` (somente `https://ID.supabase.co`) e `SUPABASE_SERVICE_KEY` (secret key).
4. Em `config.js`, informe a URL do projeto e a publishable key.
5. Em Actions, execute **Atualizar dados** e confirme o ícone verde.
6. Em Settings > Pages, publique a branch `main`, pasta `/ (root)`.

## Uso de IA generativa

O grupo utilizou o Claude (Anthropic) como apoio. Os prompts e a análise crítica estão em `docs/ai-interaction.md` e `docs/reflexao.md`.
