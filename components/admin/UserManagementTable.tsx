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
import { UserX, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

export interface UserGridItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date | string;
  _count?: {
    Client: number;
  };
}

interface UserManagementTableProps {
  users: UserGridItem[];
  onDeactivate: (user: UserGridItem) => void;
  currentUserId: string;
}

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

export function UserManagementTable({
  users,
  onDeactivate,
  currentUserId,
}: UserManagementTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<UserGridItem>[] = [
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
          <div className="font-medium text-[#171717]">
            {row.original.name || "No name"}
          </div>
          <div className="text-xs text-[#A3A3A3]">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Role
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const role = row.original.role;
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
      accessorKey: "_count.Client",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Clients
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const count = row.original._count?.Client || 0;
        return (
          <div className="text-[#171717] text-sm font-medium">{count}</div>
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
                : "bg-[#FEF2F2] text-[#DC2626]"
            } rounded font-normal pointer-events-none`}
          >
            {isActive ? "Active" : "Deactivated"}
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
            Joined
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
        const isCurrentUser = row.original.id === currentUserId;
        const isActive = row.original.isActive;
        const hasClients = (row.original._count?.Client || 0) > 0;

        return (
          <div className="flex gap-2">
            {isActive && !isCurrentUser && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 hover:bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:ring-offset-2"
                onClick={() => onDeactivate(row.original)}
                aria-label={`Deactivate user ${row.original.name || row.original.email}`}
              >
                <UserX className="h-4 w-4 text-[#DC2626] mr-2" />
                <span className="text-sm text-[#DC2626]">Deactivate</span>
              </Button>
            )}
            {isCurrentUser && (
              <span className="text-xs text-[#A3A3A3] italic">
                Current user
              </span>
            )}
            {!isActive && (
              <span className="text-xs text-[#A3A3A3] italic">
                Deactivated
              </span>
            )}
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
        <div className="text-[#525252] text-lg mb-2">No users found</div>
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
