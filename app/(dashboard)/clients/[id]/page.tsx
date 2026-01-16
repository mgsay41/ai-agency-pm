"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  Calendar,
  Tag,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { useClient, useClientContacts } from "@/hooks/use-clients";
import { toast } from "sonner";
import Link from "next/link";

// Contact Dialog Component (simplified version)
function ContactDialog({
  open,
  onOpenChange,
  clientId,
  contact,
  onSuccess,
}: any) {
  // This would be implemented with a full form
  // For now, it's a placeholder
  return null;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const { client, loading, error, fetchClient } = useClient(clientId);
  const {
    contacts,
    loading: contactsLoading,
    fetchContacts,
  } = useClientContacts(clientId);

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (clientId) {
      fetchClient();
      fetchContacts();
    }
  }, [clientId, fetchClient, fetchContacts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#525252]">Loading client details...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-[#DC2626] text-lg mb-2">Client not found</div>
          <Button
            variant="outline"
            onClick={() => router.push("/clients")}
            className="border-[#E5E5E5]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  const clientTypeColors: Record<string, string> = {
    COMPANY: "bg-[#EFF6FF] text-[#2563EB]",
    INDIVIDUAL: "bg-[#F0FDF4] text-[#16A34A]",
    NONPROFIT: "bg-[#FFF7ED] text-[#EA580C]",
    GOVERNMENT: "bg-[#F5F5F5] text-[#737373]",
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-[#E5E5E5]">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/clients")}
            className="text-[#525252] hover:text-[#171717] hover:bg-[#FAFAFA]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-[#E5E5E5] hover:bg-[#FAFAFA]"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Client
            </Button>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#18181B] text-white flex items-center justify-center text-2xl font-semibold">
              {(client as any).companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#171717] mb-2">
                {(client as any).companyName}
              </h1>
              <div className="flex items-center gap-3">
                <Badge
                  className={`${clientTypeColors[(client as any).clientType] || "bg-[#FAFAFA] text-[#525252]"} rounded font-normal pointer-events-none`}
                >
                  {(client as any).clientType}
                </Badge>
                <Badge
                  className={`${
                    (client as any).isActive
                      ? "bg-[#F0FDF4] text-[#16A34A]"
                      : "bg-[#F5F5F5] text-[#737373]"
                  } rounded font-normal pointer-events-none`}
                >
                  {(client as any).isActive ? "Active" : "Inactive"}
                </Badge>
                {(client as any).industry && (
                  <span className="text-sm text-[#525252]">
                    <Building2 className="inline h-4 w-4 mr-1" />
                    {(client as any).industry}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-[#A3A3A3]">Total Projects</div>
            <div className="text-3xl font-semibold text-[#171717]">
              {(client as any).totalProjectsCount || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="border-b border-[#E5E5E5] px-8">
          <TabsList className="bg-transparent border-0 p-0 h-12">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#18181B] rounded-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#18181B] rounded-none"
            >
              Contacts ({contacts?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#18181B] rounded-none"
            >
              Projects ({(client as any).totalProjectsCount || 0})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="flex-1 px-8 py-6 mt-0">
          <div className="grid grid-cols-3 gap-6">
            {/* Contact Information */}
            <Card className="border-[#E5E5E5] rounded-lg col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-[#171717]">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(client as any).website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-[#525252] mt-0.5" />
                    <div>
                      <div className="text-xs text-[#A3A3A3] mb-1">Website</div>
                      <a
                        href={(client as any).website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2563EB] hover:underline"
                      >
                        {(client as any).website}
                      </a>
                    </div>
                  </div>
                )}

                {(client as any).billingAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#525252] mt-0.5" />
                    <div>
                      <div className="text-xs text-[#A3A3A3] mb-1">
                        Billing Address
                      </div>
                      <div className="text-[#171717] whitespace-pre-line">
                        {(client as any).billingAddress}
                      </div>
                    </div>
                  </div>
                )}

                {(client as any).timeZone && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#525252] mt-0.5" />
                    <div>
                      <div className="text-xs text-[#A3A3A3] mb-1">Time Zone</div>
                      <div className="text-[#171717]">{(client as any).timeZone}</div>
                    </div>
                  </div>
                )}

                {(client as any).clientSince && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-[#525252] mt-0.5" />
                    <div>
                      <div className="text-xs text-[#A3A3A3] mb-1">
                        Client Since
                      </div>
                      <div className="text-[#171717]">
                        {format(new Date((client as any).clientSince), "MMMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                )}

                {(client as any).preferredCommunication &&
                  (client as any).preferredCommunication.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-[#525252] mt-0.5" />
                      <div>
                        <div className="text-xs text-[#A3A3A3] mb-1">
                          Preferred Communication
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(client as any).preferredCommunication.map((method: string) => (
                            <Badge
                              key={method}
                              className="bg-[#FAFAFA] text-[#525252] rounded font-normal pointer-events-none"
                            >
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-6">
              {(client as any).companySize && (
                <Card className="border-[#E5E5E5] rounded-lg">
                  <CardContent className="pt-6">
                    <div className="text-xs text-[#A3A3A3] mb-1">
                      Company Size
                    </div>
                    <div className="text-2xl font-semibold text-[#171717]">
                      {(client as any).companySize.replace("-", " - ")} employees
                    </div>
                  </CardContent>
                </Card>
              )}

              {(client as any).tags && (client as any).tags.length > 0 && (
                <Card className="border-[#E5E5E5] rounded-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-4 w-4 text-[#525252]" />
                      <div className="text-xs text-[#A3A3A3]">Tags</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(client as any).tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          className="bg-[#FAFAFA] text-[#525252] rounded font-normal pointer-events-none"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Notes */}
            {(client as any).notes && (
              <Card className="border-[#E5E5E5] rounded-lg col-span-3">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-[#171717]">
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#525252] whitespace-pre-line">
                    {(client as any).notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="flex-1 px-8 py-6 mt-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#171717]">
              Contact People
            </h2>
            <Button
              className="bg-[#18181B] hover:bg-[#27272A] text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {contactsLoading ? (
            <div className="text-center py-12 text-[#525252]">
              Loading contacts...
            </div>
          ) : contacts && contacts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {contacts.map((contact) => (
                <Card key={contact.id} className="border-[#E5E5E5] rounded-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#FAFAFA] flex items-center justify-center text-lg font-medium text-[#525252]">
                          {(contact as any).contactName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#171717] flex items-center gap-2">
                            {(contact as any).contactName}
                            {(contact as any).isPrimary && (
                              <Badge className="bg-[#EFF6FF] text-[#2563EB] rounded font-normal text-xs pointer-events-none">
                                Primary
                              </Badge>
                            )}
                          </div>
                          {(contact as any).jobTitle && (
                            <div className="text-sm text-[#525252]">
                              {(contact as any).jobTitle}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-[#FAFAFA]"
                        >
                          <Pencil className="h-3 w-3 text-[#525252]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-[#FEF2F2]"
                        >
                          <Trash2 className="h-3 w-3 text-[#DC2626]" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-[#525252]" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-[#2563EB] hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-[#525252]">
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border border-[#E5E5E5] rounded-lg p-12 text-center">
              <div className="text-[#525252] text-lg mb-2">No contacts yet</div>
              <div className="text-[#A3A3A3] text-sm">
                Add a contact person to get started
              </div>
            </div>
          )}
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="flex-1 px-8 py-6 mt-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#171717]">Projects</h2>
            <Link href="/projects">
              <Button
                variant="outline"
                size="sm"
                className="border-[#E5E5E5] hover:bg-[#FAFAFA]"
              >
                View All Projects
              </Button>
            </Link>
          </div>

          {(client as any).projects && (client as any).projects.length > 0 ? (
            <div className="space-y-4">
              {(client as any).projects.map((project: any) => (
                <Card key={project.id} className="border-[#E5E5E5] rounded-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[#171717] mb-1">
                          {project.projectName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-[#525252]">
                          <Badge className="bg-[#FAFAFA] text-[#525252] rounded font-normal pointer-events-none">
                            {project.status}
                          </Badge>
                          <span>•</span>
                          <span>
                            {format(new Date(project.startDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <Link href={`/projects/${project.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#E5E5E5] hover:bg-[#FAFAFA]"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border border-[#E5E5E5] rounded-lg p-12 text-center">
              <div className="text-[#525252] text-lg mb-2">No projects yet</div>
              <div className="text-[#A3A3A3] text-sm mb-4">
                Create a project for this client to get started
              </div>
              <Link href="/projects">
                <Button className="bg-[#18181B] hover:bg-[#27272A] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
