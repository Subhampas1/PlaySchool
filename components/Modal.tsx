import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { XCircleIcon } from "./icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClass?: string; // e.g. 'max-w-lg', 'max-w-2xl'
  align?: "start" | "center" | "end"; // vertical alignment on the viewport
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = "max-w-lg",
  align = "start",
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // compute wrapper classes based on requested vertical alignment
  const wrapperClass =
    align === "center"
      ? "fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto"
      : align === "end"
      ? "fixed inset-0 z-[100] flex items-end justify-center p-4 md:p-6 overflow-y-auto"
      : // start (default)
        "fixed inset-0 z-[100] flex items-start justify-center pt-12 px-4 md:p-6 overflow-y-auto";

  const modalContent = (
    <div className={wrapperClass}>
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div
        className={`relative w-full mx-auto ${maxWidthClass} bg-white dark:bg-slate-800 rounded-3xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transform transition-all scale-100 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] z-[9999]`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 dark:border-slate-700/50">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors rounded-full p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            aria-label="Close modal"
          >
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
