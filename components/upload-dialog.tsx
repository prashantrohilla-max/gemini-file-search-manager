"use client";

import { useState, useCallback } from "react";
import { useUploadDocument } from "@/hooks/use-documents";
import { ChunkingConfig, CustomMetadata } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChunkingConfigForm } from "@/components/chunking-config";
import { MetadataEditor } from "@/components/metadata-editor";
import { Upload, Loader2, FileUp, X } from "lucide-react";
import { toast } from "sonner";

interface UploadDialogProps {
  storeId: string;
  className?: string;
  iconOnly?: boolean;
}

export function UploadDialog({ storeId, className, iconOnly }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [chunkingConfig, setChunkingConfig] = useState<ChunkingConfig>({});
  const [customMetadata, setCustomMetadata] = useState<CustomMetadata[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const { upload, uploading, polling, reset } = useUploadDocument();

  const resetForm = useCallback(() => {
    setFile(null);
    setDisplayName("");
    setChunkingConfig({});
    setCustomMetadata([]);
    reset();
  }, [reset]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!displayName) {
        setDisplayName(droppedFile.name);
      }
    }
  }, [displayName]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!displayName) {
        setDisplayName(selectedFile.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await upload({
        storeId,
        file,
        config: {
          displayName: displayName || file.name,
          chunkingConfig:
            chunkingConfig.maxTokensPerChunk || chunkingConfig.maxOverlapTokens
              ? chunkingConfig
              : undefined,
          customMetadata: customMetadata.length > 0 ? customMetadata : undefined,
        },
      });
      toast.success("Document uploaded and processed successfully");
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload document"
      );
    }
  };

  const isProcessing = uploading || polling;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!isProcessing) {
          setOpen(newOpen);
          if (!newOpen) {
            resetForm();
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className={className} size={iconOnly ? "icon" : "default"}>
          <Upload className={iconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
          {!iconOnly && "Upload Document"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a file to this File Search store. Supports PDF, TXT, MD,
              and many other formats (max 100MB).
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : file
                  ? "border-green-500 bg-green-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <FileUp className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600 mb-2">
                    Drag and drop a file here, or
                  </p>
                  <label>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <span className="text-blue-600 hover:underline cursor-pointer">
                      browse to select
                    </span>
                  </label>
                </>
              )}
            </div>

            {/* Display name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Document name (shown in citations)"
              />
            </div>

            {/* Advanced options */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="chunking">
                <AccordionTrigger className="text-sm">
                  Chunking Configuration
                </AccordionTrigger>
                <AccordionContent>
                  <ChunkingConfigForm
                    value={chunkingConfig}
                    onChange={setChunkingConfig}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="metadata">
                <AccordionTrigger className="text-sm">
                  Custom Metadata
                </AccordionTrigger>
                <AccordionContent>
                  <MetadataEditor
                    value={customMetadata}
                    onChange={setCustomMetadata}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!file || isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {uploading
                ? "Uploading..."
                : polling
                ? "Processing..."
                : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
