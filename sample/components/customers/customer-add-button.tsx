"use client";

import { useState } from "react";

import { ProtectedComponent } from "@/components/common/protected-component";
import { CustomerCreateModal } from "@/components/customers/customer-create-modal";

interface CustomerAddButtonProps {
  onClick?: () => void;
}

/**
 * دکمه افزودن مشتری جدید با RBAC
 */
export function CustomerAddButton({ onClick }: CustomerAddButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    onClick?.();
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <ProtectedComponent anyPermission={["customers:write"]} role={["MARKETER", "SUPER_ADMIN"]}>
      <>
        <button
          onClick={handleOpen}
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50"
        >
          افزودن مشتری جدید
        </button>
        <CustomerCreateModal isOpen={isModalOpen} onClose={handleClose} />
      </>
    </ProtectedComponent>
  );
}

