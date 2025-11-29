import { ObjectId } from "mongodb";

import { getUsersCollection } from "@/lib/db/collections";
import type { User } from "@/lib/types";

import { BaseRepository } from "./base-repository";

class UsersRepository extends BaseRepository<User> {
  protected collectionPromise = getUsersCollection();

  findByMobile(mobile: string) {
    return this.findOne({ mobile });
  }

  async createWithMobile(mobile: string) {
    const now = new Date();
    const document: User = {
      _id: new ObjectId().toHexString(),
      fullName: mobile,
      mobile,
      role: "MARKETER",
      isActive: true,
      createdAt: now,
      createdBy: "system",
    };

    return (await this.insertOne(document)) as unknown as User;
  }
}

export const usersRepository = new UsersRepository();

export async function findUserByPhone(phone: string) {
  return usersRepository.findByMobile(phone);
}

export async function createUserWithPhone(phone: string) {
  const existing = await usersRepository.findByMobile(phone);
  if (existing) {
    return existing;
  }
  return usersRepository.createWithMobile(phone);
}

export async function updateUserMobile(userId: string, updates: Partial<User>) {
  await usersRepository.updateById(userId, {
    $set: { ...updates, updatedAt: new Date(), updatedBy: "system" },
  } as never);
}

