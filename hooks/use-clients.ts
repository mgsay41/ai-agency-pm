"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ClientFormData } from "@/lib/validations/client";

export interface Client {
  id: string;
  companyName: string;
  clientType: "COMPANY" | "INDIVIDUAL" | "NONPROFIT" | "GOVERNMENT";
  industry?: string | null;
  companySize?: string | null;
  website?: string | null;
  billingAddress?: string | null;
  timeZone?: string | null;
  preferredCommunication?: string[];
  tags?: string[];
  notes?: string | null;
  isActive: boolean;
  clientSince?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  activeProjectsCount?: number;
  totalProjectsCount?: number;
  primaryContact?: ClientContact | null;
}

export interface ClientContact {
  id: string;
  clientId: string;
  isPrimary: boolean;
  contactName: string;
  jobTitle?: string | null;
  email: string;
  phone?: string | null;
  mobile?: string | null;
  linkedinUrl?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UseClientsOptions {
  search?: string;
  industry?: string;
  isActive?: boolean;
  clientType?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useClients(options?: UseClientsOptions) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options?.search) params.append("search", options.search);
      if (options?.industry) params.append("industry", options.industry);
      if (options?.isActive !== undefined)
        params.append("isActive", String(options.isActive));
      if (options?.clientType && options.clientType.length > 0)
        params.append("clientType", options.clientType.join(","));
      if (options?.page) params.append("page", String(options.page));
      if (options?.limit) params.append("limit", String(options.limit));
      if (options?.sortBy) params.append("sortBy", options.sortBy);
      if (options?.sortOrder) params.append("sortOrder", options.sortOrder);

      const response = await fetch(`/api/clients?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch clients");
      }

      setClients(data.data);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    clients,
    loading,
    error,
    pagination,
    fetchClients,
    setClients,
  };
}

export function useClient(id: string | null) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/clients/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch client");
      }

      setClient(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    client,
    loading,
    error,
    fetchClient,
    setClient,
  };
}

export function useClientMutations() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClient = useCallback(
    async (data: ClientFormData & { contact?: any }) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to create client");
        }

        router.refresh();
        return result.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const updateClient = useCallback(
    async (id: string, data: Partial<ClientFormData>) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/clients/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to update client");
        }

        router.refresh();
        return result.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const deleteClient = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/clients/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to delete client");
        }

        router.refresh();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return {
    createClient,
    updateClient,
    deleteClient,
    loading,
    error,
  };
}

// Hook for managing client contacts
export function useClientContacts(clientId: string | null) {
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/clients/${clientId}/contacts`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch contacts");
      }

      setContacts(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const addContact = useCallback(
    async (contactData: any) => {
      if (!clientId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/clients/${clientId}/contacts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to add contact");
        }

        await fetchContacts();
        return result.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clientId, fetchContacts]
  );

  const updateContact = useCallback(
    async (contactId: string, contactData: any) => {
      if (!clientId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/clients/${clientId}/contacts/${contactId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(contactData),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to update contact");
        }

        await fetchContacts();
        return result.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clientId, fetchContacts]
  );

  const deleteContact = useCallback(
    async (contactId: string) => {
      if (!clientId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/clients/${clientId}/contacts/${contactId}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to delete contact");
        }

        await fetchContacts();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clientId, fetchContacts]
  );

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact,
  };
}
