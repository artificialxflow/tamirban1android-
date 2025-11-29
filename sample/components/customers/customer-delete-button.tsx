'use client';

import { useTransition } from "react";

import { deleteCustomerAction } from "@/app/dashboard/customers/actions";

type CustomerDeleteButtonProps = {
  customerId: string;
};

export function CustomerDeleteButton({ customerId }: CustomerDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm("آیا از حذف این مشتری مطمئن هستید؟ این عملیات قابل بازگشت نیست.");
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      await deleteCustomerAction(customerId);
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 transition hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isPending}
    >
      {isPending ? "در حال حذف..." : "حذف"}
    </button>
  );
}


