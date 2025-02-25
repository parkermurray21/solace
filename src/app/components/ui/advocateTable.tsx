import { Advocate } from "@/db/schema";
import { Chip } from "@mui/material";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./table";
import React from "react";

export default function AdvocateTable({
  advocates,
  onRowClick,
}: {
  advocates: Advocate[];
  onRowClick: (advocate: Advocate) => void;
}) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Advocate | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc",
  });

  const sortedAdvocates = React.useMemo(() => {
    const data = Array.isArray(advocates) ? advocates : [];
    let result = data;
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aValue = a[sortConfig.key!];
        let bValue = b[sortConfig.key!];
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
          <TableRow
            key={advocate.id}
            onClick={() => onRowClick(advocate)}
            className="cursor-pointer hover:bg-gray-100"
          >
            <TableCell className="font-medium">
              {advocate.firstName} {advocate.lastName}
            </TableCell>
            <TableCell>{advocate.city}</TableCell>
            <TableCell>{advocate.degree}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                {advocate.specialties.map((specialty, idx) => (
                  <Chip key={idx} label={specialty} size="small" />
                ))}
              </div>
            </TableCell>
            <TableCell>{advocate.yearsOfExperience} years</TableCell>
            <TableCell style={{ whiteSpace: "nowrap" }}>
              {formatPhoneNumber(advocate.phoneNumber)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function formatPhoneNumber(phone: number): string {
  const phoneStr = phone.toString();
  if (phoneStr.length === 10) {
    const areaCode = phoneStr.substring(0, 3);
    const centralOffice = phoneStr.substring(3, 6);
    const lineNumber = phoneStr.substring(6);
    return `(${areaCode}) ${centralOffice}-${lineNumber}`;
  }
  return phoneStr;
}
