import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';

//==============================================================================
// 1. CONFIGURATION (Moved outside for performance and readability)
//==============================================================================

const TOAST_CONFIG = {
  success: {
    styles: 'bg-[#282828] border-green-700 text-green-300',
    icon: (
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    styles: 'bg-[#282828] border-red-700 text-red-300',
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    styles: 'bg-[#282828] border-yellow-700 text-yellow-300',
    icon: (
      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
  },
  info: {
    styles: 'bg-[#282828] border-blue-700 text-blue-300',
    icon: (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

//==============================================================================
// 2. TOAST COMPONENT (Cleaner and uses the config object)
//==============================================================================

const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const config = useMemo(() => TOAST_CONFIG[type] || TOAST_CONFIG.info, [type]);

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`rounded-lg border-2 p-4 shadow-lg backdrop-blur-sm ${config.styles}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">{config.icon}</div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              className="inline-flex text-gray-500 hover:text-gray-300 focus:outline-none"
              onClick={handleClose}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

//==============================================================================
// 3. TOAST PROVIDER (Supports both window.showToast and useToast hook)
//==============================================================================

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Use useCallback to ensure the function reference is stable
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  // This useEffect re-attaches the function to the window object
  // It ensures your existing `window.showToast` calls continue to work
  useEffect(() => {
    window.showToast = showToast;
    // Cleanup function to remove it when the component unmounts
    return () => {
      delete window.showToast;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};