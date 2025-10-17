import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);

// Publish trade event
export async function publishTradeEvent(tradeData: unknown): Promise<boolean> {
  try {
    const eventData = {
      ...(typeof tradeData === "object" && tradeData !== null
        ? (tradeData as Record<string, unknown>)
        : {}),
      timestamp: Date.now(),
    };

    await pusherServer.trigger("trading", "update", eventData);
    console.log("✅ Trade event published to Pusher");
    return true;
  } catch (error) {
    console.error("❌ Error publishing to Pusher:", error);
    return false;
  }
}
