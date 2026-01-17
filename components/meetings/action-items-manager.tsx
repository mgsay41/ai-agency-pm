"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Save, X, Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import { logger } from "@/lib/logger";
import { actionItemStatusLabels } from "@/lib/validations/meeting";
import { format } from "date-fns";

interface ActionItem {
  id?: string;
  description: string;
  assignedTo?: string;
  dueDate?: string;
  status?: string;
  TeamMember?: {
    id: string;
    fullName: string;
  };
}

interface TeamMember {
  id: string;
  fullName: string;
}

interface ActionItemsManagerProps {
  meetingId: string;
  initialActionItems: ActionItem[];
  teamMembers: TeamMember[];
  canEdit?: boolean;
  onSuccess: () => void;
}

export function ActionItemsManager({
  meetingId,
  initialActionItems,
  teamMembers = [],
  canEdit = true,
  onSuccess,
}: ActionItemsManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionItems, setActionItems] = useState<ActionItem[]>(initialActionItems);

  useEffect(() => {
    setActionItems(initialActionItems);
  }, [initialActionItems]);

  const handleAddItem = () => {
    setActionItems([
      ...actionItems,
      {
        description: "",
        status: "OPEN",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof ActionItem, value: any) => {
    const updated = [...actionItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setActionItems(updated);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/meetings/${meetingId}/action-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionItems: actionItems.filter(item => item.description.trim() !== ""),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update action items");
      }

      setIsEditing(false);
      onSuccess();
    } catch (error) {
      logger.error("Failed to update action items", error, { action: "update_action_items" });
      alert("Failed to update action items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setActionItems(initialActionItems);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Card className="border-[#E5E5E5]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#171717]">
              Action Items ({initialActionItems.length})
            </CardTitle>
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-[#E5E5E5]"
              >
                <Edit className="h-4 w-4 mr-2" />
                Manage Items
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {initialActionItems.length > 0 ? (
            <div className="space-y-3">
              {initialActionItems.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-3 rounded border border-[#E5E5E5] space-y-2"
                >
                  <div className="flex items-start gap-2">
                    {item.status === "COMPLETED" ? (
                      <CheckCircle className="h-5 w-5 text-[#16A34A] mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-[#A3A3A3] mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-[#171717]">{item.description}</p>
                      {item.TeamMember && (
                        <p className="text-sm text-[#525252] mt-1">
                          Assigned to: {item.TeamMember.fullName}
                        </p>
                      )}
                      {item.dueDate && (
                        <p className="text-sm text-[#525252]">
                          Due: {format(new Date(item.dueDate), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      item.status === "COMPLETED"
                        ? "bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20"
                        : item.status === "IN_PROGRESS"
                        ? "bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/20"
                        : "bg-[#FFF7ED] text-[#EA580C] border-[#EA580C]/20"
                    }
                  >
                    {actionItemStatusLabels[item.status as keyof typeof actionItemStatusLabels]}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#A3A3A3]">No action items yet. Click "Manage Items" to add some.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#E5E5E5]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-[#171717]">Manage Action Items</CardTitle>
        <p className="text-sm text-[#525252] mt-1">
          Add tasks and assign them to team members
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {actionItems.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-[#E5E5E5] rounded-lg">
            <Circle className="h-12 w-12 text-[#A3A3A3] mx-auto mb-3" />
            <p className="text-sm text-[#525252] mb-4">No action items yet</p>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              className="border-[#E5E5E5]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Action Item
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {actionItems.map((item, index) => (
              <div key={index} className="p-4 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-white transition-colors">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`description-${index}`} className="text-xs font-medium text-[#525252] uppercase tracking-wide">
                        Description
                      </Label>
                      <Textarea
                        id={`description-${index}`}
                        value={item.description}
                        onChange={(e) => handleUpdateItem(index, "description", e.target.value)}
                        placeholder="What needs to be done?"
                        className="border-[#E5E5E5] bg-white min-h-[80px] resize-none"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="text-[#DC2626] hover:text-[#DC2626] hover:bg-[#FEF2F2] mt-6"
                      title="Remove action item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`assignee-${index}`} className="text-xs font-medium text-[#525252] uppercase tracking-wide">
                        Assigned To
                      </Label>
                      <Select
                        value={item.assignedTo || ""}
                        onValueChange={(value) => handleUpdateItem(index, "assignedTo", value)}
                      >
                        <SelectTrigger className="border-[#E5E5E5] bg-white">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(teamMembers) && teamMembers.length > 0 ? (
                            teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.fullName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-6 text-center text-sm text-[#A3A3A3]">
                              No team members available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`dueDate-${index}`} className="text-xs font-medium text-[#525252] uppercase tracking-wide">
                        Due Date
                      </Label>
                      <Input
                        id={`dueDate-${index}`}
                        type="date"
                        value={item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => handleUpdateItem(index, "dueDate", e.target.value)}
                        className="border-[#E5E5E5] bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`status-${index}`} className="text-xs font-medium text-[#525252] uppercase tracking-wide">
                        Status
                      </Label>
                      <Select
                        value={item.status || "OPEN"}
                        onValueChange={(value) => handleUpdateItem(index, "status", value)}
                      >
                        <SelectTrigger className="border-[#E5E5E5] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">
                            <div className="flex items-center gap-2">
                              <Circle className="h-3 w-3 text-[#EA580C]" />
                              Open
                            </div>
                          </SelectItem>
                          <SelectItem value="IN_PROGRESS">
                            <div className="flex items-center gap-2">
                              <Circle className="h-3 w-3 text-[#2563EB] fill-[#2563EB]" />
                              In Progress
                            </div>
                          </SelectItem>
                          <SelectItem value="COMPLETED">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-[#16A34A]" />
                              Completed
                            </div>
                          </SelectItem>
                          <SelectItem value="CANCELLED">
                            <div className="flex items-center gap-2">
                              <X className="h-3 w-3 text-[#A3A3A3]" />
                              Cancelled
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {actionItems.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddItem}
            className="border-[#E5E5E5] border-dashed w-full hover:bg-[#FAFAFA]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Action Item
          </Button>
        )}

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E5E5E5]">
          <p className="text-sm text-[#525252]">
            {actionItems.length} {actionItems.length === 1 ? 'item' : 'items'}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="border-[#E5E5E5]"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || actionItems.every(item => !item.description.trim())}
              className="bg-[#18181B] hover:bg-[#27272A]"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Action Items"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
