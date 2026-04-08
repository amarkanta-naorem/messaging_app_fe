'use client'
/**
 * ErrorToast Component
 * Displays user-friendly error messages with a toast-style UI
 */

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/store";
import { selectGlobalError, selectIsErrorVisible, dismissError } from "@/store/slices/errorSlice";

export function ErrorToast() {
  const dispatch = useAppDispatch();
  const globalError = useAppSelector(selectGlobalError);
  const isVisible = useAppSelector(selectIsErrorVisible);
  
  const [shouldRender, setShouldRender] = useState(false);

  // Handle visibility transitions
  useEffect(() => {
    if (isVisible && globalError) {
      setShouldRender(true);
    } else if (!isVisible) {
      // Delay hiding to allow for exit animation
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, globalError]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (isVisible && globalError) {
      const timer = setTimeout(() => {
        dispatch(dismissError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, globalError, dispatch]);

  if (!shouldRender || !globalError) {
    return null;
  }

  const getErrorStyles = () => {
    switch (globalError.type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/90 dark:to-emerald-950/90',
          border: 'border-l-4 border-green-500 dark:border-green-400',
          iconBg: 'bg-green-100 dark:bg-green-900/50',
          icon: '✓',
          text: 'text-green-800 dark:text-green-200',
          title: 'Success',
          progress: 'bg-green-500 dark:bg-green-400'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/90 dark:to-amber-900/90',
          border: 'border-l-4 border-amber-500 dark:border-amber-400',
          iconBg: 'bg-amber-100 dark:bg-amber-900/50',
          icon: '⚠️',
          text: 'text-amber-800 dark:text-amber-200',
          title: 'Warning',
          progress: 'bg-amber-500 dark:bg-amber-400'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/90 dark:to-blue-950/90',
          border: 'border-l-4 border-sky-500 dark:border-sky-400',
          iconBg: 'bg-sky-100 dark:bg-sky-900/50',
          icon: 'ℹ️',
          text: 'text-sky-800 dark:text-sky-200',
          title: 'Information',
          progress: 'bg-sky-500 dark:bg-sky-400'
        };
      case 'error':
      default:
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/90 dark:to-rose-950/90',
          border: 'border-l-4 border-red-500 dark:border-red-400',
          iconBg: 'bg-red-100 dark:bg-red-900/50',
          icon: '❌',
          text: 'text-red-800 dark:text-red-200',
          title: 'Error',
          progress: 'bg-red-500 dark:bg-red-400'
        };
    }
  };

  const styles = getErrorStyles();

  return (
    <div 
      className={`fixed top-6 right-6 z-50 max-w-md w-full transform transition-all duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}`}
      role="alert"
      aria-live="polite"
    >
      <div className={`relative overflow-hidden rounded-2xl shadow-2xl ${styles.bg} backdrop-blur-sm`}>
        {/* Subtle decorative accent */}
        <div className={`absolute inset-0 opacity-10 pointer-events-none ${styles.progress}`} />
        
        {/* Main content */}
        <div className="relative p-5">
          <div className="flex items-start gap-4">
            {/* Icon container with soft background */}
            <div className={`shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center text-lg shadow-sm`}>
              <span aria-hidden="true">{styles.icon}</span>
            </div>
            
            {/* Message content */}
            <div className="flex-1 min-w-0">
              {/* <div className="flex items-center justify-between gap-3 mb-1">
                <h3 className={`font-semibold text-sm uppercase tracking-wider ${styles.text}`}>{styles.title}</h3>
              </div> */}
              <p className={`text-sm leading-relaxed ${styles.text} opacity-90 font-medium`}>{globalError.message}</p>
            </div>
            
            {/* Close button with enhanced hover effect */}
            <button
              onClick={() => dispatch(dismissError())}
              className={`shrink-0 ml-2 p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${styles.text} hover:bg-black/5 dark:hover:bg-white/10`}
              aria-label="Close error message"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
        
        {/* Elegant progress bar with gradient */}
        <div className="h-1 bg-black/5 dark:bg-white/5 overflow-hidden">
          <div 
            className={`h-full ${styles.progress} transition-all duration-5000 ease-linear`} 
            style={{ width: isVisible ? '100%' : '0%' }}
          />
        </div>
        
        {/* Subtle inner shadow for depth */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-inner" />
      </div>
    </div>
  );
}

export default ErrorToast;