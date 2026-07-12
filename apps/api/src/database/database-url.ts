import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required. Set it to your PostgreSQL connection string.',
    );
  }
  return databaseUrl;
}

export function buildPostgresTypeOrmOptions(): PostgresConnectionOptions {
  const databaseUrl = requireDatabaseUrl();
  const url = new URL(databaseUrl);
  const database = url.pathname.replace(/^\//, '');

  if (!database) {
    throw new Error('DATABASE_URL must include a database name.');
  }

  const sslMode = url.searchParams.get('sslmode');
  const ssl =
    sslMode === 'require' || sslMode === 'verify-full' || sslMode === 'verify-ca'
      ? { rejectUnauthorized: sslMode !== 'require' }
      : undefined;

  return {
    type: 'postgres',
    host: url.hostname,
    port: Number(url.port || 5432),
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    ...(ssl ? { ssl } : {}),
  };
}
