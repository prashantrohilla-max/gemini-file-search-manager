"use client";

import { useStores } from "@/hooks/use-stores";
import { Sidebar } from "@/components/sidebar";
import { StoreCard } from "@/components/store-card";
import { CreateStoreDialog } from "@/components/create-store-dialog";
import { Database, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HomePage() {
  const { data: stores, isLoading, error } = useStores();

  return (
    <div className="flex min-h-screen flex-col md:flex-row md:h-screen md:overflow-hidden bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-slate-700" />
          <span className="font-semibold text-slate-900">File Search</span>
        </div>
      </div>

      <main className="flex-1 flex flex-col md:overflow-hidden">
        <div className="p-4 md:p-8 flex-1 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                File Search Stores
              </h1>
              <p className="text-sm md:text-base text-slate-500 mt-1">
                Manage your File Search stores and documents
              </p>
            </div>
            <CreateStoreDialog />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : "Failed to load stores"}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && stores && stores.length === 0 && (
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">
                No stores yet
              </h3>
              <p className="mt-2 text-slate-500">
                Create your first File Search store to get started.
              </p>
            </div>
          )}

          {!isLoading && !error && stores && stores.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
              {stores.map((store) => (
                <StoreCard key={store.name} store={store} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
