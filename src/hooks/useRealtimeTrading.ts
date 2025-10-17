"use client";

import { pusherClient } from "@/lib/pusher";
import { useEffect, useState } from "react";

export function useRealtimeTrading() {
  const [latestUpdate, setLatestUpdate] = useState<unknown>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("🔗 Connecting to Pusher...");

    // Subscribe to trading channel
    const channel = pusherClient.subscribe("trading");

    // Connection events
    pusherClient.connection.bind("connected", () => {
      console.log("✅ Pusher connected");
      setIsConnected(true);
    });

    pusherClient.connection.bind("disconnected", () => {
      console.log("❌ Pusher disconnected");
      setIsConnected(false);
    });

    // Listen for trading updates
    channel.bind("update", (data: unknown) => {
      console.log("📈 Trading update received:", data);
      setLatestUpdate(data);
    });

    return () => {
      console.log("🔌 Unsubscribing from Pusher");
      channel.unbind_all();
      pusherClient.unsubscribe("trading");
    };
  }, []);

  return { latestUpdate, isConnected };
}
