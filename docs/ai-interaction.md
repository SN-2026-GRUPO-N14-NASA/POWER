# Histórico de Interação com IA

## Informações gerais

| Campo | Valor |
|-|-|
| **Grupo** | 15 |
| **Integrantes** | Jakson José, Nayro Ganzer |
| **API NASA escolhida** | POWER (inicialmente DONKI/MPC, trocada no início do projeto) |
| **IA utilizada** | Claude (Anthropic) |
| **Data de início** | 12-11-2026 |
| **Data de conclusão** | 01-11-2026 |

---

## Interação 1: Plano geral para a atividade

**Data:** 12-11-2026
**Objetivo:** Entender a atividade e receber um plano de execução.

**Prompt enviado à IA:**

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
A IA propôs a ordem de trabalho (contas, banco, secrets, script, workflow, painel e documentação) e gerou um `setup.sql`, um `fetch_nasa.py` e um workflow para a DONKI/MPC.

**O que funcionou:**
A ordem de trabalho e a estrutura do `setup.sql` (tabelas, UNIQUE, RLS e GRANTs).

**O que precisou ajuste:**
O grupo trocou de API logo em seguida, então o código da MPC não foi usado. Os campos da MPC foram descritos de memória, sem teste no endpoint.

---

## Interação 2: Troca para a API POWER

**Data:** 12-11-2026
**Objetivo:** Adaptar o pipeline para a NASA POWER.

**Prompt enviado à IA:**

```
Na vdd, vou usar outra API
POWER
Dados climatológicos e energia solar global por coordenada geográfica
é essa aqui
```

**Resumo da resposta:**
A IA gerou um novo `setup.sql` (tabela `clima_diario` com `UNIQUE (local, data)` e tabela `execucoes`), o `fetch_nasa.py` para várias cidades, com `-999` tratado como `NULL`, e o workflow sem `NASA_API_KEY`, já que a POWER não exige chave.

**O que funcionou:**
A modelagem, a deduplicação por (`local`, `data`) e o tratamento de valores ausentes.

**O que precisou ajuste:**
O cabeçalho `Authorization: Bearer` do script não funciona com as chaves novas do Supabase. Foi corrigido na Interação 6.

---

## Interação 3: Passo a passo de Supabase, GitHub e integração

**Data:** 12-11-2026
**Objetivo:** Obter o roteiro completo de configuração das plataformas.

**Prompt enviado à IA:**

```
PReciso do passo a passo, desde o SupaBase até o git hub e dps integrar tudo
```

**Resumo da resposta:**
Roteiro em cinco partes: Supabase, GitHub, Secrets, execução do workflow e entrega, com lista de erros comuns e teste da API REST.

**O que funcionou:**
A sequência de passos e o teste da API REST.

**O que precisou ajuste:**
Nada nesta etapa. Os problemas apareceram nas interações seguintes.

---

## Interação 4: Planilha de reserva e organização do
