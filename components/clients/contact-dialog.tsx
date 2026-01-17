"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactForm } from "./contact-form";
import type { ClientContactFormData } from "@/lib/validations/client";

export interface ContactDialogData {
  id: string;
  contactName: string;
  jobTitle?: string | null;
  email: string;
  phone?: string | null;
  mobile?: string | null;
  linkedinUrl?: string | null;
  notes?: string | null;
  isPrimary: boolean;
}

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<ClientContactFormData, "clientId">) => Promise<void>;
  contact?: ContactDialogData | null;
  isLoading?: boolean;
}

export function ContactDialog({
  open,
  onOpenChange,
  onSubmit,
  contact,
  isLoading,
}: ContactDialogProps) {
  const isEditing = !!contact;

  const defaultValues: Partial<Omit<ClientContactFormData, "clientId">> | undefined = contact
    ? {
        contactName: contact.contactName,
        jobTitle: contact.jobTitle || "",
        email: contact.email,
        phone: contact.phone || "",
        mobile: contact.mobile || "",
        linkedinUrl: contact.linkedinUrl || "",
        notes: contact.notes || "",
        isPrimary: contact.isPrimary,
      }
    : {
        isPrimary: false,
      };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E5E5] shrink-0">
          <DialogTitle className="text-2xl font-semibold text-[#171717]">
            {isEditing ? "Edit Contact" : "Add New Contact"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-4 scrollbar-thin scrollbar-thumb-[#E5E5E5] scrollbar-track-transparent hover:scrollbar-thumb-[#D4D4D4]">
          <ContactForm
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
