import type { Visit, VisitStatus } from "../types";
import { getVisitsCollection } from "../db";
import { BaseRepository } from "./base-repository";

class VisitsRepository extends BaseRepository<Visit> {
  protected collectionPromise = getVisitsCollection();

  findByCustomer(customerId: string) {
    return this.findMany({ customerId });
  }

  findByStatus(status: VisitStatus) {
    return this.findMany({ status });
  }
}

export const visitsRepository = new VisitsRepository();

