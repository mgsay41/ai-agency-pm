"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectsGrid } from "@/components/projects/projects-grid";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useProjects, type Project, type ProjectFilters as ProjectFiltersType } from "@/hooks/use-projects";
import type { CreateProjectInput } from "@/lib/validations/project";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { projects, isLoading, fetchProjects, createProject, updateProject, deleteProject } =
    useProjects();

  const [filters, setFilters] = useState<ProjectFiltersType>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleCreateProject = async (data: CreateProjectInput) => {
    try {
      await createProject(data);
      setIsCreateDialogOpen(false);
      toast.success("Project created successfully");
      fetchProjects(filters);
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleUpdateProject = async (data: CreateProjectInput) => {
    if (!selectedProject) return;

    try {
      await updateProject(selectedProject.id, data);
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      toast.success("Project updated successfully");
      fetchProjects(filters);
    } catch {
      toast.error("Failed to update project");
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      await deleteProject(selectedProject.id);
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
      toast.success("Project deleted successfully");
      fetchProjects(filters);
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-8 pt-6 sm:pt-8 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Projects</h1>
          <p className="text-sm text-[#525252] mt-1">
            Manage all your projects in one place
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[#18181B] hover:bg-[#27272A] text-white w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-8 pb-8 flex-1 min-h-0">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <ProjectFilters onFiltersChange={setFilters} />
        </div>

        {/* Projects Grid */}
        <div className="flex-1 min-w-0 flex flex-col">
          {isLoading ? (
            <div className="border border-[#E5E5E5] rounded-lg overflow-hidden bg-white">
              <TableSkeleton rows={8} />
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-[#525252]">
                Showing {projects.length} project{projects.length !== 1 ? "s" : ""}
              </div>
              <div className="flex-1 min-h-0">
                <ProjectsGrid
                  projects={projects}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Project Dialog */}
      <ProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateProject}
        isLoading={isLoading}
      />

      {/* Edit Project Dialog */}
      <ProjectDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateProject}
        project={selectedProject}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteProject}
        itemName={selectedProject?.projectName}
        isLoading={isLoading}
      />
    </div>
  );
}
