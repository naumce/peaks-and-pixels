'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { ...toast, id };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove after duration
        const duration = toast.duration || 5000;
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);

    const success = useCallback((title: string, description?: string) => {
        addToast({ type: 'success', title, description });
    }, [addToast]);

    const error = useCallback((title: string, description?: string) => {
        addToast({ type: 'error', title, description, duration: 7000 });
    }, [addToast]);

    const info = useCallback((title: string, description?: string) => {
        addToast({ type: 'info', title, description });
    }, [addToast]);

    const warning = useCallback((title: string, description?: string) => {
        addToast({ type: 'warning', title, description });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    };

    const backgrounds = {
        success: 'border-green-500/20 bg-green-500/5',
        error: 'border-red-500/20 bg-red-500/5',
        info: 'border-blue-500/20 bg-blue-500/5',
        warning: 'border-amber-500/20 bg-amber-500/5',
    };

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-lg shadow-lg animate-in slide-in-from-right-5 fade-in duration-300 ${backgrounds[toast.type]}`}
        >
            <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{toast.title}</p>
                {toast.description && (
                    <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>
                )}
            </div>
            <button
                onClick={onClose}
                className="shrink-0 p-1 rounded-lg hover:bg-muted transition-colors"
            >
                <X className="h-4 w-4 text-muted-foreground" />
            </button>
        </div>
    );
}
