"use client";

import { FileSearchDocument } from "@/lib/types";
import { useDeleteDocument } from "@/hooks/use-documents";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentListProps {
  documents: FileSearchDocument[];
  storeId: string;
}

function formatBytes(bytes: string | undefined): string {
  if (!bytes) return "—";
  const num = parseInt(bytes, 10);
  if (num === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDocId(name: string): string {
  // name is like "fileSearchStores/abc/documents/xyz"
  return name.split("/").pop() || name;
}

function StatusIcon({ state }: { state: string | undefined }) {
  switch (state) {
    case "STATE_ACTIVE":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "STATE_FAILED":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "STATE_PENDING":
      return <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />;
    default:
      return <Clock className="h-4 w-4 text-slate-400" />;
  }
}

function StatusBadge({ state }: { state: string | undefined }) {
  switch (state) {
    case "STATE_ACTIVE":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Active
        </Badge>
      );
    case "STATE_FAILED":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Failed
        </Badge>
      );
    case "STATE_PENDING":
      return (
        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
          Pending
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-slate-400">
          Unknown
        </Badge>
      );
  }
}

export function DocumentList({ documents, storeId }: DocumentListProps) {
  const deleteDocument = useDeleteDocument();

  const handleDelete = async (docId: string) => {
    try {
      await deleteDocument.mutateAsync({ storeId, docId });
      toast.success("Document deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete document"
      );
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-slate-50">
        <FileText className="h-10 w-10 mx-auto text-slate-300" />
        <p className="mt-3 text-slate-500">No documents yet</p>
        <p className="text-sm text-slate-400">
          Upload a file to get started
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const docId = getDocId(doc.name);
            return (
              <TableRow key={doc.name}>
                <TableCell>
                  <StatusIcon state={doc.state} />
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    <p className="truncate max-w-[200px]">
                      {doc.displayName || docId}
                    </p>
                    {doc.customMetadata && doc.customMetadata.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {doc.customMetadata.slice(0, 3).map((meta, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {meta.key}:{" "}
                            {meta.stringValue || meta.numericValue}
                          </Badge>
                        ))}
                        {doc.customMetadata.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            +{doc.customMetadata.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge state={doc.state} />
                </TableCell>
                <TableCell className="text-slate-500">
                  {formatBytes(doc.sizeBytes)}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {doc.mimeType?.split("/").pop() || "—"}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {formatDate(doc.createTime)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(docId)}
                    disabled={deleteDocument.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
