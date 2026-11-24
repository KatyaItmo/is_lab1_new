import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { locationApi } from '../../api/service';
import { useNotification } from '../../context/NotificationContext';

export function AddressFormModal({ isOpen, onClose, initialAddress, onSubmit }) {
    const { showNotification } = useNotification();
    const isEditMode = Boolean(initialAddress);

    const [locationsList, setLocationsList] = useState([]);
    const [isLoadingRefs, setIsLoadingRefs] = useState(false);

    const [street, setStreet] = useState('');
    const [townId, setTownId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        let isCancelled = false;
        setIsLoadingRefs(true);

        locationApi
            .getAll()
            .then((locations) => {
                if (isCancelled) return;
                setLocationsList(locations || []);

                if (initialAddress) {
                    setStreet(initialAddress.street || '');
                    setTownId(initialAddress.townId != null ? String(initialAddress.townId) : '');
                } else {
                    setStreet('');
                    setTownId('');
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    showNotification(error.message || 'failed to load locations', 'error');
                }
            })
            .finally(() => {
                if (!isCancelled) setIsLoadingRefs(false);
            });

        return () => {
            isCancelled = true;
        };
    }, [isOpen, initialAddress, showNotification]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!street.trim()) {
            showNotification('street cannot be empty', 'error');
            return;
        }

        const dto = {
            ...(isEditMode ? { id: initialAddress.id } : {}),
            street: street.trim(),
            townId: townId ? Number(townId) : null,
        };

        setIsSubmitting(true);
        try {
            await onSubmit(dto);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? `edit address: #${initialAddress.id}` : 'create address'}
            maxWidth="460px"
        >
            {isLoadingRefs ? (
                <p>loading locations...</p>
            ) : (
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="modal-field">
                        <label>street *</label>
                        <input
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="Kronverksky pr. 49"
                            required
                        />
                    </div>

                    <div className="modal-field">
                        <label>town (optional)</label>
                        <select value={townId} onChange={(e) => setTownId(e.target.value)}>
                            <option value="">(none)</option>
                            {locationsList.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                    #{loc.id} (x: {loc.x}, y: {loc.y}, z: {loc.z})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} disabled={isSubmitting}>
                            cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'saving...' : isEditMode ? 'save changes' : 'create'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
