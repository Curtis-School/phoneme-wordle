"use client";

import { useCallback, useEffect, useState } from "react";

export type ToastTone = "success" | "error";

export type Toast = { tone: ToastTone; message: string };

const TONE_CLASSES: Record<ToastTone, string> = {
  success: "border-correct bg-correct text-correct-foreground",
  error: "border-present bg-present text-present-foreground",
};

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<Toast>();

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(undefined), duration);

    return () => clearTimeout(timer);
  }, [toast, duration]);

  const show = useCallback((tone: ToastTone, message: string) => {
    setToast({ tone, message });
  }, []);

  return { toast, show };
}

export function ToastMessage({ toast }: { toast: Toast | undefined }) {
  if (!toast) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${TONE_CLASSES[toast.tone]}`}
    >
      {toast.message}
    </div>
  );
}
