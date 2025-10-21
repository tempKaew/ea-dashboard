"use client";

import { pusherClient } from "@/lib/pusher";
import { useEffect, useRef, useState } from "react";

export function useRealtimeTrading() {
  const [latestUpdate, setLatestUpdate] = useState<unknown>(null);
  const [isConnected, setIsConnected] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdateRef = useRef<unknown>(null);

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

    // Listen for trading updates with debounce
    channel.bind("update", (data: unknown) => {
      console.log("📈 Trading update received (debouncing...):", data);

      // Store the latest update
      pendingUpdateRef.current = data;

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout for 3 seconds
      debounceTimeoutRef.current = setTimeout(() => {
        console.log(
          "⏰ Debounce timeout - applying update:",
          pendingUpdateRef.current
        );
        setLatestUpdate(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }, 3000); // 3 second delay
    });

    return () => {
      console.log("🔌 Unsubscribing from Pusher");

      // Clear timeout on cleanup
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      channel.unbind_all();
      pusherClient.unsubscribe("trading");
    };
  }, []);

  return { latestUpdate, isConnected };
}
