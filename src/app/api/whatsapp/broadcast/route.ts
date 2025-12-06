import { NextResponse } from "next/server";

const WHATSAPP_BASE_URL = process.env.NEXT_PUBLIC_WHATSAPP_BASE_URL || "http://localhost:5000";
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || process.env.NEXT_PUBLIC_GENELINE_X_API_KEY;

export async function POST(request: Request) {
  try {
    console.log("=== WhatsApp Broadcast API: Starting ===");
    
    const body = await request.json();
    const { phone, message, dataGapId } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: "Phone number and message are required" },
        { status: 400 }
      );
    }

    // Format phone number to WhatsApp JID format (@c.us)
    // Remove any non-digit characters first
    const cleanPhone = phone.replace(/\D/g, "");
    
    // If phone starts with +, remove it (already removed by regex above)
    // Ensure it's in the correct format: number@c.us
    const whatsappJID = `${cleanPhone}@c.us`;

    console.log("Original phone:", phone);
    console.log("Formatted WhatsApp JID:", whatsappJID);
    console.log("Message:", message);
    console.log("Data Gap ID:", dataGapId);

    // Call WhatsApp send-message endpoint
    const response = await fetch(`${WHATSAPP_BASE_URL}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": WHATSAPP_API_KEY || "",
      },
      body: JSON.stringify({
        to: whatsappJID,
        body: message,
      }),
    });

    console.log("WhatsApp API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error("WhatsApp API error:", errorData);
      throw new Error(errorData.error || "Failed to send WhatsApp message");
    }

    const result = await response.json();
    console.log("Broadcast successful:", result);

    return NextResponse.json({
      success: true,
      message: "WhatsApp message sent successfully",
      data: result,
      recipient: whatsappJID,
    });
  } catch (error) {
    console.error("=== WhatsApp Broadcast API: Error ===");
    console.error("Error details:", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to send WhatsApp message",
        success: false,
      },
      { status: 500 }
    );
  }
}
