const CORES_LOCAIS = ["#ff6b6b", "#4dabf7", "#51cf66", "#fcc419", "#cc5de8", "#ff922b", "#20c997", "#f06595"];

const VARIAVEIS = {
  temp_media: { rotulo: "Temperatura média", unidade: "°C", casas: 1 },
  precipitacao: { rotulo: "Precipitação", unidade: "mm/dia", casas: 2 },
  radiacao_solar: { rotulo: "Radiação solar", unidade: "kWh/m²/dia", casas: 2 },
  vento: { rotulo: "Vento a 2 m", unidade: "m/s", casas: 2 },
  umidade: { rotulo: "Umidade relativa", unidade: "%", casas: 1 }
};

let dados = [];
let locais = [];
let selecionados = new Set();
let variavel = "temp_media";
let dias = 9999;
let ordem = { campo: "data", asc: false };
let grafico = null;
let ranking = null;

function escapeHtml(valor) {
  return String(valor === null || valor === undefined ? "" : valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatar(valor, casas) {
  if (valor === null || valor === undefined) return "-";
  return Number(valor).toFixed(casas);
}

function formatarData(iso) {
  const partes = String(iso).split("-");
  return partes.length === 3 ? partes[2] + "/" + partes[1] + "/" + partes[0] : iso;
}

function paraIso(d) {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mes + "-" + dia;
}

function hexParaRgba(hex, alfa) {
  const n = parseInt(hex.slice(1), 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alfa + ")";
}

function corDoLocal(nome) {
  return CORES_LOCAIS[locais.indexOf(nome) % CORES_LOCAIS.length];
}

async function consultar(caminho) {
  const resposta = await fetch(SUPABASE_URL + "/rest/v1/" + caminho, {
    headers: { apikey: SUPABASE_KEY }
  });
  if (!resposta.ok) {
    throw new Error("Falha ao consultar o banco (" + resposta.status + ")");
  }
  return resposta.json();
}

function validos(lista) {
  return lista.filter(function (v) { return v !== null && v !== undefined; }).map(Number);
}

function media(lista) {
  const v = validos(lista);
  if (!v.length) return null;
  return v.reduce(function (a, b) { return a + b; }, 0) / v.length;
}

function soma(lista) {
  const v = validos(lista);
  if (!v.length) return null;
  return v.reduce(function (a, b) { return a + b; }, 0);
}

function minimo(lista) {
  const v = validos(lista);
  return v.length ? Math.min.apply(null, v) : null;
}

function maximo(lista) {
  const v = validos(lista);
  return v.length ? Math.max.apply(null, v) : null;
}

function dentroDoPeriodo(lista) {
  if (!lista.length) return lista;
  const datas = lista.map(function (d) { return d.data; });
  const ultima = datas.reduce(function (a, b) { return a > b ? a : b; });
  const fim = new Date(ultima + "T00:00:00");
  fim.setDate(fim.getDate() - (dias - 1));
  const inicio = paraIso(fim);
  return lista.filter(function (d) { return d.data >= inicio; });
}

function registrosSelecionados() {
  return dentroDoPeriodo(dados).filter(function (d) { return selecionados.has(d.local); });
}

function atualizarChips() {
  const caixa = document.getElementById("chipsLocais");
  const botoes = locais.map(function (nome) {
    const ativo = selecionados.has(nome) ? " ativo" : "";
    return '<button class="chip' + ativo + '" style="--cor:' + corDoLocal(nome) + '" data-local="' + escapeHtml(nome) + '">' +
      '<i style="background:' + corDoLocal(nome) + '"></i>' + escapeHtml(nome) + "</button>";
  });
  const todas = selecionados.size === locais.length ? " ativo" : "";
  botoes.push('<button class="' + todas.trim() + '" data-todas="1">Todas</button>');
  caixa.innerHTML = botoes.join("");
}

function atualizarAbas() {
  document.querySelectorAll("#abasVariavel button").forEach(function (b) {
    b.classList.toggle("ativo", b.dataset.var === variavel);
  });
  document.querySelectorAll("#abasPeriodo button").forEach(function (b) {
    b.classList.toggle("ativo", Number(b.dataset.dias) === dias);
  });
}

function atualizarCards(lista) {
  const temps = lista.map(function (d) { return d.temp_media; });
  const temp = media(temps);
  const porCidade = Array.from(selecionados).map(function (nome) {
    return soma(lista.filter(function (d) { return d.local === nome; }).map(function (d) { return d.precipitacao; }));
  }).filter(function (v) { return v !== null; });
  const chuva = media(porCidade);
  const rads = lista.map(function (d) { return d.radiacao_solar; });
  const rad = media(rads);
  const umid = media(lista.map(function (d) { return d.umidade; }));

  document.getElementById("cardTemp").textContent = temp === null ? "-" : formatar(temp, 1) + " °C";
  document.getElementById("detTemp").textContent = temp === null ? "" : "mín " + formatar(minimo(temps), 1) + " · máx " + formatar(maximo(temps), 1) + " °C";
  document.getElementById("cardChuva").textContent = chuva === null ? "-" : formatar(chuva, 1) + " mm";
  document.getElementById("detChuva").textContent = selecionados.size + " cidade(s) no período";
  document.getElementById("cardRad").textContent = rad === null ? "-" : formatar(rad, 2) + " kWh/m²";
  document.getElementById("detRad").textContent = rad === null ? "" : "pico " + formatar(maximo(rads), 2) + " kWh/m²";
  document.getElementById("cardUmid").textContent = umid === null ? "-" : formatar(umid, 1) + " %";
  document.getElementById("detUmid").textContent = lista.length + " registros analisados";
}

function atualizarGrafico(lista) {
  const info = VARIAVEIS[variavel];
  const nomes = Array.from(selecionados).sort();
  const datas = Array.from(new Set(lista.map(function (d) { return d.data; }))).sort();
  document.getElementById("tituloGrafico").textContent = info.rotulo + " (" + info.unidade + ") por dia";

  const tipo = variavel === "precipitacao" ? "bar" : "line";
  const datasets = nomes.map(function (nome) {
    const mapa = {};
    lista.filter(function (d) { return d.local === nome; }).forEach(function (d) { mapa[d.data] = d[variavel]; });
    const cor = corDoLocal(nome);
    return {
      label: nome,
      data: datas.map(function (dt) { return mapa[dt] === undefined ? null : mapa[dt]; }),
      borderColor: cor,
      backgroundColor: tipo === "bar" ? hexParaRgba(cor, 0.75) : hexParaRgba(cor, nomes.length === 1 ? 0.18 : 0.05),
      fill: nomes.length === 1 && tipo === "line",
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0.3,
      spanGaps: true
    };
  });

  if (grafico) grafico.destroy();
  grafico = new Chart(document.getElementById("grafico"), {
    type: tipo,
    data: { labels: datas.map(formatarData), datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: "#eef2fb", usePointStyle: true } },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return ctx.dataset.label + ": " + formatar(ctx.parsed.y, info.casas) + " " + info.unidade;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: "#9aa8c7", maxTicksLimit: 12 }, grid: { color: "rgba(37,49,79,0.6)" } },
        y: { ticks: { color: "#9aa8c7" }, grid: { color: "rgba(37,49,79,0.6)" }, title: { display: true, text: info.unidade, color: "#9aa8c7" } }
      }
    }
  });
}

