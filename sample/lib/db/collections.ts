import type { Collection } from "mongodb";
import { getMongoDb } from "./client";
import type {
  Customer,
  Invoice,
  MarketerProfile,
  OTPAttempt,
  SMSLog,
  User,
  Visit,
} from "../types";
import type { Db } from "mongodb";

const COLLECTIONS = {
  users: "users",
  marketers: "marketers",
  customers: "customers",
  visits: "visits",
  invoices: "invoices",
  smsLogs: "sms_logs",
  otpAttempts: "otp_attempts",
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;

export const collectionNames = COLLECTIONS;

export async function getUsersCollection(): Promise<Collection<User>> {
  const db = await getMongoDb();
  return db.collection<User>(COLLECTIONS.users);
}

export async function getMarketersCollection(): Promise<Collection<MarketerProfile>> {
  const db = await getMongoDb();
  return db.collection<MarketerProfile>(COLLECTIONS.marketers);
}

export async function getCustomersCollection(): Promise<Collection<Customer>> {
  const db = await getMongoDb();
  return db.collection<Customer>(COLLECTIONS.customers);
}

export async function getVisitsCollection(): Promise<Collection<Visit>> {
  const db = await getMongoDb();
  return db.collection<Visit>(COLLECTIONS.visits);
}

export async function getInvoicesCollection(): Promise<Collection<Invoice>> {
  const db = await getMongoDb();
  return db.collection<Invoice>(COLLECTIONS.invoices);
}

export async function getSmsLogsCollection(): Promise<Collection<SMSLog>> {
  const db = await getMongoDb();
  return db.collection<SMSLog>(COLLECTIONS.smsLogs);
}

export async function getOtpAttemptsCollection(): Promise<Collection<OTPAttempt>> {
  const db = await getMongoDb();
  return db.collection<OTPAttempt>(COLLECTIONS.otpAttempts);
}

export function getUsersCollectionFromDb(db: Db) {
  return db.collection("users");
}

export function getOtpAttemptsCollectionFromDb(db: Db) {
  return db.collection("otp_attempts");
}

