"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteStore } from "@/hooks/use-stores";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteStoreDialogProps {
  storeId: string;
  storeName: string;
  hasDocuments: boolean;
  onDeleted?: () => void;
  className?: string;
  iconOnly?: boolean;
}

export function DeleteStoreDialog({
  storeId,
  storeName,
  hasDocuments,
  onDeleted,
  className,
  iconOnly,
}: DeleteStoreDialogProps) {
  const [open, setOpen] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const deleteStore = useDeleteStore();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteStore.mutateAsync({ storeId, force: forceDelete });
      toast.success("Store deleted successfully");
      setOpen(false);
      if (onDeleted) {
        onDeleted();
      } else {
        router.push("/");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete store"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size={iconOnly ? "icon" : "sm"} className={className}>
          <Trash2 className={iconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} />
          {!iconOnly && "Delete Store"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Store</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{storeName}&quot;? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {hasDocuments && (
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="forceDelete"
                checked={forceDelete}
                onChange={(e) => setForceDelete(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="forceDelete" className="text-sm">
                Force delete (also delete all documents)
              </Label>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              This store contains documents. Enable force delete to remove them
              along with the store.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteStore.isPending || (hasDocuments && !forceDelete)}
          >
            {deleteStore.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
