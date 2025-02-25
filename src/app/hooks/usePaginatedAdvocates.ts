import { useQuery } from "@tanstack/react-query";
import { AdvocatePaginatedData } from "@/db/schema";

export function usePaginatedAdvocates(
  currentPage: number,
  searchQuery: string
) {
  const url = `/api/advocates?page=${currentPage}&search=${encodeURIComponent(
    searchQuery
  )}`;
  return useQuery<AdvocatePaginatedData>({
    queryKey: [url],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    },
  });
}
