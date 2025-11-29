import { AppShell } from "@/components/layout/app-shell";
import { RolesManagementClient } from "@/components/settings/roles-management-client";
import { ProtectedComponent } from "@/components/common/protected-component";

export default function RolesManagementPage() {
  return (
    <ProtectedComponent role="SUPER_ADMIN" showMessage>
      <AppShell
        title="مدیریت نقش‌ها"
        description="تعریف و مدیریت نقش‌ها و دسترسی‌های کاربران"
        activeHref="/dashboard/settings/roles"
      >
        <RolesManagementClient />
      </AppShell>
    </ProtectedComponent>
  );
}

