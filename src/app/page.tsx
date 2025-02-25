"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Skeleton } from "./components/ui/skeleton";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { AlertCircle } from "lucide-react";
import { Advocate } from "@/db/schema";
import AdvocateDialog from "./components/ui/advocateDialog";
import { usePaginatedAdvocates } from "./hooks/usePaginatedAdvocates";
import AdvocateTable from "./components/ui/advocateTable";

export default function AdvocatesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(
    null
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      setSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const {
    data: paginatedAdvocateData,
    isLoading,
    error,
  } = usePaginatedAdvocates(currentPage, searchQuery);

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

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">
              Advocates Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Input
                placeholder="Search by name, city, or specialty..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="max-w-sm"
              />
            </div>
            {isLoading && <LoadingSkeleton />}
            {error && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>Failed to load providers</p>
              </div>
            )}
            {paginatedAdvocateData && (
              <>
                <AdvocateTable
                  advocates={paginatedAdvocateData.results}
                  onRowClick={setSelectedAdvocate}
                />
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

      <AdvocateDialog
        advocate={selectedAdvocate}
        onClose={() => setSelectedAdvocate(null)}
      />
    </>
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
