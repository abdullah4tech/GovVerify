"use server";

import dbConnect from "@/lib/db";
import Document from "@/models/Document";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const GENELINE_X_API_URL = process.env.GENELINE_X_API_URL || "https://message.geneline-x.net/api/v1/files/ingest-urls";
const GENELINE_X_API_KEY = process.env.GENELINE_X_API_KEY || "1b8cf57bd50ab2b9394363912737f406abd186610719e92eeb4ff3799e872f86";
const GENELINE_X_NAMESPACE = process.env.GENELINE_X_NAMESPACE || "gov_verify";

async function ingestToGenelineX(fileUrl: string, filename: string) {
  try {
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
      console.error("Geneline-X ingestion failed:", errorData);
      throw new Error(`Geneline-X ingestion failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("Successfully ingested to Geneline-X:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error ingesting to Geneline-X:", error);
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
    await ingestToGenelineX(data.url, filename);
    documentStatus = "verified"; // Set to verified if ingestion succeeds
  } catch (error) {
    console.error("Failed to ingest to Geneline-X, saving with pending status:", error);
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
