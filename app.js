const ROTULOS = {
  temp_media: "Temperatura média (°C)",
  precipitacao: "Precipitação (mm/dia)",
  radiacao_solar: "Radiação solar (kWh/m²/dia)",
  vento: "Vento a 2 m (m/s)",
  umidade: "Umidade relativa (%)"
};

let dados = [];
let grafico = null;

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

async function consultar(caminho) {
  const resposta = await fetch(SUPABASE_URL + "/rest/v1/" + caminho, {
    headers: { apikey: SUPABASE_KEY }
  });
  if (!resposta.ok) {
    throw new Error("Falha ao consultar o banco (" + resposta.status + ")");
  }
  return resposta.json();
}

function media(lista) {
  const validos = lista.filter(function (v) { return v !== null && v !== undefined; });
  if (!validos.length) return null;
  return validos.reduce(function (a, b) { return a + Number(b); }, 0) / validos.length;
}

function soma(lista) {
  const validos = lista.filter(function (v) { return v !== null && v !== undefined; });
  if (!validos.length) return null;
  return validos.reduce(function (a, b) { return a + Number(b); }, 0);
}

function registrosDoLocal() {
  const local = document.getElementById("filtroLocal").value;
  return dados.filter(function (d) { return d.local === local; });
}

function atualizarCards(lista) {
  const temp = media(lista.map(function (d) { return d.temp_media; }));
  const chuva = soma(lista.map(function (d) { return d.precipitacao; }));
  const rad = media(lista.map(function (d) { return d.radiacao_solar; }));
  document.getElementById("cardTemp").textContent = temp === null ? "-" : formatar(temp, 1) + " °C";
  document.getElementById("cardChuva").textContent = chuva === null ? "-" : formatar(chuva, 1) + " mm";
  document.getElementById("cardRad").textContent = rad === null ? "-" : formatar(rad, 2) + " kWh/m²";
  document.getElementById("cardDias").textContent = String(lista.length);
}

function atualizarTabela(lista) {
  const corpo = document.getElementById("corpoTabela");
  const linhas = lista.slice().reverse().map(function (d) {
    return "<tr>" +
      "<td>" + escapeHtml(formatarData(d.data)) + "</td>" +
      "<td>" + escapeHtml(formatar(d.temp_media, 1)) + "</td>" +
      "<td>" + escapeHtml(formatar(d.precipitacao, 2)) + "</td>" +
      "<td>" + escapeHtml(formatar(d.radiacao_solar, 2)) + "</td>" +
      "<td>" + escapeHtml(formatar(d.vento, 2)) + "</td>" +
      "<td>" + escapeHtml(formatar(d.umidade, 1)) + "</td>" +
      "</tr>";
  });
  corpo.innerHTML = linhas.join("");
}

function atualizarGrafico(lista) {
  const variavel = document.getElementById("filtroVariavel").value;
  const rotulo = ROTULOS[variavel];
  const local = document.getElementById("filtroLocal").value;
  document.getElementById("tituloGrafico").textContent = rotulo + " - " + local;

  const etiquetas = lista.map(function (d) { return formatarData(d.data); });
  const valores = lista.map(function (d) { return d[variavel]; });

  if (grafico) grafico.destroy();
  grafico = new Chart(document.getElementById("grafico"), {
    type: variavel === "precipitacao" ? "bar" : "line",
    data: {
      labels: etiquetas,
      datasets: [{
        label: rotulo,
        data: valores,
        borderColor: "#4da3ff",
        backgroundColor: "rgba(77, 163, 255, 0.35)",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.25,
        spanGaps: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#e8edf7" } } },
      scales: {
        x: { ticks: { color: "#9aa8c7", maxTicksLimit: 12 }, grid: { color: "#24304d" } },
        y: { ticks: { color: "#9aa8c7" }, grid: { color: "#24304d" } }
      }
    }
  });
}

function atualizarTela() {
  const lista = registrosDoLocal();
  atualizarCards(lista);
  atualizarGrafico(lista);
  atualizarTabela(lista);
}

function preencherLocais() {
  const nomes = Array.from(new Set(dados.map(function (d) { return d.local; }))).sort();
  const seletor = document.getElementById("filtroLocal");
  seletor.innerHTML = nomes.map(function (nome) {
    return '<option value="' + escapeHtml(nome) + '">' + escapeHtml(nome) + "</option>";
  }).join("");
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
    preencherLocais();
    atualizarTela();
  } catch (erro) {
    document.getElementById("mensagemErro").textContent = erro.message;
  }
  carregarUltimaAtualizacao();
}

document.getElementById("filtroLocal").addEventListener("change", atualizarTela);
document.getElementById("filtroVariavel").addEventListener("change", function () {
  atualizarGrafico(registrosDoLocal());
});

iniciar();
      alvo.textContent = "Nenhuma execução
