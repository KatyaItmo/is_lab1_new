import { useState, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { useWebSocket } from './hooks/useWebSocket';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthPage } from './pages/AuthPage';
import { WorkersPage } from './pages/WorkersPage';
import { DirectoriesPage } from './pages/DirectoriesPage';
import { OperationsPage } from './pages/OperationsPage';
import './App.css';

export default function App() {
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('workers');
    const [wsEvent, setWsEvent] = useState({ entity: null, timestamp: 0 });

    const handleSocketMessage = useCallback((entityName) => {
        setWsEvent({ entity: entityName, timestamp: Date.now() });
    }, []);

    useWebSocket(isAuthenticated, handleSocketMessage);

    if (!isAuthenticated) {
        return (
            <div className="app-container">
                <Header />
                <main className="main-content">
                    <AuthPage />
                </main>
                <Footer />
            </div>
        );
    }


    return (
        <div className="app-container">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="main-content">
                {activeTab === 'workers' && <WorkersPage wsEvent={wsEvent} />}
                {activeTab === 'directories' && <DirectoriesPage wsEvent={wsEvent} />}
                {activeTab === 'operations' && <OperationsPage wsEvent={wsEvent} />}
            </main>

            <Footer />
        </div>
    );
}