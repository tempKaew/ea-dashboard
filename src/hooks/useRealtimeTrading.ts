"use client";

import { supabaseClient } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";

interface RealtimePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: Record<string, unknown>;
  old?: Record<string, unknown>;
  table: string;
}

export function useRealtimeTrading() {
  const [latestUpdate, setLatestUpdate] = useState<RealtimePayload | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdateRef = useRef<RealtimePayload | null>(null);

  useEffect(() => {
    console.log("🔗 Connecting to Supabase Realtime...");

    const handleUpdate = (payload: {
      eventType: string;
      new?: Record<string, unknown>;
      old?: Record<string, unknown>;
      table: string;
    }) => {
      const updateData: RealtimePayload = {
        eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
        new: payload.new,
        old: payload.old,
        table: payload.table,
      };

      // Store the latest update
      pendingUpdateRef.current = updateData;

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // For updated table, reload immediately (no debounce)
      const debounceTime = 5000;

      debounceTimeoutRef.current = setTimeout(() => {
        console.log(
          `⏰ Applying ${updateData.table} update (${updateData.eventType}):`,
          pendingUpdateRef.current,
        );
        setLatestUpdate(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }, debounceTime);
    };

    // Subscribe to changes on updated tables
    const tradingChannel = supabaseClient
      .channel("trading-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "updated",
        },
        (payload) => {
          console.log("📊 updated update received:", payload);
          handleUpdate({
            eventType: payload.eventType,
            new: payload.new as Record<string, unknown>,
            old: payload.old as Record<string, unknown>,
            table: "updated",
          });
        },
      )
      .subscribe((status) => {
        console.log("Supabase Realtime status:", status);
        setIsConnected(status === "SUBSCRIBED");

        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to updated tables");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Error subscribing to Supabase Realtime");
        }
      });

    return () => {
      console.log("🔌 Unsubscribing from Supabase Realtime");

      // Clear timeout on cleanup
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      supabaseClient.removeChannel(tradingChannel);
    };
  }, []);

  return { latestUpdate, isConnected };
}
