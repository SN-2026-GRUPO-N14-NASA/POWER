import os
import sys
import time
import requests
from datetime import date, timedelta

SB_URL = os.environ["SUPABASE_URL"].strip().rstrip("/")
SB_KEY = os.environ["SUPABASE_SERVICE_KEY"].strip()

HEADERS = {"apikey": SB_KEY, "Content-Type": "application/json"}
if SB_KEY.startswith("eyJ"):  
    HEADERS["Authorization"] = f"Bearer {SB_KEY}"

LOTE = 200
DIAS_HISTORICO = 90
DEFASAGEM_DIAS = 3  

LOCAIS = [
    ("Marechal Cândido Rondon", -24.55, -54.06),
    ("Curitiba", -25.43, -49.27),
    ("Manaus", -3.12, -60.02),
    ("Porto Alegre", -30.03, -51.23),
    ("Recife", -8.05, -34.88),
    ("Brasília", -15.78, -47.93),
]

PARAMS = "T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN,WS2M,RH2M"
POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"


def val(v):
    """A POWER usa -999 para dado ausente; vira NULL no banco."""
    return None if v is None or v == -999 else v


def buscar(lat, lon):
    fim = date.today() - timedelta(days=DEFASAGEM_DIAS)
    ini = fim - timedelta(days=DIAS_HISTORICO)
    params = {
        "parameters": PARAMS,
        "community": "RE",
        "latitude": lat,
        "longitude": lon,
        "start": ini.strftime("%Y%m%d"),
        "end": fim.strftime("%Y%m%d"),
        "format": "JSON",
    }
    ultimo_erro = None
    for tentativa in range(1, 4):
        try:
            r = requests.get(POWER_URL, params=params, timeout=90)
            r.raise_for_status()
            return r.json()["properties"]["parameter"]
        except Exception as ex:
            ultimo_erro = ex
            print(f"  tentativa {tentativa}/3 falhou: {ex}")
            time.sleep(5 * tentativa)
    raise ultimo_erro


def normalizar(local, lat, lon, p):
    linhas = []
    for d in p["T2M"].keys():  
        linhas.append({
            "local": local,
            "latitude": lat,
            "longitude": lon,
            "data": f"{d[:4]}-{d[4:6]}-{d[6:]}",
            "temp_media": val(p["T2M"].get(d)),
            "precipitacao": val(p["PRECTOTCORR"].get(d)),
            "radiacao_solar": val(p["ALLSKY_SFC_SW_DWN"].get(d)),
            "vento": val(p["WS2M"].get(d)),
            "umidade": val(p["RH2M"].get(d)),
        })
    return linhas


def registrar(proc, lotes, erros, status, msg=""):
    """Grava o log da execução na tabela execucoes."""
    try:
        r = requests.post(
            f"{SB_URL}/rest/v1/execucoes",
            headers={**HEADERS, "Prefer": "return=minimal"},
            json={
                "registros_processados": proc,
                "lotes": lotes,
                "erros": erros,
                "status": status,
                "mensagem": msg[:500],
            },
            timeout=30,
        )
        if not r.ok:
            print(f"Falha ao registrar execução: {r.status_code} {r.text}")
    except Exception as ex:
        print(f"Falha ao registrar execução: {ex}")


def main():
    proc = lotes = erros = 0
    mensagens = []
    unicos = {}

    
    for local, lat, lon in LOCAIS:
        print(f"Buscando {local}...")
        try:
            for linha in normalizar(local, lat, lon, buscar(lat, lon)):
                unicos[(linha["local"], linha["data"])] = linha
        except Exception as ex:
            erros += 1
            mensagens.append(f"{local}: {ex}")
            print(f"Falha em {local}: {ex}")

    dados = list(unicos.values())
    print(f"{len(dados)} registros únicos para enviar.")

    if not dados:
        registrar(0, 0, erros or 1, "erro_critico", "; ".join(mensagens) or "Nenhum dado coletado")
        sys.exit(1)

    
    for i in range(0, len(dados), LOTE):
        lote = dados[i:i + LOTE]
        r = requests.post(
            f"{SB_URL}/rest/v1/clima_diario?on_conflict=local,data",
            headers={**HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal"},
            json=lote,
            timeout=60,
        )
        if r.ok:
            proc += len(lote)
            lotes += 1
        else:
            erros += 1
            mensagens.append(f"lote {i // LOTE + 1}: {r.status_code}")
            print(f"Erro no lote {i // LOTE + 1}: {r.status_code} {r.text}")

    
    status = "concluido" if erros == 0 else "erro_parcial"
    registrar(proc, lotes, erros, status, "; ".join(mensagens))
    print(f"Fim: {proc} registros, {lotes} lotes, {erros} erros, status={status}")

    if erros:
        sys.exit(1)  


if __name__ == "__main__":
    main()
