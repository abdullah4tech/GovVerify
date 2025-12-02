"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

export default function UploadButton() {
  return (
    <Link href="/upload">
      <Button color="primary" className="font-medium bg-blue-600">
        Upload New Document
      </Button>
    </Link>
  );
}
