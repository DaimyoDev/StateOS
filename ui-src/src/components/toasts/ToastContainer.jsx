// ui-src/src/components/toasts/ToastContainer.jsx
import React from "react";
import useGameStore from "../../store";
import Toast from "./Toast";
import "./ToastContainer.css";

const ToastContainer = () => {
  const toasts = useGameStore((state) => state.toasts || []);

  const removeToast = useGameStore((state) => state.actions.removeToast);

  if (!toasts || !toasts.length) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={() => removeToast(toast.id)} // This creates a new function on every render
        />
      ))}
    </div>
  );
};

export default ToastContainer;
