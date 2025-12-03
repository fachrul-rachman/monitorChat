import { Pool, type QueryResultRow } from "pg";

export type Tenant = "al-azhar" | "lestari";

declare global {
  // eslint-disable-next-line no-var
  var pgPoolAlAzhar: Pool | undefined;
  // eslint-disable-next-line no-var
  var pgPoolLestari: Pool | undefined;
}

const alAzharConnectionString = process.env.DATABASE_URL;
const lestariConnectionString = process.env.LESTARI_DATABASE_URL;

if (!alAzharConnectionString) {
  console.warn(
    "[db] DATABASE_URL (Al Azhar) is not set. API routes will fail until it is configured.",
  );
}

function createPool(connectionString: string | undefined) {
  if (!connectionString) return undefined;

  return new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
  });
}

const poolAlAzhar =
  global.pgPoolAlAzhar ?? createPool(alAzharConnectionString);
const poolLestari =
  global.pgPoolLestari ?? createPool(lestariConnectionString);

if (process.env.NODE_ENV !== "production") {
  if (poolAlAzhar) {
    global.pgPoolAlAzhar = poolAlAzhar;
  }
  if (poolLestari) {
    global.pgPoolLestari = poolLestari;
  }
}

function getPool(tenant: Tenant = "al-azhar"): Pool {
  if (tenant === "lestari") {
    if (poolLestari) return poolLestari;
    if (poolAlAzhar) return poolAlAzhar;
    throw new Error(
      "No database connection is configured for Lestari or fallback.",
    );
  }

  if (poolAlAzhar) return poolAlAzhar;
  if (poolLestari) return poolLestari;

  throw new Error("No database connection is configured.");
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: (string | number)[] = [],
  tenant: Tenant = "al-azhar",
) {
  const pool = getPool(tenant);
  return pool.query<T>(text, params);
}

export async function getClient(tenant: Tenant = "al-azhar") {
  const pool = getPool(tenant);
  return pool.connect();
}
