"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { CustomerRow, CustomerCard } from "./customer-row";
import type { CustomerSummary } from "@/lib/services/customers.service";

interface CustomerListProps {
  customers: CustomerSummary[];
  selectedCustomerId?: string;
}

export function CustomerList({ customers, selectedCustomerId }: CustomerListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelectCustomer = (customerId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", customerId);
    router.push(`/dashboard/customers?${params.toString()}`, { scroll: false });
  };

  return (
    <tbody className="divide-y divide-slate-100 bg-white">
      {customers.map((customer) => (
        <CustomerRow
          key={customer.id}
          customer={customer}
          isSelected={selectedCustomerId === customer.id}
          onSelect={handleSelectCustomer}
        />
      ))}
    </tbody>
  );
}

export function CustomerCards({ customers, selectedCustomerId }: CustomerListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handleSelectCustomer = (customerId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", customerId);
    router.push(`/dashboard/customers?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-3">
      {customers.map((customer) => (
        <CustomerCard
          key={`${customer.id}-card`}
          customer={customer}
          isSelected={selectedCustomerId === customer.id}
          onSelect={handleSelectCustomer}
        />
      ))}
    </div>
  );
}

