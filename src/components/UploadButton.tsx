"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export default function UploadButton() {
  return (
    <Link
      href="/upload"
      className={cn(
        "group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-300",
        "bg-primary hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.99]"
      )}
    >
      <Icon
        icon="lucide:upload-cloud"
        className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5"
      />
      Upload New Document
    </Link>
  );
}
