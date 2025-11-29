import type { SMSLog, SMSStatus } from "../types";
import { getSmsLogsCollection } from "../db";
import { BaseRepository } from "./base-repository";

class SmsLogsRepository extends BaseRepository<SMSLog> {
  protected collectionPromise = getSmsLogsCollection();

  findByStatus(status: SMSStatus) {
    return this.findMany({ status });
  }

  findByPhone(phoneNumber: string) {
    return this.findMany({ phoneNumber });
  }
}

export const smsLogsRepository = new SmsLogsRepository();

