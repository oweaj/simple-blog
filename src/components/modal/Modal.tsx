import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  trigger: React.ReactNode;
  actionButton: React.ReactNode;
}
const Modal = ({ trigger, actionButton }: ModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn("w-[25rem] h-auto min-h-40 rounded-lg p-4")}>
        <DialogTitle className="sr-only" />
        <DialogDescription className="sr-only" />
        <div className="flex w-full flex-row items-center justify-center gap-4">
          {actionButton}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
