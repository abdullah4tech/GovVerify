"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Divider,
} from "@heroui/react";
import Link from "next/link";

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
        >
          <span className="material-icons-outlined">arrow_back</span>
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
          <Card className="w-full">
            <CardHeader className="px-6 pt-6 pb-0">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
                Metadata
              </h3>
            </CardHeader>
            <CardBody className="px-6 py-6 gap-6">
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
                  <div className="mt-1">
                    <Chip
                      color={statusColorMap[doc.status]}
                      variant="flat"
                      size="sm"
                      className="capitalize"
                    >
                      {doc.status}
                    </Chip>
                  </div>
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
                    className="text-blue-600 hover:underline block mt-1 truncate"
                  >
                    View Document ↗
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="w-full">
            <CardHeader className="px-6 pt-6 pb-0">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
                Content Preview
              </h3>
            </CardHeader>
            <CardBody className="px-6 py-6">
              <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-8 text-center border border-zinc-200 dark:border-zinc-800 border-dashed">
                <span className="material-icons-outlined text-4xl text-zinc-400 mb-2">
                  description
                </span>
                <p className="text-zinc-500">
                  PDF Preview not available in this demo.
                </p>
                <Button
                  as="a"
                  href={doc.url}
                  target="_blank"
                  variant="light"
                  color="primary"
                  className="mt-4"
                >
                  Download PDF
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Statistics */}
        <div className="space-y-6">
          <Card className="w-full border-t-4 border-t-blue-600">
            <CardHeader className="px-6 pt-6 pb-0 flex flex-col items-start gap-1">
              <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs">
                <span className="material-icons-outlined text-sm">
                  insert_drive_file
                </span>
                Document Info
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Usage Statistics
              </h3>
            </CardHeader>
            <CardBody className="px-6 py-8">
              <div className="w-full flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <span className="material-icons-outlined">visibility</span>
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

              <Divider className="my-6" />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Status</span>
                  <Chip
                    color={statusColorMap[doc.status]}
                    variant="flat"
                    size="sm"
                    className="capitalize"
                  >
                    {doc.status}
                  </Chip>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Category</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white capitalize">
                    {doc.category}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Uploaded</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
