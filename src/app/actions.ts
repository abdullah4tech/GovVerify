"use server";

import dbConnect from "@/lib/db";
import Document from "@/models/Document";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const GENELINE_X_API_URL = process.env.GENELINE_X_API_URL!;
const GENELINE_X_API_KEY = process.env.GENELINE_X_API_KEY!;
const GENELINE_X_NAMESPACE = process.env.GENELINE_X_NAMESPACE!;

async function ingestToGenelineX(fileUrl: string, filename: string) {
  try {
    console.log("🔄 Attempting Geneline-X ingestion...");
    console.log("API URL:", GENELINE_X_API_URL);
    console.log("API Key:", GENELINE_X_API_KEY ? `${GENELINE_X_API_KEY.substring(0, 10)}...` : "NOT SET");
    console.log("Namespace:", GENELINE_X_NAMESPACE);
    console.log("File URL:", fileUrl);
    
    const response = await fetch(GENELINE_X_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${GENELINE_X_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: [
          {
            filename: filename,
            metadata: {
              source: "gov-verify-upload",
            },
            mime: "application/pdf",
            url: fileUrl,
          },
        ],
        namespace: GENELINE_X_NAMESPACE,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Geneline-X ingestion failed:", errorData);
      console.error("Status:", response.status);
      throw new Error(`Geneline-X ingestion failed: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log("✅ Successfully ingested to Geneline-X:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error ingesting to Geneline-X:", error);
    throw error;
  }
}

export async function createDocument(data: {
  title: string;
  url: string;
  category: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await dbConnect();

  // Extract filename from URL or use title
  const filename = data.url.split('/').pop() || `${data.title}.pdf`;

  let documentStatus = "pending";

  try {
    // Ingest the file to Geneline-X
    console.log("📤 Starting Geneline-X ingestion for:", filename);
    await ingestToGenelineX(data.url, filename);
    documentStatus = "verified"; // Set to verified if ingestion succeeds
    console.log("✅ Document status set to 'verified'");
  } catch (error) {
    console.warn("⚠️ Failed to ingest to Geneline-X, saving with pending status");
    console.warn("Error details:", error instanceof Error ? error.message : error);
    documentStatus = "pending"; // Keep as pending if ingestion fails
  }

  const newDoc = await Document.create({
    ...data,
    uploaderId: userId,
    status: documentStatus,
  });

  revalidatePath("/dashboard");
  return JSON.parse(JSON.stringify(newDoc));
}
