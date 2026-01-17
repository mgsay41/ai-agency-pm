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
} from "lucide-react";
import { format } from "date-fns";
import { useClient, useClientContacts } from "@/hooks/use-clients";
import Link from "next/link";
import { ContactDialog } from "@/components/clients/contact-dialog";
import type { ClientContactFormData } from "@/lib/validations/client";
import { toast } from "sonner";

// Type definitions
interface ClientProject {
  id: string;
  projectName: string;
  status: string;
  startDate: string;
}

interface ClientContact {
  id: string;
  contactName: string;
  jobTitle?: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
}

interface ClientDetail {
  id: string;
  companyName: string;
  clientType: string;
  isActive: boolean;
  industry?: string;
  website?: string;
  billingAddress?: string;
  timeZone?: string;
  clientSince?: string;
  preferredCommunication?: string[];
  companySize?: string;
  tags?: string[];
  notes?: string;
  projects?: ClientProject[];
  totalProjectsCount?: number;
}

// Removed unused ContactDialog component and interface - will be implemented when needed

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const { client, loading, error, fetchClient } = useClient(clientId);
  const {
    contacts,
    loading: contactsLoading,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact,
  } = useClientContacts(clientId);

  const [activeTab, setActiveTab] = useState("overview");
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientContact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClient();
      fetchContacts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleAddContact = () => {
    setEditingContact(null);
    setIsContactDialogOpen(true);
  };

  const handleEditContact = (contact: ClientContact) => {
    setEditingContact(contact);
    setIsContactDialogOpen(true);
  };

  const handleSubmitContact = async (
    data: Omit<ClientContactFormData, "clientId">
  ) => {
    try {
      setIsSubmitting(true);

      if (editingContact) {
        await updateContact(editingContact.id, data);
        toast.success("Contact updated successfully");
      } else {
        await addContact(data);
        toast.success("Contact added successfully");
      }

      setIsContactDialogOpen(false);
      setEditingContact(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save contact"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      await deleteContact(contactId);
      toast.success("Contact deleted successfully");
      // Refresh client data to update counts
      await fetchClient();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete contact";

      // If contact was already deleted, just refresh the list
      if (errorMessage.includes("not found") || errorMessage.includes("already deleted")) {
        toast.info("Contact was already deleted");
        await fetchContacts();
        await fetchClient();
      } else {
        toast.error(errorMessage);
      }
    }
  };

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

  // Type assertion with proper type
  const clientData = client as ClientDetail;

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
              {clientData.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#171717] mb-2">
                {clientData.companyName}
              </h1>
              <div className="flex items-center gap-3">
                <Badge
                  className={`${clientTypeColors[clientData.clientType] || "bg-[#FAFAFA] text-[#525252]"} rounded font-normal pointer-events-none`}
                >
                  {clientData.clientType}
                </Badge>
                <Badge
                  className={`${
                    clientData.isActive
                      ? "bg-[#F0FDF4] text-[#16A34A]"
                      : "bg-[#F5F5F5] text-[#737373]"
                  } rounded font-normal pointer-events-none`}
                >
                  {clientData.isActive ? "Active" : "Inactive"}
                </Badge>
                {clientData.industry && (
                  <span className="text-sm text-[#525252]">
                    <Building2 className="inline h-4 w-4 mr-1" />
                    {clientData.industry}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-[#A3A3A3]">Total Projects</div>
            <div className="text-3xl font-semibold text-[#171717]">
              {clientData.totalProjectsCount || 0}
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
              Projects ({clientData.totalProjectsCount || 0})
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
                {clientData.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-[#525252] mt-0.5" />
                    <div>
                      <div className="text-xs text-[#A3A3A3] mb-1">Website</div>
                      <a
                        href={clientData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2563EB] hover:underline"
                      >
                        {clientData.website}
                      </a>
                    </div>
                  </div>
                )}

                {clientData.billingAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#525252] mt-0.5" />
                    <div>
                      <div className="text-xs text-[#A3A3A3] mb-1">
                        Billing Address
                      </div>
                      <div className="text-[#171717] whitespace-pre-line">
                        {clientData.billingAddress}
                      </div>
                    </div>
                  </div>
                )}

                {clientData.timeZone && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#525252] mt-0.5" />
                    <div>
                      <div className="text-xs text-[#A3A3A3] mb-1">Time Zone</div>
                      <div className="text-[#171717]">{clientData.timeZone}</div>
                    </div>
                  </div>
                )}

                {clientData.clientSince && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-[#525252] mt-0.5" />
                    <div>
                      <div className="text-xs text-[#A3A3A3] mb-1">
                        Client Since
                      </div>
                      <div className="text-[#171717]">
                        {format(new Date(clientData.clientSince), "MMMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                )}

                {clientData.preferredCommunication &&
                  clientData.preferredCommunication.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-[#525252] mt-0.5" />
                      <div>
                        <div className="text-xs text-[#A3A3A3] mb-1">
                          Preferred Communication
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {clientData.preferredCommunication.map((method) => (
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
              {clientData.companySize && (
                <Card className="border-[#E5E5E5] rounded-lg">
                  <CardContent className="pt-6">
                    <div className="text-xs text-[#A3A3A3] mb-1">
                      Company Size
                    </div>
                    <div className="text-2xl font-semibold text-[#171717]">
                      {clientData.companySize.replace("-", " - ")} employees
                    </div>
                  </CardContent>
                </Card>
              )}

              {clientData.tags && clientData.tags.length > 0 && (
                <Card className="border-[#E5E5E5] rounded-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-4 w-4 text-[#525252]" />
                      <div className="text-xs text-[#A3A3A3]">Tags</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {clientData.tags.map((tag) => (
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
            {clientData.notes && (
              <Card className="border-[#E5E5E5] rounded-lg col-span-3">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-[#171717]">
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#525252] whitespace-pre-line">
                    {clientData.notes}
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
              onClick={handleAddContact}
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
              {contacts.map((contact) => {
                const typedContact = contact as ClientContact;
                return (
                  <Card key={typedContact.id} className="border-[#E5E5E5] rounded-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#FAFAFA] flex items-center justify-center text-lg font-medium text-[#525252]">
                            {typedContact.contactName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#171717] flex items-center gap-2">
                              {typedContact.contactName}
                              {typedContact.isPrimary && (
                                <Badge className="bg-[#EFF6FF] text-[#2563EB] rounded font-normal text-xs pointer-events-none">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            {typedContact.jobTitle && (
                              <div className="text-sm text-[#525252]">
                                {typedContact.jobTitle}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-[#FAFAFA]"
                            onClick={() => handleEditContact(typedContact)}
                          >
                            <Pencil className="h-3 w-3 text-[#525252]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-[#FEF2F2]"
                            onClick={() => handleDeleteContact(typedContact.id)}
                          >
                            <Trash2 className="h-3 w-3 text-[#DC2626]" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-[#525252]" />
                          <a
                            href={`mailto:${typedContact.email}`}
                            className="text-[#2563EB] hover:underline"
                          >
                            {typedContact.email}
                          </a>
                        </div>
                        {typedContact.phone && (
                          <div className="flex items-center gap-2 text-sm text-[#525252]">
                            <Phone className="h-4 w-4" />
                            {typedContact.phone}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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

          {clientData.projects && clientData.projects.length > 0 ? (
            <div className="space-y-4">
              {clientData.projects.map((project) => (
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

      {/* Contact Dialog */}
      <ContactDialog
        open={isContactDialogOpen}
        onOpenChange={(open) => {
          setIsContactDialogOpen(open);
          if (!open) {
            setEditingContact(null);
          }
        }}
        onSubmit={handleSubmitContact}
        contact={editingContact}
        isLoading={isSubmitting}
      />
    </div>
  );
}