function atualizarRanking() {
  const info = VARIAVEIS[variavel];
  const periodo = dentroDoPeriodo(dados);
  const itens = locais.map(function (nome) {
    const v = media(periodo.filter(function (d) { return d.local === nome; }).map(function (d) { return d[variavel]; }));
    return { nome: nome, valor: v };
  }).sort(function (a, b) { return (b.valor || 0) - (a.valor || 0); });

  document.getElementById("tituloRanking").textContent = "Média de " + info.rotulo.toLowerCase() + " por cidade (" + info.unidade + ")";

  if (ranking) ranking.destroy();
  ranking = new Chart(document.getElementById("ranking"), {
    type: "bar",
    data: {
      labels: itens.map(function (i) { return i.nome; }),
      datasets: [{
        data: itens.map(function (i) { return i.valor; }),
        backgroundColor: itens.map(function (i) { return hexParaRgba(corDoLocal(i.nome), selecionados.has(i.nome) ? 0.95 : 0.35); }),
        borderColor: itens.map(function (i) { return corDoLocal(i.nome); }),
        borderWidth: 1.5,
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      onClick: function (evento, elementos) {
        if (!elementos.length) return;
        alternarLocal(itens[elementos[0].index].nome);
      },
      onHover: function (evento, elementos) {
        evento.native.target.style.cursor = elementos.length ? "pointer" : "default";
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) { return formatar(ctx.parsed.x, info.casas) + " " + info.unidade; }
          }
        }
      },
      scales: {
        x: { ticks: { color: "#9aa8c7" }, grid: { color: "rgba(37,49,79,0.6)" } },
        y: { ticks: { color: "#eef2fb" }, grid: { display: false } }
      }
    }
  });
}

