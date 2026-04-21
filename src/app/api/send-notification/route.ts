import { notificationDetailsSchema } from "@farcaster/miniapp-core";
import { NextRequest } from "next/server";
import { z } from "zod";
import { sendNotificationDirect } from "~/lib/notification-service";

const requestSchema = z.object({
  notificationDetails: notificationDetailsSchema,
});

export async function POST(request: NextRequest) {
  const requestJson = await request.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return Response.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  console.log("[DEMO-MINIAPP] Sending notification", {
    targetUrl: request.nextUrl.origin,
    notificationUrl: requestBody.data.notificationDetails.url,
  });

  const sendResult = await sendNotificationDirect(
    requestBody.data.notificationDetails,
    "Test notification",
    "Sent at " + new Date().toISOString(),
    request.nextUrl.origin
  );

  console.log("[DEMO-MINIAPP] Notification send result", sendResult);

  if (sendResult.state === "error") {
    return Response.json(
      { success: false, error: sendResult.error },
      { status: 500 }
    );
  } else if (sendResult.state === "rate_limit") {
    return Response.json(
      { success: false, error: "Rate limited" },
      { status: 429 }
    );
  }

  return Response.json({ success: true });
}
