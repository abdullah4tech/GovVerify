"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DocumentDetailsProps {
  doc: {
    title: string;
    category: string;
    status: string;
    usageCount: number;
    uploaderId: string;
    createdAt: string;
    url: string;
  };
}

export default function DocumentDetails({ doc }: DocumentDetailsProps) {
  const statusColorMap: Record<
    string,
    "success" | "warning" | "danger" | "default"
  > = {
    verified: "success",
    pending: "warning",
    rejected: "danger",
  };

  const getStatusChip = (status: string) => {
    const color = statusColorMap[status] || "default";
    const styles = {
      success:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
      warning:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
      danger:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
      default:
        "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    };

    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
          styles[color]
        )}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Document Details
          </h1>
          <p className="text-zinc-500 mt-1">
            View metadata and verification status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metadata */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-900">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
                Metadata
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Title
                  </label>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium mt-1">
                    {doc.title}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Category
                  </label>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium mt-1 capitalize">
                    {doc.category}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Status
                  </label>
                  <div className="mt-1">{getStatusChip(doc.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Uploaded By
                  </label>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium mt-1 font-mono text-sm">
                    {doc.uploaderId}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Upload Date
                  </label>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium mt-1">
                    {new Date(doc.createdAt).toLocaleDateString()}{" "}
                    {new Date(doc.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    File URL
                  </label>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-1 truncate flex items-center gap-1"
                  >
                    View Document{" "}
                    <Icon icon="lucide:external-link" className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-900">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
                Content Preview
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <Icon
                  icon="lucide:file-text"
                  className="w-12 h-12 text-zinc-300 mx-auto mb-3"
                />
                <p className="text-zinc-500 mb-4">
                  PDF Preview not available in this demo.
                </p>
                <a
                  href={doc.url}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Icon icon="lucide:download" className="w-4 h-4" />
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Statistics */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm border-t-4 border-t-blue-600">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs mb-1">
                <Icon icon="lucide:file-bar-chart" className="w-4 h-4" />
                Document Info
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Usage Statistics
              </h3>
            </div>
            <div className="px-6 pb-8">
              <div className="w-full flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Icon icon="lucide:eye" className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-zinc-500 font-medium uppercase">
                      Total Views
                    </p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {doc.usageCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="my-6 h-px bg-zinc-100 dark:bg-zinc-800" />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Status
                  </span>
                  {getStatusChip(doc.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Category
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white capitalize">
                    {doc.category}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Uploaded
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
