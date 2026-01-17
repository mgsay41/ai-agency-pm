"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle, Users, Briefcase } from "lucide-react";
import { logger } from "@/lib/logger";

interface DeactivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
  onConfirm: (userId: string, transferToUserId: string) => Promise<void>;
}

interface OwnershipStats {
  clients: number;
  activeClients: number;
  projects: number;
  activeProjects: number;
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
}

export function DeactivateUserDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: DeactivateUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStats, setIsFetchingStats] = useState(false);
  const [transferToUserId, setTransferToUserId] = useState<string>("");
  const [ownershipStats, setOwnershipStats] = useState<OwnershipStats | null>(
    null
  );
  const [availableAdmins, setAvailableAdmins] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch ownership stats when dialog opens
  useEffect(() => {
    if (open && user) {
      fetchOwnershipStats();
    } else {
      // Reset state when dialog closes
      setTransferToUserId("");
      setOwnershipStats(null);
      setAvailableAdmins([]);
      setError(null);
    }
  }, [open, user]);

  async function fetchOwnershipStats() {
    if (!user) return;

    setIsFetchingStats(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}/stats`);

      if (!response.ok) {
        throw new Error("Failed to fetch ownership statistics");
      }

      const data = await response.json();

      if (data.success) {
        setOwnershipStats(data.data.stats);
        setAvailableAdmins(data.data.availableAdmins);

        // Auto-select first admin if available
        if (data.data.availableAdmins.length > 0) {
          setTransferToUserId(data.data.availableAdmins[0].id);
        }
      }
    } catch (err) {
      logger.error("Failed to fetch ownership stats", err, {
        action: "fetch_ownership_stats",
        userId: user.id,
      });
      setError("Failed to load ownership information. Please try again.");
    } finally {
      setIsFetchingStats(false);
    }
  }

  async function handleConfirm() {
    if (!user || !transferToUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(user.id, transferToUserId);
      onOpenChange(false);
    } catch (err) {
      logger.error("Failed to deactivate user", err, {
        action: "deactivate_user",
        userId: user.id,
      });
      setError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate user. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) return null;

  const hasClients = ownershipStats && ownershipStats.clients > 0;
  const canProceed = !hasClients || (hasClients && transferToUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#171717] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#EA580C]" />
            Deactivate User
          </DialogTitle>
          <DialogDescription className="text-[#525252]">
            Are you sure you want to deactivate{" "}
            <span className="font-medium text-[#171717]">
              {user.name || user.email}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-[#FEF2F2] border border-[#DC2626] rounded-lg p-3">
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        )}

        {isFetchingStats ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#525252]" />
            <span className="ml-2 text-sm text-[#525252]">
              Loading ownership information...
            </span>
          </div>
        ) : ownershipStats ? (
          <div className="space-y-4">
            {/* Ownership Statistics */}
            <div className="bg-[#FAFAFA] rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium text-[#171717]">
                Ownership Summary
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#525252]" />
                  <div>
                    <div className="text-xs text-[#A3A3A3]">Clients</div>
                    <div className="text-sm font-medium text-[#171717]">
                      {ownershipStats.clients}{" "}
                      <span className="text-xs text-[#16A34A]">
                        ({ownershipStats.activeClients} active)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#525252]" />
                  <div>
                    <div className="text-xs text-[#A3A3A3]">Projects</div>
                    <div className="text-sm font-medium text-[#171717]">
                      {ownershipStats.projects}{" "}
                      <span className="text-xs text-[#16A34A]">
                        ({ownershipStats.activeProjects} active)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer Selection */}
            {hasClients && (
              <div className="space-y-2">
                <Label htmlFor="transferTo" className="text-[#171717]">
                  Transfer Ownership To{" "}
                  <span className="text-[#DC2626]">*</span>
                </Label>
                <Select
                  value={transferToUserId}
                  onValueChange={setTransferToUserId}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="transferTo"
                    className="border-[#E5E5E5] focus:border-[#18181B]"
                  >
                    <SelectValue placeholder="Select an admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAdmins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.name || admin.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#A3A3A3]">
                  All clients owned by this user will be transferred to the
                  selected admin. Associated projects will remain accessible to
                  the new owner.
                </p>
              </div>
            )}

            {!hasClients && (
              <div className="bg-[#F0FDF4] border border-[#16A34A] rounded-lg p-3">
                <p className="text-sm text-[#16A34A]">
                  This user has no clients. No ownership transfer is required.
                </p>
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-[#E5E5E5] hover:bg-[#FAFAFA]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || isFetchingStats || !canProceed}
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              "Deactivate User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
