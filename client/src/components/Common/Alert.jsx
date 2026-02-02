import React, { useEffect } from "react";

const alertStyles = {
  success: {
    container:
      "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700",
    text: "text-green-700 dark:text-green-300",
    icon: "✓",
    dismissBtn:
      "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200",
  },
  error: {
    container:
      "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700",
    text: "text-red-700 dark:text-red-300",
    icon: "⚠️",
    dismissBtn:
      "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200",
  },
  warning: {
    container:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-400",
    icon: "⚠️",
    dismissBtn: "text-yellow-600 dark:text-yellow-400 hover:text-yellow-800",
  },
  info: {
    container:
      "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
    text: "text-blue-700 dark:text-blue-300",
    icon: "ℹ️",
    dismissBtn: "text-blue-600 dark:text-blue-400 hover:text-blue-800",
  },
};

/**
 * Reusable Alert component for success/error/warning/info messages
 * @param {Object} props
 * @param {string} props.message - Alert message
 * @param {'success' | 'error' | 'warning' | 'info'} props.type - Alert type
 * @param {Function} props.onDismiss - Dismiss handler (if provided, shows close button)
 * @param {boolean} props.autoDismiss - Auto-dismiss after timeout
 * @param {number} props.autoDismissMs - Auto-dismiss timeout in ms (default: 3000)
 * @param {string|null} props.icon - Custom icon (null to hide)
 * @param {string} props.className - Additional CSS classes
 */
export const Alert = ({
  message,
  type = "info",
  onDismiss,
  autoDismiss = false,
  autoDismissMs = 3000,
  icon,
  className = "",
}) => {
  const styles = alertStyles[type] || alertStyles.info;
  const displayIcon = icon === null ? "" : (icon ?? styles.icon);

  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, autoDismissMs, onDismiss]);

  return (
    <div
      className={`border rounded-lg p-4 flex justify-between items-center ${styles.container} ${className}`}
    >
      <p className={`font-medium ${styles.text}`}>
        {displayIcon && <span className="mr-2">{displayIcon}</span>}
        {message}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`ml-4 font-bold ${styles.dismissBtn}`}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};
