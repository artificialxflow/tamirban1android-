import type { Invoice, InvoiceStatus } from "../types";
import { getInvoicesCollection } from "../db";
import { BaseRepository } from "./base-repository";

class InvoicesRepository extends BaseRepository<Invoice> {
  protected collectionPromise = getInvoicesCollection();

  findByStatus(status: InvoiceStatus) {
    return this.findMany({ status });
  }

  async markAsPaid(invoiceId: string, paidAt = new Date()) {
    return this.updateById(invoiceId, {
      $set: { status: "PAID", paidAt, updatedAt: new Date() },
    });
  }
}

export const invoicesRepository = new InvoicesRepository();

