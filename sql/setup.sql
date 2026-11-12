create table if not exists public.clima_diario (
  id bigint generated always as identity primary key,
  local text not null,
  latitude numeric(8,4) not null,
  longitude numeric(8,4) not null,
  data date not null,
  temp_media numeric,        -- T2M (°C)
  precipitacao numeric,      -- PRECTOTCORR (mm/dia)
  radiacao_solar numeric,    -- ALLSKY_SFC_SW_DWN (kWh/m²/dia)
  vento numeric,             -- WS2M (m/s)
  umidade numeric,           -- RH2M (%)
  criado_em timestamptz default now(),
  constraint clima_diario_local_data_key unique (local, data)
);

create table if not exists public.execucoes (
  id bigint generated always as identity primary key,
  executado_em timestamptz default now(),
  registros_processados int default 0,
  lotes int default 0,
  erros int default 0,
  status text check (status in ('concluido','erro_parcial','erro_critico')),
  mensagem text
);

alter table public.clima_diario enable row level security;
alter table public.execucoes enable row level security;

create policy "leitura publica" on public.clima_diario for select using (true);
create policy "leitura publica" on public.execucoes for select using (true);

grant select on public.clima_diario, public.execucoes to anon, authenticated;
grant all on public.clima_diario, public.execucoes to service_role;
grant usage, select on all sequences in schema public to service_role;
