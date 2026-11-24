import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { useNotification } from '../../context/NotificationContext';

export function CreateCoordinatesModal({ isOpen, onClose, onSubmit }) {
    const { showNotification } = useNotification();
    const [x, setX] = useState('');
    const [y, setY] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setX('');
            setY('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const parsedX = Number(x);
        const parsedY = Number(y);

        if (x === '' || Number.isNaN(parsedX)) {
            showNotification('x must be a valid number', 'error');
            return;
        }
        if (y === '' || !Number.isInteger(parsedY)) {
            showNotification('y must be a valid integer', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ x: parsedX, y: parsedY });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="create coordinates" maxWidth="440px">
            <form className="modal-form" onSubmit={handleSubmit}>
                <div className="modal-field">
                    <label>x (double) *</label>
                    <input
                        type="number"
                        step="any"
                        value={x}
                        onChange={(e) => setX(e.target.value)}
                        placeholder="67.67"
                        required
                    />
                </div>

                <div className="modal-field">
                    <label>y (integer) *</label>
                    <input
                        type="number"
                        step="1"
                        value={y}
                        onChange={(e) => setY(e.target.value)}
                        placeholder="-67"
                        required
                    />
                </div>

                <div className="modal-actions">
                    <button type="button" onClick={onClose} disabled={isSubmitting}>
                        cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'creating...' : 'create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export function CreateLocationModal({ isOpen, onClose, onSubmit }) {
    const { showNotification } = useNotification();
    const [x, setX] = useState('');
    const [y, setY] = useState('');
    const [z, setZ] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setX('');
            setY('');
            setZ('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const parsedX = Number(x);
        const parsedY = Number(y);
        const parsedZ = Number(z);

        if (x === '' || !Number.isInteger(parsedX)) {
            showNotification('x must be a valid integer', 'error');
            return;
        }
        if (y === '' || !Number.isInteger(parsedY)) {
            showNotification('y must be a valid integer', 'error');
            return;
        }
        if (z === '' || !Number.isInteger(parsedZ)) {
            showNotification('z must be a valid integer', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ x: parsedX, y: parsedY, z: parsedZ });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="create location" maxWidth="440px">
            <form className="modal-form" onSubmit={handleSubmit}>
                <div className="modal-field">
                    <label>x (long) *</label>
                    <input
                        type="number"
                        step="1"
                        value={x}
                        onChange={(e) => setX(e.target.value)}
                        placeholder="1200000"
                        required
                    />
                </div>

                <div className="modal-field">
                    <label>y (integer) *</label>
                    <input
                        type="number"
                        step="1"
                        value={y}
                        onChange={(e) => setY(e.target.value)}
                        placeholder="200"
                        required
                    />
                </div>

                <div className="modal-field">
                    <label>z (integer) *</label>
                    <input
                        type="number"
                        step="1"
                        value={z}
                        onChange={(e) => setZ(e.target.value)}
                        placeholder="1984"
                        required
                    />
                </div>

                <div className="modal-actions">
                    <button type="button" onClick={onClose} disabled={isSubmitting}>
                        cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'creating...' : 'create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
