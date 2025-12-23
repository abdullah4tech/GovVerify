"use server";

import dbConnect from "@/lib/db";
import Document from "@/models/Document";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const GENELINE_X_API_URL = process.env.GENELINE_X_API_URL!;
const GENELINE_X_API_KEY = process.env.GENELINE_X_API_KEY!;
const GENELINE_X_NAMESPACE = process.env.GENELINE_X_NAMESPACE!;

async function ingestBatchToGenelineX(
  files: { url: string; filename: string; mimeType: string }[]
) {
  try {
    console.log(
      `🔄 Attempting Geneline-X batch ingestion for ${files.length} files...`
    );
    console.log("API URL:", GENELINE_X_API_URL);

    const payload = {
      files: files.map((f) => ({
        filename: f.filename,
        metadata: {
          source: "gov-verify-upload",
        },
        mime: f.mimeType,
        url: f.url,
      })),
      namespace: GENELINE_X_NAMESPACE,
    };

    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${GENELINE_X_API_URL}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${GENELINE_X_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Geneline-X batch ingestion failed:", errorData);
      throw new Error(
        `Geneline-X batch ingestion failed: ${response.status} - ${errorData}`
      );
    }

    const result = await response.json();
    console.log("✅ Successfully batch ingested to Geneline-X:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error batch ingesting to Geneline-X:", error);
    throw error;
  }
}

export async function createDocument(data: {
  title: string;
  url: string;
  category: string;
  mimeType?: string;
}) {
  return createDocuments([
    { ...data, mimeType: data.mimeType || "application/pdf" },
  ]);
}

export async function createDocuments(
  documentsData: {
    title: string;
    url: string;
    category: string;
    mimeType: string;
  }[]
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await dbConnect();

  // Prepare files for ingestion
  const filesToIngest = documentsData.map((doc) => ({
    url: doc.url,
    filename:
      doc.url.split("/").pop() ||
      `${doc.title}.${doc.mimeType.split("/")[1] || "pdf"}`,
    mimeType: doc.mimeType,
  }));

  let ingestionStatus = "pending";

  try {
    // Ingest all files in a single batch
    await ingestBatchToGenelineX(filesToIngest);
    ingestionStatus = "verified";
  } catch (error) {
    console.warn(
      "⚠️ Failed to batch ingest to Geneline-X, saving with pending status"
    );
    console.error(error);
    ingestionStatus = "pending";
  }

  // Create documents in database
  const docsToCreate = documentsData.map((doc) => ({
    ...doc,
    uploaderId: userId,
    status: ingestionStatus,
  }));

  const newDocs = await Document.insertMany(docsToCreate);

  revalidatePath("/dashboard");
  return JSON.parse(JSON.stringify(newDocs));
}
