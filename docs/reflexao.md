# Reflexão sobre o uso de IA

**Grupo 15:** Jakson José e Nayro Ganzer
**API:** NASA POWER
**IA utilizada:** Claude (Anthropic)

---

## Onde a IA ajudou

A IA foi mais útil na organização do trabalho e na geração da base técnica do projeto. Ela dividiu a atividade em etapas (contas, banco, secrets, script, workflow, painel e documentação) e entregou o `setup.sql`, o `fetch_nasa.py`, o workflow do GitHub Actions e o painel. Também explicou decisões que precisávamos defender, como a chave `UNIQUE (local, data)`, a deduplicação antes do upsert para evitar o erro 21000 e o uso de `NULL` no lugar do valor `-999` da API.

Outra ajuda importante foi o diagnóstico de erros: quando enviamos prints do Console do navegador, do Supabase e do GitHub, a IA apontou a causa de problemas como o repositório privado impedindo o Pages e o `apikey` vazio na URL da API REST.

## Onde a IA errou

- Começamos com a API DONKI/MPC, e a IA descreveu os campos dessa API de memória, sem testar o endpoint. Esse código nem chegou a ser usado, porque trocamos de API.
- A primeira versão do `fetch_nasa.py` enviava o cabeçalho `Authorization: Bearer` mesmo com as chaves novas do Supabase (`sb_secret_`), que não são JWT, e isso poderia causar falha de autenticação.
- Os arquivos longos que ela gerou, quando colados no GitHub, chegaram cortados. O `app.js` ficou incompleto e deu `SyntaxError`, e o painel ficou em "Carregando..." para sempre.
- Ela não tinha como saber de conflitos que só aparecem na planilha da turma, como o número de grupo repetido e o nome de organização já em uso.
- O primeiro script veio com comentários, e tivemos que pedir código sem comentários.

## O que o grupo corrigiu

- Trocamos de API ainda no começo, antes de montar o banco, e a IA refez tudo para a POWER.
- Ajustamos os cabeçalhos do script para as chaves novas do Supabase e confirmamos o resultado com o workflow verde e os dados no Table Editor.
- Cortamos o `/rest/v1/` do `SUPABASE_URL`, que veio da tela Data API e causaria erro 404.
- Tornamos o repositório público para habilitar o GitHub Pages.
- Testamos a API REST direto no navegador e corrigimos o `apikey=` que estava vazio.
- Substituímos o `app.js` inteiro de uma vez, depois de olhar o Console (F12) e ver que o arquivo estava truncado.
- Conferimos o número do grupo e os nomes de organização e repositório com a planilha de reserva.

## Aprendizados

- Código gerado por IA precisa ser testado e lido antes de ser usado: o fato de parecer correto não garante que funcione no nosso ambiente.
- A secret key fica só nos Secrets do GitHub, e a publishable key é a única que vai ao navegador, porque o RLS e os GRANTs limitam o acesso.
- Prints, mensagens de erro e logs fazem muita diferença para a IA acertar o diagnóstico, por isso é melhor mandá-los do que descrever o problema só com palavras.
- Entender o fluxo (Actions busca, Supabase guarda e Pages mostra) é necessário para defender o projeto, e a IA ajudou a montar, mas a compreensão tem que ser nossa.

## Opinião do grupo

A Ia conseguiu ajudar sim e muito. As nossas principais dificuldades foram, como integrar a API, de que forma construir as tabelas no SQL e pequenos problemas com a conexão do repositório juntamente com o Supabase.
A IA teve um importante trabalho dentro disso tudo, auxiliando e ensinando como fazer.
Acho que o principal erro foi que ela não tinha informações certas de onde ir no Supabase e GitHub pra fazer certas coisas, mas pesquisando e procurando sozinhos conseguimos fazer isso tranquilamente
