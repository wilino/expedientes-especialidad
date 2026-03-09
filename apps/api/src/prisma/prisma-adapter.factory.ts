import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

function parsePort(rawPort: string): number {
  const port = Number.parseInt(rawPort, 10);
  return Number.isFinite(port) && port > 0 ? port : 3306;
}

function normalizeHost(rawHost: string): string {
  if (rawHost.startsWith('[') && rawHost.endsWith(']')) {
    return rawHost.slice(1, -1);
  }
  return rawHost;
}

export function createPrismaAdapterFromDatabaseUrl(
  databaseUrl = process.env.DATABASE_URL,
): PrismaMariaDb {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL no está definido');
  }

  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL no es una URL válida');
  }

  if (!['mysql:', 'mariadb:'].includes(parsed.protocol)) {
    throw new Error(
      `Protocolo de DATABASE_URL no soportado: ${parsed.protocol}. Use mysql://`,
    );
  }

  const user = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);
  const database = parsed.pathname.replace(/^\/+/, '') || undefined;

  return new PrismaMariaDb({
    host: normalizeHost(parsed.hostname),
    port: parsePort(parsed.port),
    user,
    password,
    database,
  });
}
