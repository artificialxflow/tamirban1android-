import { getUsersCollection } from "@/lib/db/collections";
import { ROLE_PERMISSIONS } from "@/lib/permissions/role-permissions";
import type { RoleKey, User } from "@/lib/types";

/**
 * لیبل‌های فارسی برای نقش‌ها
 */
export const ROLE_LABELS: Record<RoleKey, string> = {
  SUPER_ADMIN: "مدیر کل",
  FINANCE_MANAGER: "مدیر مالی",
  MARKETER: "بازاریاب",
  CUSTOMER: "مشتری",
};

/**
 * اطلاعات کامل یک نقش
 */
export interface RoleInfo {
  key: RoleKey;
  label: string;
  permissions: string[];
  userCount: number;
}

/**
 * Service برای مدیریت نقش‌ها
 */
class RolesService {
  /**
   * دریافت لیست تمام نقش‌ها با تعداد کاربران
   */
  async listRoles(): Promise<RoleInfo[]> {
    const usersCollection = await getUsersCollection();

    // شمارش کاربران برای هر نقش
    const roleCounts = await usersCollection
      .aggregate<{ _id: RoleKey; count: number }>([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const countMap = new Map<RoleKey, number>();
    roleCounts.forEach((item) => {
      countMap.set(item._id, item.count);
    });

    // ساخت لیست نقش‌ها
    const roles: RoleInfo[] = Object.keys(ROLE_PERMISSIONS).map((key) => {
      const roleKey = key as RoleKey;
      return {
        key: roleKey,
        label: ROLE_LABELS[roleKey],
        permissions: ROLE_PERMISSIONS[roleKey],
        userCount: countMap.get(roleKey) || 0,
      };
    });

    return roles;
  }

  /**
   * دریافت اطلاعات یک نقش
   */
  async getRole(roleKey: RoleKey): Promise<RoleInfo | null> {
    const usersCollection = await getUsersCollection();
    const userCount = await usersCollection.countDocuments({ role: roleKey });

    return {
      key: roleKey,
      label: ROLE_LABELS[roleKey],
      permissions: ROLE_PERMISSIONS[roleKey],
      userCount,
    };
  }

  /**
   * دریافت لیست کاربران یک نقش
   */
  async getRoleUsers(roleKey: RoleKey): Promise<User[]> {
    const usersCollection = await getUsersCollection();
    const users = await usersCollection
      .find({ role: roleKey })
      .sort({ createdAt: -1 })
      .toArray();

    return users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));
  }

  /**
   * دریافت تمام permissions موجود در سیستم
   */
  getAllPermissions(): string[] {
    const allPermissions = new Set<string>();
    Object.values(ROLE_PERMISSIONS).forEach((permissions) => {
      permissions.forEach((perm) => allPermissions.add(perm));
    });
    return Array.from(allPermissions).sort();
  }
}

export const rolesService = new RolesService();

