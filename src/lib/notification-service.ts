import {
  MiniAppNotificationDetails,
  SendNotificationRequest,
  sendNotificationResponseSchema,
} from "@farcaster/miniapp-sdk";
import { getUserNotificationDetails } from "~/lib/kv";

/**
 * Get the app URL for notifications
 * Falls back to localhost:3000 for local development
 */
function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL;
  }
  // Fallback for local development
  return "http://localhost:3000";
}

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
  body: string
): Promise<NotificationResult> {
  const appUrl = getAppUrl();
  const payload = {
    notificationId: crypto.randomUUID(),
    title,
    body,
    targetUrl: appUrl,
    tokens: [notificationDetails.token],
  };

  console.log("[sendNotificationDirect] Sending notification:", {
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
    console.log("[sendNotificationDirect] Response:", {
      status: response.status,
      body: responseJson,
    });

    if (response.status === 200) {
      const responseBody = sendNotificationResponseSchema.safeParse(
        responseJson
      );
      if (responseBody.success === false) {
        console.error("[sendNotificationDirect] Invalid response schema:", responseBody.error.errors);
        return { state: "error", error: responseBody.error.errors };
      }

      if (responseBody.data.result.rateLimitedTokens.length) {
        console.warn("[sendNotificationDirect] Rate limited tokens:", responseBody.data.result.rateLimitedTokens);
        return { state: "rate_limit" };
      }

      console.log("[sendNotificationDirect] Notification sent successfully");
      return { state: "success" };
    } else {
      console.error("[sendNotificationDirect] HTTP error:", response.status, responseJson);
      return { state: "error", error: responseJson };
    }
  } catch (error) {
    console.error("[sendNotificationDirect] Fetch error:", error);
    return { state: "error", error };
  }
}

/**
 * Send a notification to a user
 *
 * Currently uses direct Farcaster notification URL approach.
 * To replace with Neynar API:
 *
 * 1. Comment out the block below
 * 2. Replace with Neynar API call:
 *
 *    const res = await fetch('https://api.neynar.com/v2/farcaster/notifications', {
 *      method: 'POST',
 *      headers: {
 *        'Content-Type': 'application/json',
 *        'x-api-key': process.env.NEYNAR_API_KEY || '',
 *      },
 *      body: JSON.stringify({
 *        fids: [fid],
 *        title,
 *        body,
 *        target_url: appUrl,
 *      }),
 *    });
 *
 * Note: With Neynar, token storage (kv.ts) is no longer needed.
 */
export async function sendNotification(
  address: string,
  title: string,
  body: string
): Promise<NotificationResult> {
  // Get stored notification token for this user
  const notificationDetails = await getUserNotificationDetails(address);
  if (!notificationDetails) {
    console.log(`[sendNotification] No notification details for address ${address}`);
    return { state: "no_token" };
  }

  const appUrl = getAppUrl();
  const payload = {
    notificationId: crypto.randomUUID(),
    title,
    body,
    targetUrl: appUrl,
    tokens: [notificationDetails.token],
  };

  console.log("[sendNotification] Sending notification:", {
    address,
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
    console.log("[sendNotification] Response:", {
      status: response.status,
      body: responseJson,
    });

    if (response.status === 200) {
      const responseBody = sendNotificationResponseSchema.safeParse(
        responseJson
      );
      if (responseBody.success === false) {
        console.error("[sendNotification] Invalid response schema:", responseBody.error.errors);
        return { state: "error", error: responseBody.error.errors };
      }

      if (responseBody.data.result.rateLimitedTokens.length) {
        console.warn("[sendNotification] Rate limited tokens:", responseBody.data.result.rateLimitedTokens);
        return { state: "rate_limit" };
      }

      console.log("[sendNotification] Notification sent successfully");
      return { state: "success" };
    } else {
      console.error("[sendNotification] HTTP error:", response.status, responseJson);
      return { state: "error", error: responseJson };
    }
  } catch (error) {
    return { state: "error", error };
  }
}
