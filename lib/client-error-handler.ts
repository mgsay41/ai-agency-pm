import { toast } from "sonner";

/**
 * Client-side error handler for API calls
 */
export function handleApiError(error: unknown, defaultMessage: string = "An error occurred"): void {
  if (error instanceof Response) {
    // HTTP error response
    error.json().then((data) => {
      const message = data.error?.message || data.message || defaultMessage;
      toast.error(message);
    }).catch(() => {
      toast.error(defaultMessage);
    });
  } else if (error instanceof Error) {
    toast.error(error.message || defaultMessage);
  } else {
    toast.error(defaultMessage);
  }
}

/**
 * Success toast helper
 */
export function showSuccess(message: string): void {
  toast.success(message);
}

/**
 * Info toast helper
 */
export function showInfo(message: string): void {
  toast.info(message);
}

/**
 * Warning toast helper
 */
export function showWarning(message: string): void {
  toast.warning(message);
}
