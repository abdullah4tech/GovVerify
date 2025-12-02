import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Authenticate the user here if needed
        // const { userId } = auth();
        // if (!userId) throw new Error('Unauthorized');

        return {
          allowedContentTypes: ["application/pdf"],
          // Increase max file size to 100MB for better compatibility
          maxFileSize: 100 * 1024 * 1024, // 100MB
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // This is called when the upload is complete
        console.log("blob uploaded", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
