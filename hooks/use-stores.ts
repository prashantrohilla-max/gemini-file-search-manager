"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileSearchStore } from "@/lib/types";

interface StoresResponse {
  stores: FileSearchStore[];
}

interface StoreResponse {
  store: FileSearchStore;
}

async function fetchStores(): Promise<FileSearchStore[]> {
  const response = await fetch("/api/stores");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch stores");
  }
  const data: StoresResponse = await response.json();
  return data.stores;
}

async function fetchStore(storeId: string): Promise<FileSearchStore> {
  const response = await fetch(`/api/stores/${storeId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch store");
  }
  const data: StoreResponse = await response.json();
  return data.store;
}

async function createStore(displayName: string): Promise<FileSearchStore> {
  const response = await fetch("/api/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create store");
  }
  const data: StoreResponse = await response.json();
  return data.store;
}

async function deleteStore({
  storeId,
  force,
}: {
  storeId: string;
  force: boolean;
}): Promise<void> {
  const response = await fetch(`/api/stores/${storeId}?force=${force}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete store");
  }
}

export function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
  });
}

export function useStore(storeId: string) {
  return useQuery({
    queryKey: ["stores", storeId],
    queryFn: () => fetchStore(storeId),
    enabled: !!storeId,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}
