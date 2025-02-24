"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Skeleton } from "./components/ui/skeleton";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { AlertCircle, ArrowUpDown } from "lucide-react";
import { Advocate, AdvocatePaginatedData } from "@/db/schema";

type SortConfig = {
  key: keyof Advocate | null;
  direction: "asc" | "desc";
};

function AdvocateTable({ advocates }: { advocates: Advocate[] }) {
  // Sorting is handled locally within the table.
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  const sortedAdvocates = useMemo(() => {
    const data = Array.isArray(advocates) ? advocates : [];
    let result = data;

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aValue = a[sortConfig.key!];
        let bValue = b[sortConfig.key!];

        // If the value is an array (e.g. specialties), join it into a string.
        if (Array.isArray(aValue)) {
          aValue = aValue.join(", ");
          bValue = (bValue as string[]).join(", ");
        }
        const aSafe = aValue ?? "";
        const bSafe = bValue ?? "";
        if (aSafe < bSafe) return sortConfig.direction === "asc" ? -1 : 1;
        if (aSafe > bSafe) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [advocates, sortConfig]);

  const handleSort = (key: keyof Advocate) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortButton = (label: string, key: keyof Advocate) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(key)}
      className="h-8 px-2 lg:px-3"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{renderSortButton("Name", "firstName")}</TableHead>
          <TableHead>{renderSortButton("City", "city")}</TableHead>
          <TableHead>{renderSortButton("Degree", "degree")}</TableHead>
          <TableHead>
            {renderSortButton("Specialties", "specialties")}
          </TableHead>
          <TableHead>
            {renderSortButton("Experience", "yearsOfExperience")}
          </TableHead>
          <TableHead>{renderSortButton("Phone", "phoneNumber")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedAdvocates.map((advocate) => (
          <TableRow key={advocate.id}>
            <TableCell className="font-medium">
              {advocate.firstName} {advocate.lastName}
            </TableCell>
            <TableCell>{advocate.city}</TableCell>
            <TableCell>{advocate.degree}</TableCell>
            <TableCell>{advocate.specialties.join(", ")}</TableCell>
            <TableCell>{advocate.yearsOfExperience} years</TableCell>
            <TableCell>{advocate.phoneNumber}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-[300px]" />
      <Skeleton className="h-8 w-full" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

// Custom hook to fetch data based on a dynamic query key.
function useQuery<T>({ queryKey }: { queryKey: string[] }): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const url = queryKey[0];
    if (!url) {
      setError(new Error("No URL provided in queryKey"));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json() as Promise<T>;
      })
      .then((jsonData) => {
        setData(jsonData);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [queryKey]);

  return { data, isLoading, error };
}

export default function ProvidersPage() {
  // Track current page and search term in ProvidersPage.
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Update query key whenever currentPage or searchQuery changes.
  const queryKey = useMemo(
    () => [
      `/api/advocates?page=${currentPage}&search=${encodeURIComponent(
        searchQuery
      )}`,
    ],
    [currentPage, searchQuery]
  );

  const {
    data: paginatedAdvocateData,
    isLoading,
    error,
  } = useQuery<AdvocatePaginatedData>({
    queryKey,
  });

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    if (
      paginatedAdvocateData &&
      currentPage < paginatedAdvocateData.totalPages
    ) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // When the user submits the search form, update searchQuery (and reset to page 1).
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Medical Providers Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearchSubmit}
            className="mb-4 flex items-center gap-2"
          >
            <Input
              placeholder="Search by name, city, or specialty..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit">Search</Button>
          </form>
          {isLoading && <LoadingSkeleton />}
          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load providers</p>
            </div>
          )}
          {paginatedAdvocateData && (
            <>
              <AdvocateTable advocates={paginatedAdvocateData.results} />
              <div className="mt-4 flex items-center justify-between">
                <Button onClick={handlePrev} disabled={currentPage === 1}>
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {paginatedAdvocateData.totalPages}
                </span>
                <Button
                  onClick={handleNext}
                  disabled={currentPage === paginatedAdvocateData.totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
