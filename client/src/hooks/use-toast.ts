import { toast as sonnerToast } from "sonner";

export const useToast = () => {
  return {
    toast: ({ title, description, variant }: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
      if (variant === "destructive") {
        sonnerToast.error(title || "خطأ", { description });
      } else {
        sonnerToast.success(title || "نجح", { description });
      }
    },
  };
};

export { sonnerToast as toast };
