"use client";

import { use } from "react";
import Link from "next/link";
import { useStore } from "@/hooks/use-stores";
import { useDocuments } from "@/hooks/use-documents";
import { Sidebar } from "@/components/sidebar";
import { DocumentList } from "@/components/document-list";
import { UploadDialog } from "@/components/upload-dialog";
import { DeleteStoreDialog } from "@/components/delete-store-dialog";
import { ChatPlayground } from "@/components/chat-playground";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, AlertCircle, Database } from "lucide-react";

interface StorePageProps {
  params: Promise<{ storeId: string }>;
}

export default function StorePage({ params }: StorePageProps) {
  const { storeId } = use(params);
  const { data: store, isLoading: storeLoading, error: storeError } = useStore(storeId);
  const { data: documents, isLoading: docsLoading } = useDocuments(storeId);

  const totalDocs =
    parseInt(store?.activeDocumentsCount || "0", 10) +
    parseInt(store?.pendingDocumentsCount || "0", 10) +
    parseInt(store?.failedDocumentsCount || "0", 10);

  return (
    <div className="flex min-h-screen flex-col md:flex-row md:h-screen md:overflow-hidden bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-20 flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <Database className="h-4 w-4 text-slate-500 shrink-0" />
            {storeLoading ? (
              <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
            ) : (
              <h1 className="text-sm font-semibold text-slate-900 truncate">
                {store?.displayName || storeId}
              </h1>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <UploadDialog storeId={storeId} className="h-8 w-8 p-0" iconOnly />
          {store && (
            <DeleteStoreDialog
              storeId={storeId}
              storeName={store.displayName || storeId}
              hasDocuments={totalDocs > 0}
              className="h-8 w-8 p-0"
              iconOnly
            />
          )}
        </div>
      </div>

      <main className="flex-1 flex flex-col md:overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-slate-500" />
              {storeLoading ? (
                <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
              ) : (
                <h1 className="text-lg font-semibold text-slate-900">
                  {store?.displayName || storeId}
                </h1>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UploadDialog storeId={storeId} />
            {store && (
              <DeleteStoreDialog
                storeId={storeId}
                storeName={store.displayName || storeId}
                hasDocuments={totalDocs > 0}
              />
            )}
          </div>
        </div>

        {/* Error state */}
        {storeError && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {storeError instanceof Error
                  ? storeError.message
                  : "Failed to load store"}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Mobile View - Tabbed Interface */}
        {!storeError && (
          <div className="md:hidden flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="chat" className="flex flex-col flex-1">
              <div className="px-3 pt-2 pb-2 bg-slate-50 border-b">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="docs">
                    Docs {documents ? `(${documents.length})` : ""}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="chat" className="flex-1 p-2 m-0">
                <div className="h-[calc(100vh-180px)]">
                  <ChatPlayground storeId={storeId} />
                </div>
              </TabsContent>

              <TabsContent value="docs" className="flex-1 overflow-auto p-4 m-0 pb-20">
                {docsLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                )}
                {!docsLoading && documents && (
                  <DocumentList documents={documents} storeId={storeId} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Desktop View - Split Layout */}
        {!storeError && (
          <div className="hidden md:flex flex-1 overflow-hidden">
            {/* Left column - Documents (40%) */}
            <div className="w-[40%] border-r p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-slate-900">Documents</h2>
                {documents && (
                  <span className="text-sm text-slate-500">
                    {documents.length} total
                  </span>
                )}
              </div>

              {docsLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              )}

              {!docsLoading && documents && (
                <DocumentList documents={documents} storeId={storeId} />
              )}
            </div>

            {/* Right column - Chat (60%) */}
            <div className="w-[60%] p-4 flex flex-col">
              <ChatPlayground storeId={storeId} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
