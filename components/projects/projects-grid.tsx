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
import type { Project } from "@/hooks/use-projects";

interface ProjectsGridProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const statusColors: Record<string, string> = {
  PLANNING: "bg-[#EFF6FF] text-[#2563EB]",
  ACTIVE: "bg-[#F0FDF4] text-[#16A34A]",
  ON_HOLD: "bg-[#FFF7ED] text-[#EA580C]",
  COMPLETED: "bg-[#FAFAFA] text-[#525252]",
  ARCHIVED: "bg-[#F5F5F5] text-[#737373]",
};

const priorityColors: Record<string, string> = {
  HIGH: "bg-[#FEF2F2] text-[#DC2626]",
  MEDIUM: "bg-[#FFF7ED] text-[#EA580C]",
  LOW: "bg-[#F0FDF4] text-[#16A34A]",
};

export function ProjectsGrid({
  projects,
  onEdit,
  onDelete,
}: ProjectsGridProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "project_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Project Name
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-[#171717]">
            {row.original.project_name}
          </div>
          <div className="text-xs text-[#A3A3A3]">
            {row.original.project_code}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
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
        const status = row.original.status;
        return (
          <Badge
            className={`${statusColors[status] || "bg-[#FAFAFA] text-[#525252]"} rounded font-normal`}
          >
            {status.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "client.company_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Client
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-[#171717]">
          {row.original.client?.company_name || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "start_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Start Date
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-[#525252]">
          {format(new Date(row.original.start_date), "MMM d, yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "end_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            End Date
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-[#525252]">
          {format(new Date(row.original.end_date), "MMM d, yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs uppercase tracking-wide font-medium hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Priority
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const priority = row.original.priority;
        return (
          <Badge
            className={`${priorityColors[priority] || "bg-[#FAFAFA] text-[#525252]"} rounded font-normal`}
          >
            {priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: "project_type",
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
      cell: ({ row }) => (
        <div className="text-[#525252] text-sm">
          {row.original.project_type.replace("_", " ")}
        </div>
      ),
    },
    {
      accessorKey: "assignments",
      header: () => (
        <div className="px-2 text-xs uppercase tracking-wide font-medium">
          Team
        </div>
      ),
      cell: ({ row }) => {
        const assignments = row.original.assignments || [];
        if (assignments.length === 0) {
          return <div className="text-[#A3A3A3] text-xs">No team</div>;
        }
        return (
          <div className="flex -space-x-2">
            {assignments.slice(0, 3).map((assignment) => (
              <div
                key={assignment.id}
                className="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center text-xs font-medium border-2 border-white"
                title={assignment.member.full_name}
              >
                {assignment.member.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            ))}
            {assignments.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-[#E5E5E5] text-[#525252] flex items-center justify-center text-xs font-medium border-2 border-white">
                +{assignments.length - 3}
              </div>
            )}
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
            className="h-8 w-8 p-0 hover:bg-[#FAFAFA]"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-4 w-4 text-[#525252]" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-[#FEF2F2]"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="h-4 w-4 text-[#DC2626]" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (projects.length === 0) {
    return (
      <div className="border border-[#E5E5E5] rounded-lg p-12 text-center">
        <div className="text-[#525252] text-lg mb-2">No projects found</div>
        <div className="text-[#A3A3A3] text-sm">
          Create your first project to get started
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-[#FAFAFA]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-[#FAFAFA]">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-[#525252]">
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
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-[#FAFAFA] border-b border-[#E5E5E5]"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
