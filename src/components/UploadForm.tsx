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
  Chip,
} from "@heroui/react";
import { createDocument } from "@/app/actions";
import { useRouter } from "next/navigation";

interface FileUploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  url?: string;
  error?: string;
}

export default function UploadForm() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileProgress, setFileProgress] = useState<Map<string, FileUploadProgress>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      addFiles(Array.from(files));
    }
  };

  const addFiles = (files: File[]) => {
    // Filter for PDF files only
    const pdfFiles = files.filter(file => file.type === "application/pdf");
    
    if (pdfFiles.length !== files.length) {
      alert("Only PDF files are allowed. Some files were not added.");
    }

    setSelectedFiles(pdfFiles);
    
    // Initialize progress tracking for each file
    const newProgress = new Map<string, FileUploadProgress>();
    pdfFiles.forEach((file) => {
      newProgress.set(file.name, {
        file,
        progress: 0,
        status: "pending",
      });
    });
    setFileProgress(newProgress);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files));
    }
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== fileName));
    setFileProgress((prev) => {
      const newProgress = new Map(prev);
      newProgress.delete(fileName);
      return newProgress;
    });
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();

    if (selectedFiles.length === 0) {
      alert("Please select at least one file");
      return;
    }

    if (!title || !category) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Upload files sequentially or in parallel
      const uploadPromises = selectedFiles.map(async (file) => {
        const startTime = Date.now();
        console.log(`Starting upload for ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        // Update status to uploading
        setFileProgress((prev) => {
          const newProgress = new Map(prev);
          const fileProgress = newProgress.get(file.name);
          if (fileProgress) {
            fileProgress.status = "uploading";
            newProgress.set(file.name, fileProgress);
          }
          return newProgress;
        });

        try {
          // Throttle progress updates to reduce re-renders
          let lastUpdateTime = 0;
          const UPDATE_INTERVAL = 100; // Update every 100ms instead of every progress event

          const newBlob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
            onUploadProgress: (progressEvent) => {
              const now = Date.now();
              // Only update if enough time has passed or upload is complete
              if (now - lastUpdateTime > UPDATE_INTERVAL || progressEvent.percentage === 100) {
                lastUpdateTime = now;
                setFileProgress((prev) => {
                  const newProgress = new Map(prev);
                  const fileProgress = newProgress.get(file.name);
                  if (fileProgress) {
                    fileProgress.progress = progressEvent.percentage;
                    newProgress.set(file.name, fileProgress);
                  }
                  return newProgress;
                });
              }
            },
          });

          const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2);
          const speedMBps = (file.size / 1024 / 1024 / parseFloat(uploadTime)).toFixed(2);
          console.log(`✓ Upload completed for ${file.name} in ${uploadTime}s (${speedMBps} MB/s)`);

          // Update status to completed
          setFileProgress((prev) => {
            const newProgress = new Map(prev);
            const fileProgress = newProgress.get(file.name);
            if (fileProgress) {
              fileProgress.status = "completed";
              fileProgress.url = newBlob.url;
              fileProgress.progress = 100;
              newProgress.set(file.name, fileProgress);
            }
            return newProgress;
          });

          // Create document in database
          await createDocument({
            title: selectedFiles.length > 1 ? `${title} - ${file.name}` : title,
            url: newBlob.url,
            category,
          });

          return { success: true, url: newBlob.url };
        } catch (error) {
          // Update status to failed
          setFileProgress((prev) => {
            const newProgress = new Map(prev);
            const fileProgress = newProgress.get(file.name);
            if (fileProgress) {
              fileProgress.status = "failed";
              fileProgress.error = (error as Error).message;
              newProgress.set(file.name, fileProgress);
            }
            return newProgress;
          });
          return { success: false, error: (error as Error).message };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (successCount > 0) {
        alert(
          `Successfully uploaded ${successCount} file(s)${
            failCount > 0 ? `, ${failCount} failed` : ""
          }`
        );
        router.push("/dashboard");
      } else {
        alert("All uploads failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
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
          Upload Documents
        </h2>
        <p className="text-zinc-600 dark:text-zinc-300">
          Securely upload official government documents to the Truth Engine.
        </p>
      </CardHeader>
      <CardBody className="px-8 pb-8">
        <form onSubmit={handleUpload} className="flex flex-col gap-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105"
                : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
            onClick={() => inputFileRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              name="file"
              ref={inputFileRef}
              type="file"
              required
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <span className={`material-icons-outlined text-4xl mb-2 transition-colors ${
              isDragging ? "text-blue-500" : "text-zinc-400"
            }`}>
              {isDragging ? "file_download" : "cloud_upload"}
            </span>
            <p className={`font-medium transition-colors ${
              isDragging 
                ? "text-blue-600 dark:text-blue-400" 
                : "text-zinc-700 dark:text-zinc-200"
            }`}>
              {isDragging ? "Drop your PDF files here" : "Click or drag & drop PDF file(s)"}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
              Maximum file size: 50MB per file • Multiple files supported
            </p>
          </div>

          {/* Selected Files Display */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Selected Files ({selectedFiles.length})
              </p>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file) => {
                  const progress = fileProgress.get(file.name);
                  return (
                    <div
                      key={file.name}
                      className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
                    >
                      <span className="material-icons-outlined text-blue-600">
                        description
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {progress && progress.status === "uploading" && (
                          <Progress
                            size="sm"
                            value={progress.progress}
                            color="primary"
                            className="mt-2"
                          />
                        )}
                        {progress && progress.status === "completed" && (
                          <Chip
                            size="sm"
                            color="success"
                            variant="flat"
                            className="mt-1"
                          >
                            Uploaded
                          </Chip>
                        )}
                        {progress && progress.status === "failed" && (
                          <Chip
                            size="sm"
                            color="danger"
                            variant="flat"
                            className="mt-1"
                          >
                            Failed
                          </Chip>
                        )}
                      </div>
                      {!isLoading && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.name);
                          }}
                          className="text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <span className="material-icons-outlined text-xl">
                            close
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                isDisabled={isLoading}
                classNames={{
                  input: "text-zinc-900 dark:text-white",
                  inputWrapper: "",
                }}
              />
              {selectedFiles.length > 1 && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Will be prefixed with filename for multiple uploads
                </p>
              )}
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
                isDisabled={isLoading}
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

          {/* Overall Progress */}
          {isLoading && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  Uploading {selectedFiles.length} file(s)...
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {Array.from(fileProgress.values()).filter(
                    (p) => p.status === "completed"
                  ).length}{" "}
                  / {selectedFiles.length} completed
                </span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={isLoading}
            isDisabled={selectedFiles.length === 0 || !title || !category}
            className="font-medium bg-blue-600"
          >
            {isLoading
              ? "Uploading & Verifying..."
              : `Upload ${selectedFiles.length > 0 ? `${selectedFiles.length} File(s)` : ""} & Verify`}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
