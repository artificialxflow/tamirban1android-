import { getMongoClient } from "./client";

export async function getMongoDb() {
  const dbName = process.env.MONGODB_DB_NAME;

  if (!dbName) {
    throw new Error("MONGODB_DB_NAME is not defined. Set it in your environment variables.");
  }

  const client = await getMongoClient();
  return client.db(dbName);
}

export * from "./client";
export * from "./collections";

