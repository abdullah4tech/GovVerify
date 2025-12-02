"use server";

import dbConnect from "@/lib/db";
import Document from "@/models/Document";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

  const newDoc = await Document.create({
    ...data,
    uploaderId: userId,
    status: "pending",
    confidenceScore: Math.floor(Math.random() * (99 - 85 + 1) + 85), // Mock score for now
  });

  revalidatePath("/dashboard");
  return JSON.parse(JSON.stringify(newDoc));
}
