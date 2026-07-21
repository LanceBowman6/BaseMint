"use client";

import { useQuery } from "@tanstack/react-query";

import type { UserRecord } from "@/lib/storage";

export function useUserRecord(address?: string) {
  return useQuery({
    queryKey: ["user", address?.toLowerCase()],
    enabled: Boolean(address),
    queryFn: async () => {
      const res = await fetch(`/api/user/${address}`);
      if (!res.ok) throw new Error("Failed to load user profile");
      return (await res.json()) as UserRecord;
    },
  });
}
