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
import { CheckCircle, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date | string;
  phone?: string | null;
}

interface PendingUsersTableProps {
  users: PendingUser[];
  onApprove: (user: PendingUser) => void;
}

export function PendingUsersTable({
  users,
  onApprove,
}: PendingUsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<PendingUser>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="min-w-[180px]">
          <div className="font-medium text-[#171717]">{row.original.name}</div>
          <div className="text-xs text-[#A3A3A3]">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="text-[#525252] text-sm">
          {row.original.phone || "—"}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Requested Role",
      cell: ({ row }) => {
        const role = row.original.role;
        const roleColors: Record<string, string> = {
          ADMIN: "bg-[#EFF6FF] text-[#2563EB]",
          SALES: "bg-[#F0FDF4] text-[#16A34A]",
          TEAM_MEMBER: "bg-[#FFF7ED] text-[#EA580C]",
        };
        const roleLabels: Record<string, string> = {
          ADMIN: "Admin",
          SALES: "Sales",
          TEAM_MEMBER: "Team Member",
        };
        return (
          <Badge
            className={`${roleColors[role] || "bg-[#FAFAFA] text-[#525252]"} rounded font-normal pointer-events-none`}
          >
            {roleLabels[role] || role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Registered
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return (
          <div className="text-[#525252] text-sm">
            {format(new Date(createdAt), "MMM d, yyyy")}
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
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 hover:bg-[#F0FDF4] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:ring-offset-2"
              onClick={() => onApprove(row.original)}
              aria-label={`Approve user ${row.original.name}`}
            >
              <CheckCircle className="h-4 w-4 text-[#16A34A] mr-2" />
              <span className="text-sm text-[#16A34A]">Approve</span>
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (users.length === 0) {
    return (
      <div className="border border-[#E5E5E5] rounded-lg p-12 text-center">
        <div className="text-[#525252] text-lg mb-2">No pending users</div>
        <div className="text-sm text-[#A3A3A3]">
          All users have been approved
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
                  <TableHead
                    key={header.id}
                    className="text-[#525252] whitespace-nowrap font-semibold h-12"
                  >
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
