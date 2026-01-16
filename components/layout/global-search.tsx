"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Briefcase, Users, UserCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

interface SearchResult {
  projects: Array<{
    id: string;
    projectName: string;
    projectCode: string | null;
    status: string;
    Client: {
      companyName: string;
    };
  }>;
  clients: Array<{
    id: string;
    companyName: string;
    industry: string | null;
    clientType: string;
  }>;
  teamMembers: Array<{
    id: string;
    fullName: string;
    email: string;
    roleTitle: string;
    status: string;
    avatarColor: string | null;
  }>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-[#F0FDF4] text-[#16A34A]";
    case "PLANNING":
      return "bg-[#EFF6FF] text-[#2563EB]";
    case "ON_HOLD":
      return "bg-[#FFF7ED] text-[#EA580C]";
    case "COMPLETED":
      return "bg-[#F4F4F5] text-[#71717A]";
    default:
      return "bg-[#F4F4F5] text-[#71717A]";
  }
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length < 2) {
        setResults(null);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.data);
          setIsOpen(true);
        }
      } catch (error) {
        logger.error("Search error", error, { action: "global_search" });
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleClear = () => {
    setQuery("");
    setResults(null);
    setIsOpen(false);
  };

  const handleResultClick = () => {
    setQuery("");
    setResults(null);
    setIsOpen(false);
  };

  const totalResults =
    (results?.projects.length || 0) +
    (results?.clients.length || 0) +
    (results?.teamMembers.length || 0);

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3A3A3]" />
        <Input
          type="text"
          placeholder="Search projects, clients, team..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 border-[#E5E5E5] focus:border-[#171717]"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#171717]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && results && (
        <div className="absolute top-full mt-2 w-full bg-white border border-[#E5E5E5] rounded-lg shadow-lg max-h-[500px] overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-[#525252]">
              Searching...
            </div>
          ) : totalResults === 0 ? (
            <div className="p-4 text-center text-sm text-[#525252]">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="py-2">
              {/* Projects */}
              {results.projects.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-medium text-[#A3A3A3] uppercase tracking-wide flex items-center gap-2">
                    <Briefcase className="h-3 w-3" />
                    Projects ({results.projects.length})
                  </div>
                  {results.projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      onClick={handleResultClick}
                      className="block px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#171717] truncate">
                            {project.projectName}
                          </p>
                          <p className="text-xs text-[#525252] truncate">
                            {project.Client.companyName}
                          </p>
                        </div>
                        <Badge
                          className={`text-xs rounded ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Clients */}
              {results.clients.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-medium text-[#A3A3A3] uppercase tracking-wide flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Clients ({results.clients.length})
                  </div>
                  {results.clients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/clients/${client.id}`}
                      onClick={handleResultClick}
                      className="block px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#171717] truncate">
                            {client.companyName}
                          </p>
                          <p className="text-xs text-[#525252]">
                            {client.industry || client.clientType}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Team Members */}
              {results.teamMembers.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-[#A3A3A3] uppercase tracking-wide flex items-center gap-2">
                    <UserCircle className="h-3 w-3" />
                    Team Members ({results.teamMembers.length})
                  </div>
                  {results.teamMembers.map((member) => (
                    <Link
                      key={member.id}
                      href={`/team/${member.id}`}
                      onClick={handleResultClick}
                      className="block px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                          style={{
                            backgroundColor: member.avatarColor || "#525252",
                          }}
                        >
                          {member.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#171717] truncate">
                            {member.fullName}
                          </p>
                          <p className="text-xs text-[#525252] truncate">
                            {member.roleTitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
