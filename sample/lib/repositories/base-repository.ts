import type {
  Collection,
  Document,
  Filter,
  FindOptions,
  OptionalUnlessRequiredId,
  UpdateFilter,
  WithId,
} from "mongodb";
import type { PaginatedResult, PaginationParams } from "../types";

export abstract class BaseRepository<TSchema extends Document> {
  protected abstract collectionPromise: Promise<Collection<TSchema>>;

  protected async collection(): Promise<Collection<TSchema>> {
    return this.collectionPromise;
  }

  async findById(id: string, options?: FindOptions<TSchema>): Promise<WithId<TSchema> | null> {
    const collection = await this.collection();
    return collection.findOne({ _id: id } as Filter<TSchema>, options);
  }

  async findOne(
    filter: Filter<TSchema>,
    options?: FindOptions<TSchema>,
  ): Promise<WithId<TSchema> | null> {
    const collection = await this.collection();
    return collection.findOne(filter, options);
  }

  async findMany(
    filter: Filter<TSchema>,
    options?: FindOptions<TSchema>,
  ): Promise<Array<WithId<TSchema>>> {
    const collection = await this.collection();
    return collection.find(filter, options).toArray();
  }

  async insertOne(doc: OptionalUnlessRequiredId<TSchema>): Promise<WithId<TSchema>> {
    const collection = await this.collection();
    const result = await collection.insertOne(doc);
    return { ...doc, _id: result.insertedId } as WithId<TSchema>;
  }

  async updateById(id: string, update: UpdateFilter<TSchema>): Promise<boolean> {
    const collection = await this.collection();
    const result = await collection.updateOne({ _id: id } as Filter<TSchema>, update);
    return result.matchedCount > 0;
  }

  async deleteById(id: string): Promise<boolean> {
    const collection = await this.collection();
    const result = await collection.deleteOne({ _id: id } as Filter<TSchema>);
    return result.deletedCount === 1;
  }

  async count(filter: Filter<TSchema> = {}): Promise<number> {
    const collection = await this.collection();
    return collection.countDocuments(filter);
  }

  async paginate(
    filter: Filter<TSchema>,
    { page = 1, limit = 20, sortBy = "_id", sortOrder = "desc" }: PaginationParams = {},
    options?: FindOptions<TSchema>,
  ): Promise<PaginatedResult<WithId<TSchema>>> {
    const collection = await this.collection();
    const skip = (page - 1) * limit;

    const cursor = collection.find(filter, {
      ...options,
      skip,
      limit,
      sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    });

    const [data, total] = await Promise.all([
      cursor.toArray(),
      collection.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
}

