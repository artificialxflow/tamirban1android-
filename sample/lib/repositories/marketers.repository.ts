import type { MarketerProfile } from "../types";
import { getMarketersCollection } from "../db";
import { BaseRepository } from "./base-repository";

class MarketersRepository extends BaseRepository<MarketerProfile> {
  protected collectionPromise = getMarketersCollection();

  findByRegion(region: string) {
    return this.findMany({ region });
  }

  async updatePerformance(marketerId: string, score: number) {
    return this.updateById(marketerId, {
      $set: { performanceScore: score, updatedAt: new Date() },
    });
  }
}

export const marketersRepository = new MarketersRepository();

