"use client";

import { useState } from "react";

import { CustomerEditModal } from "./customer-edit-modal";
import type { CustomerDetail } from "@/lib/services/customers.service";

interface CustomerEditButtonProps {
  customer: CustomerDetail;
  onSuccess?: () => void;
}

export function CustomerEditButton({ customer, onSuccess }: CustomerEditButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
        className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 active:scale-100"
      >
        ویرایش
      </button>
      <CustomerEditModal
        customer={customer}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={onSuccess}
      />
    </>
  );
}

