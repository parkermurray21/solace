import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Skeleton } from "./components/ui/skeleton";
import { Input } from "./components/ui/input";
import { type Provider } from "./shared/schema";
import { Button } from "./components/ui/button";
import { AlertCircle, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";

type SortConfig = {
  key: keyof Provider | null;
  direction: "asc" | "desc";
};

function ProviderTable({ providers }: { providers: Provider[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  const filteredAndSortedProviders = useMemo(() => {
    let result = [...providers];

    // Filter based on search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (provider) =>
          `${provider.firstName} ${provider.lastName}`
            .toLowerCase()
            .includes(searchLower) ||
          provider.city.toLowerCase().includes(searchLower) ||
          provider.specialties.some((s) =>
            s.toLowerCase().includes(searchLower)
          )
      );
    }

    // Sort if a sort key is selected
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key!];
        let bValue = b[sortConfig.key!];

        // Handle array values (specialties)
        if (Array.isArray(aValue)) {
          aValue = aValue.join(", ");
          bValue = (bValue as string[]).join(", ");
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [providers, searchTerm, sortConfig]);

  const handleSort = (key: keyof Provider) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortButton = (label: string, key: keyof Provider) => (
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
    <div className="space-y-4">
      <Input
        placeholder="Search by name, city, or specialty..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

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
              {renderSortButton("Experience", "yearsExperience")}
            </TableHead>
            <TableHead>{renderSortButton("Phone", "phoneNumber")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedProviders.map((provider) => (
            <TableRow key={provider.id}>
              <TableCell className="font-medium">
                {provider.firstName} {provider.lastName}
              </TableCell>
              <TableCell>{provider.city}</TableCell>
              <TableCell>{provider.degree}</TableCell>
              <TableCell>{provider.specialties.join(", ")}</TableCell>
              <TableCell>{provider.yearsExperience} years</TableCell>
              <TableCell>{provider.phoneNumber}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredAndSortedProviders.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No providers found matching your search.
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-[300px]" /> {/* Search input skeleton */}
      <Skeleton className="h-8 w-full" /> {/* Table header skeleton */}
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export default function ProvidersPage() {
  const {
    data: providers,
    isLoading,
    error,
  } = useQuery<Provider[]>({
    queryKey: ["/api/advocates"],
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Medical Providers Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <LoadingSkeleton />}

          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load providers</p>
            </div>
          )}

          {providers && <ProviderTable providers={providers} />}
        </CardContent>
      </Card>
    </div>
  );
}
function useQuery<T>(arg0: { queryKey: string[] }): {
  data: any;
  isLoading: any;
  error: any;
} {
  throw new Error("Function not implemented.");
}
