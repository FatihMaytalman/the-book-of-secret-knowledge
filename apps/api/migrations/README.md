# API Migrations

These SQL files define the first PostgreSQL ledger for the Family Tree MVP.

## Order

1. `0001_core_family_tree.sql`
2. `0002_social_integration.sql`

## Scope

The migrations establish:

- user accounts,
- families and memberships,
- person profiles,
- relationship edge shadows for Neo4j synchronization,
- life events,
- canonical media assets,
- media instances and fingerprints,
- deduplication candidates,
- audit events,
- social connections,
- social imports,
- private family feed records,
- outbound publish records.

## Execution

A migration runner has not been introduced yet. Until then, apply these files in order against the AOM Legacy PostgreSQL database during local development.

Future work should add a typed migration tool and CI validation against a disposable PostgreSQL instance.
