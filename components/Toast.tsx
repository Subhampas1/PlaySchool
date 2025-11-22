import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // ms
}

const colorMap: Record<string, string> = {
  success: "bg-green-500",
  error: "bg-rose-500",
  info: "bg-sky-500",
};

const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  isOpen,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => onClose(), duration);
    return () => clearTimeout(t);
  }, [isOpen, duration, onClose]);

  return (
    <div
      aria-live="polite"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 z-50"
    >
      <div className="w-full flex flex-col items-end space-y-4">
        <div
          className={`transform transition-all duration-300 pointer-events-auto max-w-sm w-full ${
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } `}
        >
          <div
            className={`rounded-lg shadow-lg ring-1 ring-black/5 overflow-hidden ${colorMap[type]} text-white`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="ml-3 w-0 flex-1 text-sm leading-6">
                  <p className="break-words">{message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 self-start">
                  <button
                    onClick={onClose}
                    className="inline-flex text-white/90 hover:text-white focus:outline-none"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
