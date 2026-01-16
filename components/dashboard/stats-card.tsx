"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className = "",
}: StatsCardProps) {
  return (
    <Card className={`border-[#E5E5E5] rounded-lg hover:border-[#D4D4D4] transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-[#A3A3A3] mb-3 font-medium">{title}</p>
            <p className="text-4xl font-bold text-[#171717] mb-1">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-3">
                <span
                  className={`text-xs font-medium ${
                    trend.isPositive ? "text-[#16A34A]" : "text-[#DC2626]"
                  }`}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-[#A3A3A3]">vs last month</span>
              </div>
            )}
          </div>
          <div className="p-3.5 bg-[#F4F4F5] rounded-lg">
            <Icon className="h-6 w-6 text-[#18181B]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