function atualizarTabela(lista) {
  const campo = ordem.campo;
  const copia = lista.slice().sort(function (a, b) {
    const x = a[campo];
    const y = b[campo];
    if (x === null || x === undefined) return 1;
    if (y === null || y === undefined) return -1;
    let r;
    if (typeof x === "number" && typeof y === "number") {
      r = x - y;
    } else {
      r = String(x).localeCompare(String(y), "pt-BR");
    }
    return ordem.asc ? r : -r;
  });
  const linhas = copia.map(function (d) {
    return "<tr>" +
      "<td>" + escapeHtml(formatarData(d.data)) + "</td>" +
      '<td><span class="pontinho" style="background:' + corDoLocal(d.local) + '"></span>' + escapeHtml(d.local) + "</td>" +
      "<td>" + escapeHtml(formatar(d.temp_media, 1)) + "</td>" +
      "<td>" + escapeHtml(formatar(d.precipitacao, 2)) + "</td>" +
      "<td>" + escapeHtml(formatar(d.radiacao_solar, 2)) + "</td>" +
      "<td>" + escapeHtml(formatar(d.vento, 2)) + "</td>" +
      "<td>" + escapeHtml(formatar(d.umidade, 1)) + "</td>" +
      "</tr>";
  });
  document.getElementById("corpoTabela").innerHTML = linhas.join("");
}

function atualizarTela() {
  const lista = registrosSelecionados();
  atualizarChips();
  atualizarAbas();
  atualizarCards(lista);
  atualizarGrafico(lista);
  atualizarRanking();
  atualizarTabela(lista);
}

function alternarLocal(nome) {
  if (selecionados.has(nome)) {
    if (selecionados.size === 1) return;
    selecionados.delete(nome);
  } else {
    selecionados.add(nome);
  }
  atualizarTela();
}

async function carregarUltimaAtualizacao() {
  const alvo = document.getElementById("ultimaAtualizacao");
  try {
    const lista = await consultar("execucoes?select=executado_em,status,registros_processados&order=executado_em.desc&limit=1");
    if (!lista.length) {
      alvo.textContent = "Nenhuma execução registrada";
      return;
    }
    const exec = lista[0];
    const quando = new Date(exec.executado_em).toLocaleString("pt-BR");
    alvo.innerHTML = "Última atualização do pipeline:<br><strong>" + escapeHtml(quando) +
      "</strong> (" + escapeHtml(exec.status) + ", " + escapeHtml(exec.registros_processados) + " registros)";
  } catch (erro) {
    alvo.textContent = "Última atualização indisponível";
  }
}

async function iniciar() {
  try {
    dados = await consultar("clima_diario?select=local,data,temp_media,precipitacao,radiacao_solar,vento,umidade&order=data.asc&limit=1000");
    if (!dados.length) {
      document.getElementById("mensagemErro").textContent = "Nenhum dado encontrado na tabela.";
      return;
    }
    locais = Array.from(new Set(dados.map(function (d) { return d.local; }))).sort();
    selecionados = new Set([locais[0]]);
    atualizarTela();
  } catch (erro) {
    document.getElementById("mensagemErro").textContent = erro.message;
  }
  carregarUltimaAtualizacao();
}

document.getElementById("chipsLocais").addEventListener("click", function (e) {
  const botao = e.target.closest("button");
  if (!botao) return;
  if (botao.dataset.todas) {
    if (selecionados.size === locais.length) {
      selecionados = new Set([locais[0]]);
    } else {
      selecionados = new Set(locais);
    }
    atualizarTela();
    return;
  }
  alternarLocal(botao.dataset.local);
});

document.getElementById("abasVariavel").addEventListener("click", function (e) {
  const botao = e.target.closest("button");
  if (!botao) return;
  variavel = botao.dataset.var;
  atualizarTela();
});

document.getElementById("abasPeriodo").addEventListener("click", function (e) {
  const botao = e.target.closest("button");
  if (!botao) return;
  dias = Number(botao.dataset.dias);
  atualizarTela();
});

document.querySelector("thead").addEventListener("click", function (e) {
  const th = e.target.closest("th");
  if (!th) return;
  const campo = th.dataset.campo;
  if (ordem.campo === campo) {
    ordem.asc = !ordem.asc;
  } else {
    ordem = { campo: campo, asc: campo === "local" };
  }
  atualizarTabela(registrosSelecionados());
});

iniciar();
