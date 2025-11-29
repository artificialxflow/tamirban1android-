import type { Customer, CustomerStatus } from "../types";
import { getCustomersCollection } from "../db";
import { BaseRepository } from "./base-repository";

class CustomersRepository extends BaseRepository<Customer> {
  protected collectionPromise = getCustomersCollection();

  listAll() {
    return this.findMany({});
  }

  findByStatus(status: CustomerStatus) {
    return this.findMany({ status });
  }

  async assignMarketer(customerId: string, marketerId: string) {
    return this.updateById(customerId, {
      $set: { assignedMarketerId: marketerId, updatedAt: new Date() },
    });
  }

  async filterByTags(tags: string[]) {
    return this.findMany({ tags: { $in: tags } } as never);
  }
}

export const customersRepository = new CustomersRepository();

