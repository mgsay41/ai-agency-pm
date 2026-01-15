"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectsGrid } from "@/components/projects/projects-grid";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
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
  }, [filters, fetchProjects]);

  const handleCreateProject = async (data: CreateProjectInput) => {
    try {
      await createProject(data);
      setIsCreateDialogOpen(false);
      toast.success("Project created successfully");
      fetchProjects(filters);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Projects</h1>
          <p className="text-sm text-[#525252] mt-1">
            Manage all your projects in one place
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[#18181B] hover:bg-[#27272A] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 px-8 pb-8 flex-1 min-h-0">
        {/* Filters Sidebar */}
        <div className="w-64 flex-shrink-0">
          <ProjectFilters onFiltersChange={setFilters} />
        </div>

        {/* Projects Grid */}
        <div className="flex-1 min-w-0 flex flex-col">
          {isLoading ? (
            <div className="border border-[#E5E5E5] rounded-lg p-12 text-center">
              <div className="text-[#525252]">Loading projects...</div>
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
        itemName={selectedProject?.project_name}
        isLoading={isLoading}
      />
    </div>
  );
}
