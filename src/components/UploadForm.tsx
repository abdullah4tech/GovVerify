"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { createDocuments } from "@/app/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

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
  const [fileProgress, setFileProgress] = useState<
    Map<string, FileUploadProgress>
  >(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      addFiles(Array.from(files));
    }
  };

  const addFiles = (files: File[]) => {
    // Filter for PDF and Image files
    const validFiles = files.filter(
      (file) =>
        file.type === "application/pdf" || file.type.startsWith("image/")
    );

    if (validFiles.length !== files.length) {
      alert("Only PDF and Image files are allowed. Some files were not added.");
    }

    // Filter out duplicates based on file name
    const uniqueFiles = validFiles.filter(
      (newFile) =>
        !selectedFiles.some((existing) => existing.name === newFile.name)
    );

    if (uniqueFiles.length === 0) {
      if (validFiles.length > 0) {
        alert("Files with these names are already selected.");
      }
      return;
    }

    setSelectedFiles((prev) => [...prev, ...uniqueFiles]);

    // Initialize progress tracking for each file
    const newProgress = new Map(fileProgress);
    uniqueFiles.forEach((file) => {
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
      const uploadedFiles: {
        title: string;
        url: string;
        category: string;
        mimeType: string;
      }[] = [];

      // Upload files sequentially or in parallel
      const uploadPromises = selectedFiles.map(async (file) => {
        const startTime = Date.now();
        console.log(
          `Starting upload for ${file.name} (${(
            file.size /
            1024 /
            1024
          ).toFixed(2)}MB)`
        );

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
              if (
                now - lastUpdateTime > UPDATE_INTERVAL ||
                progressEvent.percentage === 100
              ) {
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
          const speedMBps = (
            file.size /
            1024 /
            1024 /
            parseFloat(uploadTime)
          ).toFixed(2);
          console.log(
            `✓ Upload completed for ${file.name} in ${uploadTime}s (${speedMBps} MB/s)`
          );

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

          return { success: true, url: newBlob.url, file };
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
          return { success: false, error: (error as Error).message, file };
        }
      });

      const results = await Promise.all(uploadPromises);

      // Collect successful uploads
      results.forEach((result) => {
        if (result.success && result.url && result.file) {
          uploadedFiles.push({
            title:
              selectedFiles.length > 1
                ? `${title} - ${result.file.name}`
                : title,
            url: result.url,
            category,
            mimeType: result.file.type,
          });
        }
      });

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (uploadedFiles.length > 0) {
        // Create documents in database in batch
        await createDocuments(uploadedFiles);
      }

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
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-zinc-100 dark:border-zinc-900">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Upload Documents
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
            Securely upload official government documents to the Truth Engine.
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleUpload} className="flex flex-col gap-8">
            <div
              className={cn(
                "group relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
              )}
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
                accept="application/pdf,image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300",
                  isDragging
                    ? "bg-primary/10 text-primary"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                )}
              >
                <Icon
                  icon={
                    isDragging
                      ? "lucide:arrow-down-to-line"
                      : "lucide:cloud-upload"
                  }
                  className="w-8 h-8"
                />
              </div>
              <p
                className={cn(
                  "font-medium text-lg transition-colors duration-300",
                  isDragging
                    ? "text-primary"
                    : "text-zinc-700 dark:text-zinc-200"
                )}
              >
                {isDragging
                  ? "Drop files now"
                  : "Click or drag files to upload"}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
                PDF, JPG, PNG or WebP (max 50MB)
              </p>
            </div>

            {/* Selected Files Display */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Selected Files ({selectedFiles.length})
                  </p>
                  {isLoading && (
                    <span className="text-xs font-medium text-zinc-500">
                      {
                        Array.from(fileProgress.values()).filter(
                          (p) => p.status === "completed"
                        ).length
                      }{" "}
                      / {selectedFiles.length} completed
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedFiles.map((file) => {
                    const progress = fileProgress.get(file.name);
                    return (
                      <div
                        key={file.name}
                        className="group relative flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <Icon
                            icon="lucide:file-text"
                            className="w-5 h-5 text-zinc-500"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate pr-4">
                              {file.name}
                            </p>
                            {!isLoading && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(file.name);
                                }}
                                className="text-zinc-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Icon icon="lucide:x" className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                            <span>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            {progress?.status === "uploading" && (
                              <span>{Math.round(progress.progress)}%</span>
                            )}
                          </div>

                          {progress && (
                            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full transition-all duration-300 rounded-full",
                                  progress.status === "completed"
                                    ? "bg-green-500"
                                    : progress.status === "failed"
                                    ? "bg-red-500"
                                    : "bg-primary"
                                )}
                                style={{ width: `${progress.progress}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {progress?.status === "completed" && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                            <Icon icon="lucide:check" className="w-3 h-3" />
                            Uploaded
                          </div>
                        )}

                        {progress?.status === "failed" && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                            <Icon
                              icon="lucide:alert-circle"
                              className="w-3 h-3"
                            />
                            Failed
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-zinc-700 dark:text-zinc-300 font-semibold text-sm flex items-center gap-1">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. National Health Policy 2025"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {selectedFiles.length > 1 && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Icon icon="lucide:info" className="w-3 h-3" />
                    Will be prefixed with filename for multiple uploads
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-zinc-700 dark:text-zinc-300 font-semibold text-sm flex items-center gap-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <Icon
                    icon="lucide:chevron-down"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isLoading || selectedFiles.length === 0 || !title || !category
              }
              className={cn(
                "w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-300 flex items-center justify-center gap-2",
                isLoading || selectedFiles.length === 0 || !title || !category
                  ? "bg-zinc-300 dark:bg-zinc-800 cursor-not-allowed shadow-none text-zinc-500"
                  : "bg-primary hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.99]"
              )}
            >
              {isLoading ? (
                <>
                  <Icon
                    icon="lucide:loader-2"
                    className="w-5 h-5 animate-spin"
                  />
                  Uploading & Verifying...
                </>
              ) : (
                <>
                  <Icon icon="lucide:upload-cloud" className="w-5 h-5" />
                  {selectedFiles.length > 0
                    ? `Upload ${selectedFiles.length} File${
                        selectedFiles.length > 1 ? "s" : ""
                      } & Verify`
                    : "Upload & Verify"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
