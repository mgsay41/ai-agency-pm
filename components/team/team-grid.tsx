"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2 } from "lucide-react";
import { TeamMember } from "@/hooks/use-team";
import { DEPARTMENT_LABELS, STATUS_LABELS } from "@/lib/validations/team";

interface TeamGridProps {
  teamMembers: TeamMember[];
  onView: (member: TeamMember) => void;
  onDelete?: (member: TeamMember) => void;
  isLoading?: boolean;
}

export function TeamGrid({
  teamMembers,
  onView,
  onDelete,
  isLoading,
}: TeamGridProps) {
  const columns: ColumnDef<TeamMember>[] = [
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => {
        const member = row.original;
        const initials = member.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: member.avatarColor || "#18181B" }}
            >
              {initials}
            </div>
            <div>
              <Link
                href={`/team/${member.id}`}
                className="font-medium text-[#171717] hover:text-[#18181B] hover:underline transition-colors"
              >
                {member.fullName}
              </Link>
              <div className="text-sm text-[#525252]">{member.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "roleTitle",
      header: "Role",
      cell: ({ row }) => (
        <div className="text-[#171717]">{row.getValue("roleTitle")}</div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => {
        const department = row.getValue("department") as string;
        return (
          <div className="text-[#525252]">
            {DEPARTMENT_LABELS[department] || department}
          </div>
        );
      },
    },
    {
      accessorKey: "skills",
      header: "Skills",
      cell: ({ row }) => {
        const skills = row.getValue("skills") as string[];
        const topSkills = skills.slice(0, 3);

        return (
          <div className="flex flex-wrap gap-1">
            {topSkills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="bg-[#F4F4F5] text-[#525252] text-xs rounded"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge
                variant="secondary"
                className="bg-[#F4F4F5] text-[#525252] text-xs rounded"
              >
                +{skills.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "_count",
      header: "Active Projects",
      cell: ({ row }) => {
        const count = row.original._count?.ProjectAssignment || 0;
        return (
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F4F4F5] text-[#171717] text-sm font-medium">
              {count}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusColors: Record<string, string> = {
          ACTIVE: "bg-[#F0FDF4] text-[#16A34A]",
          ON_LEAVE: "bg-[#FFF7ED] text-[#EA580C]",
          INACTIVE: "bg-[#F4F4F5] text-[#71717A]",
        };

        return (
          <Badge
            className={`${statusColors[status] || "bg-[#F4F4F5] text-[#71717A]"} rounded`}
          >
            {STATUS_LABELS[status] || status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(member)}
              className="h-8 w-8 p-0"
              title="View details"
            >
              <Eye className="h-4 w-4 text-[#525252]" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(member)}
                className="h-8 w-8 p-0"
                title="Delete member"
              >
                <Trash2 className="h-4 w-4 text-[#DC2626]" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: teamMembers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#525252]">Loading team members...</div>
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-[#E5E5E5] rounded-lg">
        <p className="text-[#525252] mb-2">No team members found</p>
        <p className="text-sm text-[#A3A3A3]">
          Add your first team member to get started
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-[#FAFAFA]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b border-[#E5E5E5]">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-[#525252] text-xs uppercase tracking-wide font-medium"
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
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-b border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-4">
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
