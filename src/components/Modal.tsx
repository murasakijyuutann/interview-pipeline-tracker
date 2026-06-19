import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./Button";
import { isTopModal, popModal, pushModal } from "./modalStack";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** When false, clicking the dimmed overlay does not close the modal. */
  closeOnBackdropClick?: boolean;
  /** Raise stacked modals above earlier ones (e.g. add form over day detail). */
  layer?: number;
}

export function Modal({
  title,
  onClose,
  children,
  closeOnBackdropClick = true,
  layer = 0,
}: ModalProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const closeRef = useRef<() => void>(null);
  if (!closeRef.current) {
    closeRef.current = () => onCloseRef.current();
  }

  useEffect(() => {
    const close = closeRef.current!;
    pushModal(close);
    return () => popModal(close);
  }, []);

  useEffect(() => {
    const close = closeRef.current!;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isTopModal(close)) {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const zIndex = 50 + layer * 10;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      style={{ zIndex }}
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        className="relative w-full max-w-lg rounded-xl bg-gray-900 border border-gray-700 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
          <Button variant="ghost" onClick={onClose} className="px-2 py-1 text-gray-400">
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
