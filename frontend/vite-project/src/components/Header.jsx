import { useAuth } from '../context/AuthContext';
import './Header.css';

const TABS = [
    { id: 'workers', label: 'workers' },
    { id: 'directories', label: 'other objects' },
    { id: 'operations', label: 'swo' },
];

export function Header({ activeTab, setActiveTab }) {
    const { username, isAuthenticated, logout } = useAuth();

    return (
        <header className="app-header">
            <div className="header-inner">
                <h1 className="header-title">IS LAB 1 - WORKER MANAGER</h1>

                {isAuthenticated && (
                    <nav className="header-nav">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                )}

                <div className="header-auth">
                    {isAuthenticated ? (
                        <>
                            <span className="header-username">@{username}</span>
                            <button type="button" className="header-logout-btn" onClick={logout}>
                                logout
                            </button>
                        </>
                    ) : (
                        <span className="header-guest">not authorized</span>
                    )}
                </div>
            </div>
        </header>
    );
}
