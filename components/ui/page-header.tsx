import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-[#E5E5E5] pb-6",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-semibold text-[#171717]">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[#525252]">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
