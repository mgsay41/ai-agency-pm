import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "./project-detail-client";
import { getProjectById } from "@/lib/services/project.service";
import { logger } from "@/lib/logger";

async function getProject(id: string) {
  try {
    const project = await getProjectById(id);
    return project;
  } catch (error) {
    logger.error("Failed to fetch project", error, { action: "fetch_project" });
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);

  return {
    title: project ? `${project.project_name} - AI Agency PM` : "Project Not Found",
    description: project?.description || "Project details",
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} />;
}
