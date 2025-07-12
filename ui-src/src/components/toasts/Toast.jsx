// ui-src/src/components/toasts/Toast.jsx
import React, { useEffect, useState, useCallback, useRef } from "react"; // Added useRef
import "./Toast.css";

const Toast = ({ message, type = "info", duration = 3000, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const onDismissRef = useRef(onDismiss); // Store onDismiss in a ref

  // Update the ref if onDismiss prop changes (though in this case, it always will from ToastContainer)
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismissRef.current) {
        onDismissRef.current(); // Call the latest version of onDismiss via ref
      }
    }, 300); // Animation duration
  }, []); // No dependencies for handleDismiss itself if it uses a ref for onDismiss

  useEffect(() => {
    setIsVisible(true); // Animate in

    let timerId = null;
    if (duration > 0) {
      timerId = setTimeout(handleDismiss, duration); // handleDismiss is now stable
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [duration, handleDismiss]); // Dependency on stable handleDismiss and duration

  return (
    <div className={`toast ${type} ${isVisible ? "visible" : "hidden"}`}>
      <span className="toast-message">{message}</span>
      <button onClick={handleDismiss} className="toast-close-button">
        &times;
      </button>
    </div>
  );
};

export default Toast;
