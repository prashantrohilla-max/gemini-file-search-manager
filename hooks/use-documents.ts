"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileSearchDocument, Operation, UploadConfig } from "@/lib/types";
import { useState, useCallback } from "react";

interface DocumentsResponse {
  documents: FileSearchDocument[];
}

interface UploadResponse {
  operation: Operation;
}

interface OperationResponse {
  operation: Operation;
}

async function fetchDocuments(storeId: string): Promise<FileSearchDocument[]> {
  const response = await fetch(`/api/stores/${storeId}/documents`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch documents");
  }
  const data: DocumentsResponse = await response.json();
  return data.documents;
}

async function deleteDocument({
  storeId,
  docId,
}: {
  storeId: string;
  docId: string;
}): Promise<void> {
  const response = await fetch(`/api/stores/${storeId}/documents/${docId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete document");
  }
}

async function uploadDocument({
  storeId,
  file,
  config,
}: {
  storeId: string;
  file: File;
  config?: UploadConfig;
}): Promise<Operation> {
  const formData = new FormData();
  formData.append("file", file);

  if (config?.displayName) {
    formData.append("displayName", config.displayName);
  }
  if (config?.chunkingConfig) {
    formData.append("chunkingConfig", JSON.stringify(config.chunkingConfig));
  }
  if (config?.customMetadata) {
    formData.append("customMetadata", JSON.stringify(config.customMetadata));
  }

  const response = await fetch(`/api/stores/${storeId}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload document");
  }

  const data: UploadResponse = await response.json();
  return data.operation;
}

async function pollOperation(operationName: string): Promise<Operation> {
  const response = await fetch(
    `/api/operations?name=${encodeURIComponent(operationName)}`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to poll operation");
  }
  const data: OperationResponse = await response.json();
  return data.operation;
}

export function useDocuments(storeId: string) {
  return useQuery({
    queryKey: ["documents", storeId],
    queryFn: () => fetchDocuments(storeId),
    enabled: !!storeId,
    refetchInterval: 5000, // Poll every 5 seconds to catch status changes
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.storeId],
      });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<{
    uploading: boolean;
    polling: boolean;
    operationName?: string;
    error?: string;
  }>({ uploading: false, polling: false });

  const upload = useCallback(
    async ({
      storeId,
      file,
      config,
    }: {
      storeId: string;
      file: File;
      config?: UploadConfig;
    }) => {
      setUploadProgress({ uploading: true, polling: false });

      try {
        const operation = await uploadDocument({ storeId, file, config });
        setUploadProgress({
          uploading: false,
          polling: true,
          operationName: operation.name,
        });

        // Poll until done
        let currentOp = operation;
        while (!currentOp.done) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          currentOp = await pollOperation(currentOp.name);
        }

        if (currentOp.error) {
          throw new Error(currentOp.error.message || "Upload failed");
        }

        setUploadProgress({ uploading: false, polling: false });
        queryClient.invalidateQueries({ queryKey: ["documents", storeId] });
        queryClient.invalidateQueries({ queryKey: ["stores"] });

        return currentOp;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        setUploadProgress({ uploading: false, polling: false, error: message });
        throw error;
      }
    },
    [queryClient]
  );

  const reset = useCallback(() => {
    setUploadProgress({ uploading: false, polling: false });
  }, []);

  return {
    upload,
    reset,
    ...uploadProgress,
  };
}
