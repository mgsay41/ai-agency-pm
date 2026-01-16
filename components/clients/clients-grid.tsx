"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export interface ClientGridItem {
  id: string;
  clientType: string;
  companyName: string;
  industry: string | null;
  companySize: string | null;
  tags: string[];
  isActive: boolean;
  clientSince: Date | string | null;
  primaryContact?: {
    contactName: string;
    email: string;
  } | null;
  _count?: {
    projects: number;
  };
}

interface ClientsGridProps {
  clients: ClientGridItem[];
  onEdit: (client: ClientGridItem) => void;
  onDelete: (client: ClientGridItem) => void;
}

const clientTypeColors: Record<string, string> = {
  COMPANY: "bg-[#EFF6FF] text-[#2563EB]",
  INDIVIDUAL: "bg-[#F0FDF4] text-[#16A34A]",
  NONPROFIT: "bg-[#FFF7ED] text-[#EA580C]",
  GOVERNMENT: "bg-[#F5F5F5] text-[#737373]",
};

const companySizeLabels: Record<string, string> = {
  "1-10": "1-10",
  "11-50": "11-50",
  "51-200": "51-200",
  "201-500": "201-500",
  "501-1000": "501-1K",
  "1000+": "1K+",
};

export function ClientsGrid({
  clients,
  onEdit,
  onDelete,
}: ClientsGridProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<ClientGridItem>[] = [
    {
      accessorKey: "company_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Client Name
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="min-w-[200px]">
          <Link
            href={`/clients/${row.original.id}`}
            className="font-medium text-[#171717] hover:text-[#18181B] hover:underline transition-colors"
          >
            {row.original.companyName}
          </Link>
          {row.original.industry && (
            <div className="text-xs text-[#A3A3A3]">
              {row.original.industry}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "client_type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const type = row.original.clientType;
        return (
          <Badge
            className={`${clientTypeColors[type] || "bg-[#FAFAFA] text-[#525252]"} rounded font-normal pointer-events-none`}
          >
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "primary_contact",
      header: () => (
        <div className="px-2 text-xs uppercase tracking-wide font-medium">
          Primary Contact
        </div>
      ),
      cell: ({ row }) => {
        const contact = row.original.primaryContact;
        if (!contact) {
          return <div className="text-[#A3A3A3] text-sm">No contact</div>;
        }
        return (
          <div className="min-w-[180px]">
            <div className="text-[#171717] text-sm">{contact.contactName}</div>
            <div className="text-xs text-[#A3A3A3] truncate">{contact.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "company_size",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Size
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const size = row.original.companySize;
        if (!size) return <div className="text-[#A3A3A3] text-sm">-</div>;
        return (
          <div className="text-[#525252] text-sm">
            {companySizeLabels[size] || size}
          </div>
        );
      },
    },
    {
      accessorKey: "_count.projects",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Projects
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const count = row.original._count?.projects || 0;
        return (
          <div className="text-[#171717] text-sm font-medium">
            {count}
          </div>
        );
      },
    },
    {
      accessorKey: "tags",
      header: () => (
        <div className="px-2 text-xs uppercase tracking-wide font-medium">
          Tags
        </div>
      ),
      cell: ({ row }) => {
        const tags = row.original.tags || [];
        if (tags.length === 0) {
          return <div className="text-[#A3A3A3] text-xs">-</div>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                className="bg-[#FAFAFA] text-[#525252] rounded font-normal text-xs pointer-events-none"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge className="bg-[#E5E5E5] text-[#525252] rounded font-normal text-xs pointer-events-none">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge
            className={`${
              isActive
                ? "bg-[#F0FDF4] text-[#16A34A]"
                : "bg-[#F5F5F5] text-[#737373]"
            } rounded font-normal pointer-events-none`}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "client_since",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Client Since
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const clientSince = row.original.clientSince;
        if (!clientSince) {
          return <div className="text-[#A3A3A3] text-sm">-</div>;
        }
        return (
          <div className="text-[#525252] text-sm">
            {format(new Date(clientSince), "MMM d, yyyy")}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="px-2 text-xs uppercase tracking-wide font-medium">
          Actions
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:ring-offset-2"
            onClick={() => onEdit(row.original)}
            aria-label={`Edit client ${row.original.companyName}`}
          >
            <Pencil className="h-4 w-4 text-[#525252]" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:ring-offset-2"
            onClick={() => onDelete(row.original)}
            aria-label={`Delete client ${row.original.companyName}`}
          >
            <Trash2 className="h-4 w-4 text-[#DC2626]" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (clients.length === 0) {
    return (
      <div className="border border-[#E5E5E5] rounded-lg p-12 text-center">
        <div className="text-[#525252] text-lg mb-2">No clients found</div>
        <div className="text-[#A3A3A3] text-sm">
          Create your first client to get started
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#E5E5E5] rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gradient-to-b from-[#FAFAFA] to-[#F5F5F5] border-b border-[#E5E5E5]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[#525252] whitespace-nowrap font-semibold h-12">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                className={`hover:bg-[#F9FAFB] transition-colors duration-150 border-b border-[#E5E5E5] last:border-0 ${
                  index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]/30"
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
