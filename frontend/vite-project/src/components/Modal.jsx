import { useEffect } from 'react';
import './Modal.css';
import { createPortal } from 'react-dom';

export function Modal({ isOpen, onClose, title, children, maxWidth = '600px' }) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-window"
                style={{ maxWidth }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button type="button" className="modal-close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-body">{children}</div>
            </div>
        </div>,
        document.body
    );
}
