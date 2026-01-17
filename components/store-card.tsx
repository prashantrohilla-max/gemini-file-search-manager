"use client";

import Link from "next/link";
import { FileSearchStore } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, FileText, Clock, HardDrive } from "lucide-react";

interface StoreCardProps {
  store: FileSearchStore;
}

function formatBytes(bytes: string | undefined): string {
  if (!bytes) return "0 B";
  const num = parseInt(bytes, 10);
  if (num === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStoreId(name: string): string {
  // name is like "fileSearchStores/abc-123"
  return name.split("/").pop() || name;
}

export function StoreCard({ store }: StoreCardProps) {
  const storeId = getStoreId(store.name);
  const activeCount = parseInt(store.activeDocumentsCount || "0", 10);
  const pendingCount = parseInt(store.pendingDocumentsCount || "0", 10);
  const failedCount = parseInt(store.failedDocumentsCount || "0", 10);
  const totalDocs = activeCount + pendingCount + failedCount;

  return (
    <Link href={`/stores/${storeId}`}>
      <Card className="transition-all hover:shadow-md hover:border-slate-300 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-slate-500" />
              <CardTitle className="text-lg">
                {store.displayName || storeId}
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-xs font-mono truncate">
            {storeId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <FileText className="h-4 w-4" />
              <span>{totalDocs} docs</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <HardDrive className="h-4 w-4" />
              <span>{formatBytes(store.sizeBytes)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                {activeCount} active
              </Badge>
            )}
            {pendingCount > 0 && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                {pendingCount} pending
              </Badge>
            )}
            {failedCount > 0 && (
              <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                {failedCount} failed
              </Badge>
            )}
            {totalDocs === 0 && (
              <Badge variant="outline" className="text-slate-400">
                Empty
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            <span>Created {formatDate(store.createTime)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
