"use client";

import { useState, useMemo } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  projectName: string;
}

interface ProjectSelectProps {
  projects: Project[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const NEW_PROJECT_VALUE = "__new_project__";

export function ProjectSelect({
  projects,
  value,
  onValueChange,
  placeholder = "Select project",
  className,
}: ProjectSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) {
      return projects;
    }
    return projects.filter((project) =>
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  // Find selected project
  const selectedProject = projects.find((p) => p.id === value);
  const displayValue =
    value === NEW_PROJECT_VALUE
      ? "New Project"
      : selectedProject?.projectName || placeholder;

  const handleSelect = (projectId: string) => {
    onValueChange(projectId);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between border-[#E5E5E5]",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0 bg-white border border-[#E5E5E5]"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col bg-white">
          {/* Search Input */}
          <div className="flex items-center border-b border-[#E5E5E5] px-3 py-2 shrink-0">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Project List */}
          <div
            className="max-h-[300px] overflow-y-scroll overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#D4D4D4] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#A3A3A3]"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#D4D4D4 transparent'
            }}
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            {/* New Project Option - Always at the top */}
            <div
              onClick={() => handleSelect(NEW_PROJECT_VALUE)}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-[#FAFAFA] focus:bg-[#FAFAFA] transition-colors",
                value === NEW_PROJECT_VALUE && "bg-[#FAFAFA]"
              )}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4 text-[#171717]",
                  value === NEW_PROJECT_VALUE ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="font-medium text-[#171717]">New Project</span>
              <span className="ml-2 text-xs text-[#A3A3A3]">
                (can be added later)
              </span>
            </div>

            {/* Separator */}
            {filteredProjects.length > 0 && (
              <div className="h-px bg-[#E5E5E5] my-1" />
            )}

            {/* Filtered Projects */}
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleSelect(project.id)}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-[#FAFAFA] focus:bg-[#FAFAFA] transition-colors",
                    value === project.id && "bg-[#FAFAFA]"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-[#171717]",
                      value === project.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate text-[#171717] font-normal">
                    {project.projectName}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-sm text-[#A3A3A3]">
                No projects found
              </div>
            )}
          </div>

          {/* Footer - Show count if many projects */}
          {projects.length > 5 && (
            <div className="border-t border-[#E5E5E5] px-3 py-2 text-xs text-[#A3A3A3] shrink-0 bg-white">
              {filteredProjects.length} of {projects.length} projects
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
