import DocumentTable from "@/components/DocumentTable";
import dbConnect from "@/lib/db";
import Document from "@/models/Document";
import UploadButton from "@/components/UploadButton";

export const dynamic = "force-dynamic";

async function getDocuments() {
  await dbConnect();
  const docs = await Document.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export default async function DashboardPage() {
  const documents = await getDocuments();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 mt-2">
            Manage and monitor government documents.
          </p>
        </div>
        <UploadButton />
      </div>

      <DocumentTable documents={documents} />
    </div>
  );
}
