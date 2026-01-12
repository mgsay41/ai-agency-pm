import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-[#E5E5E5] bg-white p-8 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFAFA]">
          <Icon className="h-6 w-6 text-[#A3A3A3]" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-[#171717]">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-[#525252]">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[#18181B] hover:bg-[#27272A]"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
