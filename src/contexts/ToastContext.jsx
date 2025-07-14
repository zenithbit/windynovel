import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, type = "success", duration = 4000) => {
      const id = Date.now() + Math.random();
      const newToast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message, duration) => {
      showToast(message, "success", duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message, duration) => {
      showToast(message, "error", duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message, duration) => {
      showToast(message, "warning", duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message, duration) => {
      showToast(message, "info", duration);
    },
    [showToast]
  );

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    toasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Render all toasts */}
      <div className="toast-container">
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            index={index}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
