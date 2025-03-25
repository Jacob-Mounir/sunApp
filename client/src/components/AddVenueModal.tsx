import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddVenueForm } from "./AddVenueForm";
import { ReactNode, useState } from "react";
import { Venue } from "@/types";
import { Plus } from "lucide-react";

interface AddVenueModalProps {
  children?: ReactNode;
  triggerClassName?: string;
  onVenueAdded?: (venue: Venue) => void;
}

export function AddVenueModal({ 
  children, 
  triggerClassName,
  onVenueAdded
}: AddVenueModalProps) {
  const [open, setOpen] = useState(false);
  
  const handleSuccess = (venue: Venue) => {
    if (onVenueAdded) {
      onVenueAdded(venue);
    }
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className={triggerClassName || "bg-amber-500 hover:bg-amber-600"}>
            <Plus className="mr-1 h-4 w-4" /> Add New Venue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Venue</DialogTitle>
          <DialogDescription>
            Manually add a venue that isn't in our database yet.
          </DialogDescription>
        </DialogHeader>
        <AddVenueForm 
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}