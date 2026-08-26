import { toast, type ExternalToast } from "sonner";

export function generateToast(
  type: "success" | "warning" | "error" | "info",
  message: string,
  rest?: ExternalToast,
) {
  toast[type](message, {
    position: "top-center",
    ...rest,
  });
}
