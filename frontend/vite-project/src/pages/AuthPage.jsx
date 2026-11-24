import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './AuthPage.css';

export function AuthPage() {
    const { login, register } = useAuth();
    const { showNotification } = useNotification();

    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            showNotification('username and password cannot be empty', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isRegisterMode) {
                await register(username, password);
                showNotification(`welcome, @${username.trim()}!`, 'success');
            } else {
                await login(username, password);
                showNotification(`logged in as @${username.trim()}`, 'success');
            }
        } catch (error) {
            showNotification(error.message || 'authentication failed', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMode = () => {
        setIsRegisterMode((prev) => !prev);
        setPassword('');
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2 className="auth-title">{isRegisterMode ? 'register' : 'login'}</h2>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label htmlFor="username">username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="enter username..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isSubmitting}
                            autoComplete="username"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="enter password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                            autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'please wait...' : isRegisterMode ? 'register' : 'login'}
                    </button>
                </form>

                <div className="auth-switch">
                    <button type="button" className="auth-switch-link" onClick={toggleMode} disabled={isSubmitting}>
                        {isRegisterMode ? 'already have an account? login' : 'no account? register'}
                    </button>
                </div>
            </div>
        </div>
    );
}
