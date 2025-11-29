import { ObjectId } from "mongodb";
import type { RoleKey, User } from "../types";
import { usersRepository } from "../repositories";

const DEFAULT_ROLE: RoleKey = "MARKETER";

class UserService {
  async findOrCreateByMobile(mobile: string): Promise<User> {
    const existing = await usersRepository.findByMobile(mobile);
    if (existing) {
      return existing;
    }

    const now = new Date();
    const userDocument = {
      _id: new ObjectId().toHexString(),
      fullName: mobile,
      mobile,
      role: DEFAULT_ROLE,
      isActive: true,
      createdAt: now,
      createdBy: "system",
    } as unknown as User;

    const created = await usersRepository.insertOne(userDocument);
    return created;
  }
}

export const userService = new UserService();

