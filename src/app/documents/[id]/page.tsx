import dbConnect from "@/lib/db";
import Document from "@/models/Document";
import DocumentDetails from "@/components/DocumentDetails";
import { notFound } from "next/navigation";

async function getDocument(id: string) {
  await dbConnect();
  try {
    const doc = await Document.findById(id).lean();
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc));
  } catch (e) {
    return null;
  }
}

export default async function DocumentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getDocument(id);

  if (!doc) {
    notFound();
  }

  return <DocumentDetails doc={doc} />;
}
