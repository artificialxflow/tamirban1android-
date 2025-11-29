import { getMongoDb } from "@/lib/db";
import { getOtpAttemptsCollectionFromDb } from "@/lib/db/collections";
import type { OtpAttempt } from "@/lib/types";

const EXPIRATION_MINUTES = 5;
const MAX_ATTEMPTS = 5;

export async function upsertOtpAttempt(phone: string, codeHash: string) {
  const db = await getMongoDb();
  const collection = getOtpAttemptsCollectionFromDb(db);
  const expiresAt = new Date(Date.now() + EXPIRATION_MINUTES * 60 * 1000);

  await collection.updateOne(
    { phone },
    {
      $set: {
        phone,
        codeHash,
        expiresAt,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
      $unset: { attempts: "" },
    },
    { upsert: true },
  );
}

export async function getOtpAttempt(phone: string) {
  const db = await getMongoDb();
  const collection = getOtpAttemptsCollectionFromDb(db);
  const item = await collection.findOne({ phone });
  return item as OtpAttempt | null;
}

export async function incrementAttempt(phone: string) {
  const db = await getMongoDb();
  const collection = getOtpAttemptsCollectionFromDb(db);

  const result = await collection.findOneAndUpdate(
    { phone },
    {
      $inc: { attempts: 1 },
      $setOnInsert: {
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + EXPIRATION_MINUTES * 60 * 1000),
      },
    },
    { returnDocument: "after", upsert: true },
  );

  const attemptsCount = result?.value?.attempts ?? 0;
  if (attemptsCount > MAX_ATTEMPTS) {
    throw new Error("حداکثر تلاش برای OTP انجام شده است. لطفاً بعداً تلاش کنید.");
  }

  return result?.value ? (result.value as OtpAttempt) : null;
}

export async function clearOtpAttempt(phone: string) {
  const db = await getMongoDb();
  const collection = getOtpAttemptsCollectionFromDb(db);
  await collection.deleteOne({ phone });
}
