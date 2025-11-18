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
    null
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

      // For history table, reload immediately (no debounce)
      // For accounts table, use short debounce (1 second)
      const debounceTime = updateData.table === "history" ? 5000 : 8000; // 500ms for history, 1s for accounts

      debounceTimeoutRef.current = setTimeout(() => {
        console.log(
          `⏰ Applying ${updateData.table} update (${updateData.eventType}):`,
          pendingUpdateRef.current
        );
        setLatestUpdate(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }, debounceTime);
    };

    // Subscribe to changes on accounts and history tables
    const accountsChannel = supabaseClient
      .channel("trading-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "accounts",
        },
        (payload) => {
          console.log("📈 Account update received:", payload);
          handleUpdate({
            eventType: payload.eventType,
            new: payload.new as Record<string, unknown>,
            old: payload.old as Record<string, unknown>,
            table: "accounts",
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "history",
        },
        (payload) => {
          console.log("📊 History update received:", payload);
          handleUpdate({
            eventType: payload.eventType,
            new: payload.new as Record<string, unknown>,
            old: payload.old as Record<string, unknown>,
            table: "history",
          });
        }
      )
      .subscribe((status) => {
        console.log("Supabase Realtime status:", status);
        setIsConnected(status === "SUBSCRIBED");

        if (status === "SUBSCRIBED") {
          console.log(
            "✅ Successfully subscribed to accounts and history tables"
          );
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

      supabaseClient.removeChannel(accountsChannel);
    };
  }, []);

  return { latestUpdate, isConnected };
}
