import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <NotificationProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </NotificationProvider>
    </StrictMode>
);
