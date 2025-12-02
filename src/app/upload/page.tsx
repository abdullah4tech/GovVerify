import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Document Upload
        </h1>
        <p className="text-zinc-600 dark:text-zinc-300 mt-2">
          Add new sources of truth to the system.
        </p>
      </div>
      <UploadForm />
    </div>
  );
}
