"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
  Button,
  Divider,
} from "@heroui/react";
import Link from "next/link";

interface DocumentDetailsProps {
  doc: {
    title: string;
    category: string;
    status: string;
    confidenceScore: number;
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

        {/* Right Column: Truth Engine */}
        <div className="space-y-6">
          <Card className="w-full border-t-4 border-t-blue-600">
            <CardHeader className="px-6 pt-6 pb-0 flex flex-col items-start gap-1">
              <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs">
                <span className="material-icons-outlined text-sm">
                  verified_user
                </span>
                Truth Engine
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Verification Status
              </h3>
            </CardHeader>
            <CardBody className="px-6 py-8 flex flex-col items-center text-center">
              <div className="mb-2">
                <span className="text-6xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  {doc.confidenceScore}%
                </span>
              </div>
              <p className="text-zinc-500 font-medium mb-6">Confidence Score</p>

              <Progress
                value={doc.confidenceScore}
                color={
                  doc.confidenceScore > 90
                    ? "success"
                    : doc.confidenceScore > 70
                    ? "warning"
                    : "danger"
                }
                className="w-full h-3 mb-2"
                aria-label="Confidence Score"
              />

              <div className="flex justify-between w-full text-xs text-zinc-400 px-1">
                <span>Unreliable</span>
                <span>Verified Source</span>
              </div>

              <Divider className="my-8" />

              <div className="w-full flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <span className="material-icons-outlined">chat</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-zinc-500 font-medium uppercase">
                      Queries Answered
                    </p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                      {doc.usageCount || 0}
                    </p>
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-700 mx-2" />
                <div className="text-right">
                  <p className="text-xs text-green-600 font-medium">+12%</p>
                  <p className="text-[10px] text-zinc-400">this week</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="w-full bg-zinc-900 text-white">
            <CardBody className="px-6 py-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="material-icons-outlined text-yellow-400">
                  lightbulb
                </span>
                AI Analysis
              </h4>
              <p className="text-sm text-zinc-300 leading-relaxed">
                This document has been cross-referenced with 3 other official
                sources. The content appears consistent with the 2024
                legislative framework.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
