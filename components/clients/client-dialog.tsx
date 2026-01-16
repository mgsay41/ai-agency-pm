"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from "./client-form";
import type { ClientFormData } from "@/lib/validations/client";

export interface Client {
  id: string;
  clientType: string;
  companyName: string;
  industry: string | null;
  companySize: string | null;
  website: string | null;
  billingAddress: string | null;
  timeZone: string | null;
  preferredCommunication: string[];
  tags: string[];
  notes: string | null;
  isActive: boolean;
  clientSince: Date | string | null;
}

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  client?: Client | null;
  isLoading?: boolean;
}

export function ClientDialog({
  open,
  onOpenChange,
  onSubmit,
  client,
  isLoading,
}: ClientDialogProps) {
  const isEditing = !!client;

  const defaultValues: Partial<ClientFormData> | undefined = client
    ? {
        clientType: client.clientType as any,
        companyName: client.companyName,
        industry: client.industry || "",
        companySize: client.companySize as any,
        website: client.website || "",
        billingAddress: client.billingAddress || "",
        timeZone: client.timeZone || "",
        preferredCommunication: client.preferredCommunication as any,
        tags: client.tags || [],
        notes: client.notes || "",
        isActive: client.isActive,
        clientSince: client.clientSince
          ? new Date(client.clientSince)
          : undefined,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E5E5] shrink-0">
          <DialogTitle className="text-2xl font-semibold text-[#171717]">
            {isEditing ? "Edit Client" : "Create New Client"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-4 scrollbar-thin scrollbar-thumb-[#E5E5E5] scrollbar-track-transparent hover:scrollbar-thumb-[#D4D4D4]">
          <ClientForm
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            defaultValues={defaultValues}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
