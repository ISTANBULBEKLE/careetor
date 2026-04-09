"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { deleteCV } from "@/actions/cv.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface CVDeleteButtonProps {
  cvId: string;
  userId: string;
}

export function CVDeleteButton({ cvId, userId }: CVDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCV(cvId, userId);
        toast.success("CV deleted successfully");
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Failed to delete CV");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="icon-sm" />
        }
      >
        <Trash2 className="size-3" />
        <span className="sr-only">Delete</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete CV</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this CV? This action cannot be
            undone. All parsed sections will also be removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete CV"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
