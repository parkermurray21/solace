import db from "../../../db"; // your configured Drizzle ORM instance
import {} from "drizzle-orm/expressions";
import { InferSelectModel, count, sql, or, ilike } from "drizzle-orm";
import { advocates } from "../../../db/schema";

type Advocate = InferSelectModel<typeof advocates>;

export interface PaginatedAdvocates {
  results: Advocate[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export async function getPaginatedAdvocates(
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<PaginatedAdvocates> {
  const offset = (page - 1) * pageSize;
  const searchProvided = Boolean(search && search.trim() !== "");
  const searchPattern = `%${search?.trim() || ""}%`;

  let baseQuery = db
    .select()
    .from(advocates)
    .where(
      or(
        ilike(advocates.firstName, searchPattern),
        ilike(advocates.lastName, searchPattern),
        ilike(advocates.city, searchPattern),
        ilike(advocates.degree, searchPattern),
        sql`CAST("years_of_experience" AS text) ILIKE ${searchPattern}`,
        sql`CAST("payload" AS text) ILIKE ${searchPattern}`,
        sql`CAST("phone_number" AS text) ILIKE ${searchPattern}`
      )
    );
  const results = await baseQuery.limit(pageSize).offset(offset);
  let countQuery = db
    .select({ total: count(advocates.id) })
    .from(advocates)
    .where(
      or(
        ilike(advocates.firstName, searchPattern),
        ilike(advocates.lastName, searchPattern),
        ilike(advocates.city, searchPattern),
        ilike(advocates.degree, searchPattern),
        sql`CAST("years_of_experience" AS text) ILIKE ${searchPattern}`,
        sql`CAST("payload" AS text) ILIKE ${searchPattern}`,
        sql`CAST("phone_number" AS text) ILIKE ${searchPattern}`
      )
    );

  const countResult = await countQuery;
  const totalCount = countResult[0]?.total ?? 0;

  return {
    results,
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
