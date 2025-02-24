import { getPaginatedAdvocates } from "../services/advocatesService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const search = searchParams.get("search") || "";

  const paginatedData = await getPaginatedAdvocates(page, pageSize, search);

  return Response.json(paginatedData);
}
