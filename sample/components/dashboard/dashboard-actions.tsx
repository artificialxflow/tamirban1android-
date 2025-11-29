"use client";

import { useState } from "react";
import { CustomerCreateModal } from "@/components/customers/customer-create-modal";

export function DashboardActions() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <button className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-300 bg-primary-100 px-5 py-2.5 text-sm font-semibold text-primary-800 transition hover:border-primary-400 hover:bg-primary-200 hover:text-primary-900 shadow-md">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          گزارش لحظه‌ای
        </button>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-400 bg-gradient-to-r from-primary-100 to-primary-200 px-5 py-2.5 text-sm font-semibold text-primary-800 shadow-lg shadow-primary-500/10 transition-all duration-200 hover:scale-105 hover:from-primary-200 hover:to-primary-300 hover:border-primary-500 hover:text-primary-900 hover:shadow-xl hover:shadow-primary-500/20 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 active:scale-100 disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          ثبت مشتری جدید
        </button>
      </div>
      <CustomerCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}

