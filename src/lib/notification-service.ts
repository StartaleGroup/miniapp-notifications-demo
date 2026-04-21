import {
  MiniAppNotificationDetails,
  SendNotificationRequest,
  sendNotificationResponseSchema,
} from "@farcaster/miniapp-sdk";

export type NotificationResult =
  | { state: "success" }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "error"; error: unknown };

/**
 * Send a notification using provided notification details
 * (for clients that pass details directly, like StartaleApp)
 */
export async function sendNotificationDirect(
  notificationDetails: MiniAppNotificationDetails,
  title: string,
  body: string,
  targetUrl: string
): Promise<NotificationResult> {
  const payload = {
    notificationId: crypto.randomUUID(),
    title,
    body,
    targetUrl,
    tokens: [notificationDetails.token],
  };

  console.log("[DEMO-MINIAPP-sendNotificationDirect] Sending notification:", {
    url: notificationDetails.url,
    payload,
  });

  try {
    const response = await fetch(notificationDetails.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload satisfies SendNotificationRequest),
    });

    const responseJson = await response.json();
    console.log("[DEMO-MINIAPP-sendNotificationDirect] Response:", {
      status: response.status,
      body: responseJson,
    });

    if (response.status === 200) {
      const responseBody = sendNotificationResponseSchema.safeParse(
        responseJson
      );
      if (responseBody.success === false) {
        console.error("[DEMO-MINIAPP-sendNotificationDirect] Invalid response schema:", responseBody.error.errors);
        return { state: "error", error: responseBody.error.errors };
      }

      if (responseBody.data.result.rateLimitedTokens.length) {
        console.warn("[DEMO-MINIAPP-sendNotificationDirect] Rate limited tokens:", responseBody.data.result.rateLimitedTokens);
        return { state: "rate_limit" };
      }

      console.log("[DEMO-MINIAPP-sendNotificationDirect] Notification sent successfully");
      return { state: "success" };
    } else {
      console.error("[DEMO-MINIAPP-sendNotificationDirect] HTTP error:", response.status, responseJson);
      return { state: "error", error: responseJson };
    }
  } catch (error) {
    console.error("[DEMO-MINIAPP-sendNotificationDirect] Fetch error:", error);
    return { state: "error", error };
  }
}

