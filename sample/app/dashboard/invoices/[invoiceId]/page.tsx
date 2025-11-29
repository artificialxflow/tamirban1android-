import { redirect } from "next/navigation";
import { getInvoice } from "../actions";
import { InvoiceDetailView } from "@/components/invoices/invoice-detail-view";

type InvoiceDetailPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { invoiceId } = await params;
  const result = await getInvoice(invoiceId);

  if (!result.success || !result.data) {
    redirect("/dashboard/invoices");
  }

  return <InvoiceDetailView invoice={result.data} />;
}

