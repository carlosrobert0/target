# Cofrin — banco PostgreSQL

Setup local do banco em Postgres + script de migração de dados a partir do SQLite local (`cofrin.db`).

## Pré-requisitos

- Docker Desktop (Windows/macOS) ou Docker Engine + compose plugin (Linux)
- Node 18+ (para rodar o script de migração)

## Subindo o banco

```bash
cd db/postgres
cp .env.example .env       # ajuste senhas se quiser
docker compose up -d
```

Isso sobe dois containers:

| Container        | Porta padrão | Notas                                     |
| ---------------- | ------------ | ----------------------------------------- |
| `cofrin-postgres`| 5432         | Postgres 16, schema aplicado no init      |
| `cofrin-pgadmin` | 5050         | Acesse http://localhost:5050              |

O schema (`schema.sql`) é executado **uma única vez** na primeira subida pelo entrypoint do Postgres. Para reaplicar (limpa dados):

```bash
docker compose down -v
docker compose up -d
```

Ou reaplicar o schema em um banco já rodando:

```bash
npm run db:schema
```

## Migrando dados do SQLite

O app móvel guarda os dados em `cofrin.db` dentro do storage do dispositivo. Para migrar:

1. Pegue uma cópia do `cofrin.db` (via debug bridge no Android, ou Application Support no iOS).
2. Coloque o caminho em `SQLITE_PATH` no `.env`.
3. Instale e rode:

```bash
npm install
npm run db:migrate
```

O script:

- Faz `TRUNCATE ... RESTART IDENTITY CASCADE` em todas as tabelas (idempotente).
- Copia na ordem correta de FKs: `targets` → `analysis_categories` → `recurring_transactions` → `transactions` → `tags` → `transaction_tags` → settings/log.
- Preserva IDs originais.
- Ajusta as sequences ao final pra `MAX(id) + 1`.
- Tudo em uma única transação — rollback em caso de erro.

Em caso de falha, nada é gravado. Rode de novo após corrigir.

## Diferenças relevantes vs. SQLite

| Conceito                | SQLite                       | PostgreSQL                                     |
| ----------------------- | ---------------------------- | ---------------------------------------------- |
| Inteiro autoincremento  | `INTEGER AUTOINCREMENT`      | `BIGSERIAL`                                    |
| Boolean                 | `INTEGER` 0/1                | `BOOLEAN`                                      |
| JSON na categoria       | `TEXT` (parsed em JS)        | `JSONB` (queryable nativo)                     |
| Timestamps              | `TIMESTAMP` (sem tz)         | `TIMESTAMPTZ`                                  |
| `updated_at` automático | Manual em cada UPDATE        | Trigger `set_updated_at()`                     |
| Multi-tenant            | N/A (banco do device)        | Coluna `user_id UUID` em toda tabela (RLS-ready) |

## Próximos passos (não cobertos por este setup)

- Row-Level Security (`ENABLE ROW LEVEL SECURITY` + policies por `user_id`).
- API HTTP que o app móvel consome (REST ou GraphQL).
- Backfill de `user_id` quando um usuário existente faz login pela primeira vez.

## Comandos úteis

```bash
npm run db:up       # sobe os containers
npm run db:down     # derruba (mantém volumes)
npm run db:reset    # derruba + apaga volumes + sobe limpo
npm run db:logs     # tail do log do Postgres
npm run db:psql     # shell psql dentro do container
npm run db:schema   # reaplica schema.sql
npm run db:migrate  # roda migração SQLite → PG
```
