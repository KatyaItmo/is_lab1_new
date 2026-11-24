import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { addressApi, enumApi } from '../../api/service';
import { useNotification } from '../../context/NotificationContext';
import '../workers/WorkerModals.css';

export function OrganizationFormModal({ isOpen, onClose, initialOrganization, onSubmit }) {
    const { showNotification } = useNotification();
    const isEditMode = Boolean(initialOrganization);

    const [addressesList, setAddressesList] = useState([]);
    const [typesList, setTypesList] = useState([]);
    const [isLoadingRefs, setIsLoadingRefs] = useState(false);

    const [officialAddressId, setOfficialAddressId] = useState('');
    const [annualTurnover, setAnnualTurnover] = useState('');
    const [rating, setRating] = useState('');
    const [type, setType] = useState('');
    const [postalAddressId, setPostalAddressId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        let isCancelled = false;
        setIsLoadingRefs(true);

        Promise.all([addressApi.getAll(), enumApi.getOrganizationTypes()])
            .then(([addresses, orgTypes]) => {
                if (isCancelled) return;
                const safeAddresses = addresses || [];
                const safeTypes = orgTypes || [];

                setAddressesList(safeAddresses);
                setTypesList(safeTypes);

                if (initialOrganization) {
                    setOfficialAddressId(
                        initialOrganization.officialAddressId != null
                            ? String(initialOrganization.officialAddressId)
                            : ''
                    );
                    setAnnualTurnover(String(initialOrganization.annualTurnover ?? ''));
                    setRating(String(initialOrganization.rating ?? ''));
                    setType(initialOrganization.type || '');
                    setPostalAddressId(String(initialOrganization.postalAddressId ?? ''));
                } else {
                    setOfficialAddressId('');
                    setAnnualTurnover('');
                    setRating('');
                    setType('');
                    setPostalAddressId(safeAddresses.length > 0 ? String(safeAddresses[0].id) : '');
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    showNotification(error.message || 'failed to load addresses or types', 'error');
                }
            })
            .finally(() => {
                if (!isCancelled) setIsLoadingRefs(false);
            });

        return () => {
            isCancelled = true;
        };
    }, [isOpen, initialOrganization, showNotification]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const parsedTurnover = Number(annualTurnover);
        if (!Number.isInteger(parsedTurnover) || parsedTurnover < 1) {
            showNotification('annual turnover must be an integer >= 1', 'error');
            return;
        }

        const parsedRating = Number(rating);
        if (!Number.isInteger(parsedRating) || parsedRating < 1) {
            showNotification('rating must be an integer >= 1', 'error');
            return;
        }

        if (!postalAddressId) {
            showNotification('postal address is required', 'error');
            return;
        }

        const dto = {
            ...(isEditMode
                ? {
                    id: initialOrganization.id,
                    employeesCount: initialOrganization.employeesCount ?? null,
                }
                : { employeesCount: null }),
            officialAddressId: officialAddressId ? Number(officialAddressId) : null,
            annualTurnover: parsedTurnover,
            rating: parsedRating,
            type: type || null,
            postalAddressId: Number(postalAddressId),
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
            title={isEditMode ? `edit organization: #${initialOrganization.id}` : 'create organization'}
            maxWidth="860px"
        >
            {isLoadingRefs ? (
                <p>loading dictionaries...</p>
            ) : (
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                        <div className="modal-field">
                            <label>annual turnover (integer {'>='} 1) *</label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={annualTurnover}
                                onChange={(e) => setAnnualTurnover(e.target.value)}
                                placeholder="5000000"
                                required
                            />
                        </div>

                        <div className="modal-field">
                            <label>rating (integer {'>='} 1) *</label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                placeholder="10"
                                required
                            />
                        </div>

                        <div className="modal-field">
                            <label>postal address *</label>
                            <select
                                value={postalAddressId}
                                onChange={(e) => setPostalAddressId(e.target.value)}
                                required
                            >
                                <option value="">postal address</option>
                                {addressesList.map((addr) => (
                                    <option key={addr.id} value={addr.id}>
                                        #{addr.id} ({addr.street})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>official address (optional)</label>
                            <select
                                value={officialAddressId}
                                onChange={(e) => setOfficialAddressId(e.target.value)}
                            >
                                <option value="">(none)</option>
                                {addressesList.map((addr) => (
                                    <option key={addr.id} value={addr.id}>
                                        #{addr.id} ({addr.street})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>organization type (optional)</label>
                            <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="">(none)</option>
                                {typesList.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
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
