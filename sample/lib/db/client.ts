import { MongoClient, type Db } from "mongodb";

type MongoGlobals = {
  client: MongoClient | null;
  db: Db | null;
};

declare global {
  var __tamirban_mongo__: MongoGlobals | undefined;
}

const mongoGlobal = globalThis.__tamirban_mongo__ ?? { client: null, db: null };

if (process.env.NODE_ENV !== "production") {
  globalThis.__tamirban_mongo__ = mongoGlobal;
}

function deriveDbNameFromUri(uri: string): string | null {
  try {
    const parsed = new URL(uri);
    const pathname = parsed.pathname.replace(/^\//, "");
    return pathname || null;
  } catch {
    return null;
  }
}

/**
 * بررسی اینکه آیا client به درستی connect شده است یا نه
 */
async function isClientConnected(client: MongoClient): Promise<boolean> {
  try {
    await client.db("admin").command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  // اگر client وجود دارد، بررسی کن که آیا connect شده است
  if (mongoGlobal.client) {
    try {
      const isConnected = await isClientConnected(mongoGlobal.client);
      if (isConnected) {
        return mongoGlobal.client;
      } else {
        // اگر client قطع شده است، آن را ببند و یک client جدید ایجاد کن
        console.warn("[MongoDB] Client disconnected, reconnecting...");
        try {
          await mongoGlobal.client.close();
        } catch {
          // ignore close errors
        }
        mongoGlobal.client = null;
        mongoGlobal.db = null;
      }
    } catch (error) {
      console.error("[MongoDB] Error checking connection:", error);
      // در صورت خطا، client را reset کن
      if (mongoGlobal.client) {
        try {
          await mongoGlobal.client.close();
        } catch {
          // ignore close errors
        }
      }
      mongoGlobal.client = null;
      mongoGlobal.db = null;
    }
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment variables.");
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000, // افزایش timeout
    socketTimeoutMS: 45_000, // timeout برای socket
    connectTimeoutMS: 10_000, // timeout برای اتصال
    retryWrites: true,
    retryReads: true,
  });

  // اتصال به MongoDB
  try {
    await client.connect();
    console.log("[MongoDB] Connected successfully");
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    mongoGlobal.client = null;
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
  }

  mongoGlobal.client = client;
  return client;
}

export async function getMongoDb(forcedDbName?: string): Promise<Db> {
  try {
    if (mongoGlobal.db && !forcedDbName) {
      // بررسی اینکه آیا db هنوز معتبر است
      try {
        const client = mongoGlobal.db.client;
        if (client) {
          await client.db("admin").command({ ping: 1 });
          return mongoGlobal.db;
        }
      } catch {
        // اگر db معتبر نیست، reset کن
        mongoGlobal.db = null;
      }
    }

    const client = await getMongoClient();
    const dbName =
      forcedDbName ??
      process.env.MONGODB_DB_NAME ??
      deriveDbNameFromUri(process.env.MONGODB_URI ?? "");

    if (!dbName) {
      throw new Error(
        "MONGODB_DB_NAME is not defined. Set it explicitly or pass a database name to getMongoDb().",
      );
    }

    const db = client.db(dbName);

    if (!forcedDbName) {
      mongoGlobal.db = db;
    }

    return db;
  } catch (error) {
    console.error("[getMongoDb] Error:", error);
    throw error;
  }
}

export async function disconnectMongo(): Promise<void> {
  if (mongoGlobal.client) {
    await mongoGlobal.client.close();
    mongoGlobal.client = null;
    mongoGlobal.db = null;
  }
}

