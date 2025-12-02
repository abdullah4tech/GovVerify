"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Progress,
} from "@heroui/react";
import { createDocument } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const router = useRouter();

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!inputFileRef.current?.files) {
      throw new Error("No file selected");
    }

    const file = inputFileRef.current.files[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: (progressEvent) => {
          setUploadProgress(progressEvent.percentage);
        },
      });

      await createDocument({
        title,
        url: newBlob.url,
        category,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const categories = [
    { key: "policy", label: "Policy Document" },
    { key: "legislation", label: "Legislation" },
    { key: "report", label: "Official Report" },
    { key: "memo", label: "Internal Memo" },
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-col gap-1 px-8 pt-8">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">
          Upload Document
        </h2>
        <p className="text-zinc-600 dark:text-zinc-300">
          Securely upload official government documents to the Truth Engine.
        </p>
      </CardHeader>
      <CardBody className="px-8 pb-8">
        <form onSubmit={handleUpload} className="flex flex-col gap-6">
          <div
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            onClick={() => inputFileRef.current?.click()}
          >
            <input
              name="file"
              ref={inputFileRef}
              type="file"
              required
              accept="application/pdf"
              className="hidden"
              onChange={() => {}} // Handle file selection visual feedback if needed
            />
            <span className="material-icons-outlined text-4xl text-zinc-400 mb-2">
              cloud_upload
            </span>
            <p className="text-zinc-700 dark:text-zinc-200 font-medium">
              Click to select a PDF file
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
              Maximum file size: 50MB
            </p>
            {inputFileRef.current?.files?.[0] && (
              <div className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                {inputFileRef.current.files[0].name}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-zinc-900 dark:text-white font-semibold text-sm">
                Document Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. National Health Policy 2025"
                value={title}
                onValueChange={setTitle}
                isRequired
                variant="bordered"
                classNames={{
                  input: "text-zinc-900 dark:text-white",
                  inputWrapper: "",
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-zinc-900 dark:text-white font-semibold text-sm">
                Category <span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="Select a category"
                selectedKeys={category ? [category] : []}
                onChange={(e) => setCategory(e.target.value)}
                isRequired
                variant="bordered"
                classNames={{
                  trigger: "bg-white dark:bg-zinc-900",
                }}
              >
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.key}
                    classNames={{
                      base: "text-zinc-800 dark:text-zinc-100",
                      title: "text-zinc-800 dark:text-zinc-100 font-medium",
                    }}
                  >
                    {cat.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {isLoading && (
            <Progress
              size="sm"
              isIndeterminate={uploadProgress === 0}
              value={uploadProgress}
              color="primary"
              aria-label="Uploading..."
              className="max-w-md"
            />
          )}

          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={isLoading}
            className="font-medium bg-blue-600"
          >
            {isLoading ? "Uploading & Verifying..." : "Upload & Verify"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
