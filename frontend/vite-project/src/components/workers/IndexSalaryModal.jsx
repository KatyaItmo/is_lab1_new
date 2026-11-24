import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { useNotification } from '../../context/NotificationContext';

export function IndexSalaryModal({ isOpen, onClose, worker, onSubmit }) {
    const { showNotification } = useNotification();
    const [coefficient, setCoefficient] = useState('2');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCoefficient('2');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const parsed = Number(coefficient);
        if (!Number.isInteger(parsed) || parsed < 1) {
            showNotification('coefficient must be an integer >= 1', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(worker.id, parsed);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!worker) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`index salary: #${worker.id}`}
            maxWidth="460px"
        >
            <form className="modal-form" onSubmit={handleSubmit}>
                <p style={{ fontSize: '16px', color: 'var(--pink-light)' }}>
                    worker: <strong>{worker.name}</strong> (current salary: {worker.salary})
                </p>

                <div className="modal-field">
                    <label htmlFor="salary-coeff">coefficient (integer {'>='} 1)</label>
                    <input
                        id="salary-coeff"
                        type="number"
                        min="1"
                        step="1"
                        value={coefficient}
                        onChange={(e) => setCoefficient(e.target.value)}
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="modal-actions">
                    <button type="button" onClick={onClose} disabled={isSubmitting}>
                        cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'saving...' : 'apply'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
