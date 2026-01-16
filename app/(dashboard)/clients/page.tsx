"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientsGrid } from "@/components/clients/clients-grid";
import type { ClientGridItem } from "@/components/clients/clients-grid";
import { ClientFilters, type ClientFiltersType } from "@/components/clients/client-filters";
import { ClientDialog } from "@/components/clients/client-dialog";
import type { Client } from "@/components/clients/client-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useClients, useClientMutations } from "@/hooks/use-clients";
import type { ClientFormData } from "@/lib/validations/client";
import { toast } from "sonner";

export default function ClientsPage() {
  const [filters, setFilters] = useState<ClientFiltersType>({});
  const { clients, loading, fetchClients } = useClients(filters);
  const { createClient, updateClient, deleteClient, loading: mutationLoading } = useClientMutations();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, [filters, fetchClients]);

  const handleCreateClient = async (data: ClientFormData) => {
    try {
      await createClient(data);
      setIsCreateDialogOpen(false);
      toast.success("Client created successfully");
      fetchClients();
    } catch (error: any) {
      toast.error(error.message || "Failed to create client");
    }
  };

  const handleUpdateClient = async (data: ClientFormData) => {
    if (!selectedClient) return;

    try {
      await updateClient(selectedClient.id, data);
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      toast.success("Client updated successfully");
      fetchClients();
    } catch (error: any) {
      toast.error(error.message || "Failed to update client");
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      await deleteClient(selectedClient.id);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
      toast.success("Client deleted successfully");
      fetchClients();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete client");
    }
  };

  const handleEdit = (client: ClientGridItem) => {
    setSelectedClient(client as Client);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (client: ClientGridItem) => {
    setSelectedClient(client as Client);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-8 pt-6 sm:pt-8 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Clients</h1>
          <p className="text-sm text-[#525252] mt-1">
            Manage all your clients in one place
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[#18181B] hover:bg-[#27272A] text-white w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Client
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-8 pb-8 flex-1 min-h-0">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <ClientFilters onFiltersChange={setFilters} />
        </div>

        {/* Clients Grid */}
        <div className="flex-1 min-w-0 flex flex-col">
          {loading ? (
            <div className="border border-[#E5E5E5] rounded-lg overflow-hidden bg-white p-6">
              <TableSkeleton rows={6} />
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-[#525252]">
                Showing {clients?.length || 0} client{clients?.length !== 1 ? "s" : ""}
              </div>
              <div className="flex-1 min-h-0">
                <ClientsGrid
                  clients={(clients || []) as any}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Client Dialog */}
      <ClientDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateClient}
        isLoading={mutationLoading}
      />

      {/* Edit Client Dialog */}
      <ClientDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateClient}
        client={selectedClient}
        isLoading={mutationLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteClient}
        itemName={selectedClient?.companyName}
        isLoading={mutationLoading}
      />
    </div>
  );
}
