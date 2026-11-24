import { createContext, useContext, useState, useCallback } from 'react';
import './Notification.css';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const showNotification = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setNotifications((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeNotification(id);
        }, 4000);
    }, [removeNotification]);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            <div className="toast-container">
                {notifications.map((item) => (
                    <div key={item.id} className={`toast toast-${item.type}`}>
                        <span>{item.message}</span>
                        <button
                            type="button"
                            className="toast-close"
                            onClick={() => removeNotification(item.id)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification должен использоваться внутри NotificationProvider');
    }
    return context;
}
