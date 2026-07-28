"use client";

import { useState, useEffect, useCallback } from "react";
import { getServer } from "@/lib/contract";
import { parseEventTopic } from "@/lib/scval";
import type { ContractEvent, EventType } from "@/lib/types";

export interface UseEventsReturn {
  events: ContractEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refresh = useCallback(() => setTrigger((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const server = getServer();
        const contractId = typeof process !== "undefined" && process.env.NEXT_PUBLIC_CONTRACT_ID
          ? process.env.NEXT_PUBLIC_CONTRACT_ID
          : "";

        if (!contractId) {
          if (!cancelled) {
            setEvents([]);
            setLoading(false);
          }
          return;
        }

        const eventResult = await server.getEvents({
          startLedger: 0,
          filters: [{
            type: "contract" as unknown as "system",
            contractIds: [contractId],
          }],
          limit: 50,
        });

        if (cancelled) return;

        const parsed: ContractEvent[] = [];

        for (const entry of eventResult?.events ?? []) {
          const topic = entry.topic;
          const topicParsed = parseEventTopic(topic);
          if (!topicParsed) continue;

          parsed.push({
            type: topicParsed.type.substring(0, 7) as EventType,
            subscriber: topicParsed.subscriber,
            id: topicParsed.id,
            value: entry.value,
            timestamp: entry.ledgerClosedAt
              ? new Date(entry.ledgerClosedAt).getTime()
              : Date.now(),
            txHash: entry.id ?? "",
          });
        }

        if (!cancelled) {
          setEvents(parsed.reverse());
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch events");
          setLoading(false);
        }
      }
    };

    fetchEvents();

    const interval = setInterval(fetchEvents, 10_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [trigger]);

  return { events, loading, error, refresh };
}
