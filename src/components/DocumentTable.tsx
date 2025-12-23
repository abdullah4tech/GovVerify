"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

interface Document {
  _id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  uploaderId: string;
}

export default function DocumentTable({
  documents,
}: {
  documents: Document[];
}) {
  const router = useRouter();
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredDocuments = [...documents];

    if (hasSearchFilter) {
      filteredDocuments = filteredDocuments.filter((doc) =>
        doc.title.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (statusFilter !== "all" && Array.from(statusFilter).length !== 0) {
      filteredDocuments = filteredDocuments.filter((doc) =>
        Array.from(statusFilter).includes(doc.status)
      );
    }

    return filteredDocuments;
  }, [documents, filterValue, statusFilter, hasSearchFilter]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);

  const statusColorMap: Record<
    string,
    { bg: string; text: string; icon: string }
  > = {
    verified: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-400",
      icon: "lucide:check-circle-2",
    },
    pending: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-400",
      icon: "lucide:clock",
    },
    rejected: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      icon: "lucide:x-circle",
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-end sm:items-center bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Icon
            icon="lucide:search"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search by title..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {filterValue && (
            <button
              onClick={() => setFilterValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <Icon icon="lucide:x" className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <Icon
              icon="lucide:filter"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                <th className="py-4 px-6 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => router.push(`/documents/${item._id}`)}
                    className="group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                          <Icon icon="lucide:file-text" className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize text-zinc-600 dark:text-zinc-400 text-sm bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                          statusColorMap[item.status]?.bg || "bg-zinc-100",
                          statusColorMap[item.status]?.text || "text-zinc-600",
                          "border-transparent"
                        )}
                      >
                        <Icon
                          icon={
                            statusColorMap[item.status]?.icon ||
                            "lucide:help-circle"
                          }
                          className="w-3.5 h-3.5"
                        />
                        <span className="capitalize">{item.status}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-2 text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-full transition-all opacity-0 group-hover:opacity-100">
                        <Icon icon="lucide:chevron-right" className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Icon
                          icon="lucide:search-x"
                          className="w-6 h-6 text-zinc-400"
                        />
                      </div>
                      <p>No documents found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Showing{" "}
              <span className="font-medium text-zinc-900 dark:text-white">
                {(page - 1) * rowsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-zinc-900 dark:text-white">
                {Math.min(page * rowsPerPage, filteredItems.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-zinc-900 dark:text-white">
                {filteredItems.length}
              </span>{" "}
              results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon icon="lucide:chevron-left" className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                        page === p
                          ? "bg-primary text-white shadow-sm"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon icon="lucide:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
