import {
  ParseWebhookEvent,
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from "@farcaster/miniapp-node";
import { NextRequest, NextResponse } from "next/server";

// Allow CORS from sandbox
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}

export async function POST(request: NextRequest) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  };

  const requestJson = await request.json();
  console.log("[DEMO-MINIAPP-webhook] Received event:", JSON.stringify(requestJson, null, 2));

  let address: string | undefined;
  let event: { event: string; notificationDetails?: { url: string; token: string } } | undefined;

  // Check if this is a sandbox webhook (with userAddress) or standard Farcaster webhook
  const sandboxPayload = requestJson as Record<string, unknown>;
  if (sandboxPayload.userAddress && sandboxPayload.event && typeof sandboxPayload.event === "string") {
    // Sandbox webhook format (from miniapp-sandbox)
    address = sandboxPayload.userAddress as string;
    event = {
      event: sandboxPayload.event as string,
      notificationDetails: sandboxPayload.notificationDetails as { url: string; token: string } | undefined,
    };
  } else {
    // Standard Farcaster webhook format - try to parse and verify
    let data;
    try {
      data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
      console.log("[DEMO-MINIAPP-webhook] Parsed event data:", JSON.stringify(data, null, 2));
      // Note: Standard Farcaster webhooks use FID, but StartaleApp uses address
      // For now, we don't have address from standard format
      event = data.event;
    } catch (e: unknown) {
      const error = e as ParseWebhookEvent.ErrorType;
      console.error("[DEMO-MINIAPP-webhook] Parse error:", error.name);

      switch (error.name) {
        case "VerifyJsonFarcasterSignature.InvalidDataError":
        case "VerifyJsonFarcasterSignature.InvalidEventDataError":
          return Response.json(
            { success: false, error: error.message },
            { status: 400, headers: corsHeaders }
          );
        case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
          return Response.json(
            { success: false, error: error.message },
            { status: 401, headers: corsHeaders }
          );
        case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
          return Response.json(
            { success: false, error: error.message },
            { status: 500, headers: corsHeaders }
          );
      }
    }
  }

  if (!address || !event) {
    return Response.json(
      { success: false, error: "Missing address or event" },
      { status: 400, headers: corsHeaders }
    );
  }

  console.log(`[DEMO-MINIAPP-webhook] Acknowledged event for address ${address}:`, event.event);

  return Response.json({ success: true }, { headers: corsHeaders });
}
