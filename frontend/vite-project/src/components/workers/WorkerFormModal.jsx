import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import {
    coordinatesApi,
    organizationApi,
    personApi,
    enumApi,
} from '../../api/service';
import { useNotification } from '../../context/NotificationContext';
import './WorkerModals.css';

function toDateTimeLocal(dateValue) {
    if (!dateValue) return '';
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function WorkerFormModal({ isOpen, onClose, initialWorker, onSubmit }) {
    const { showNotification } = useNotification();
    const isEditMode = Boolean(initialWorker);

    const [coordinatesList, setCoordinatesList] = useState([]);
    const [organizationsList, setOrganizationsList] = useState([]);
    const [personsList, setPersonsList] = useState([]);
    const [positionsList, setPositionsList] = useState([]);
    const [statusesList, setStatusesList] = useState([]);
    const [isLoadingRefs, setIsLoadingRefs] = useState(false);

    const [name, setName] = useState('');
    const [coordinatesId, setCoordinatesId] = useState('');
    const [organizationId, setOrganizationId] = useState('');
    const [salary, setSalary] = useState('');
    const [rating, setRating] = useState('');
    const [startDate, setStartDate] = useState('');
    const [position, setPosition] = useState('');
    const [status, setStatus] = useState('REGULAR');
    const [personId, setPersonId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        let isCancelled = false;
        setIsLoadingRefs(true);

        Promise.all([
            coordinatesApi.getAll(),
            organizationApi.getAll(),
            personApi.getAll(),
            enumApi.getPositions(),
            enumApi.getStatuses(),
        ])
            .then(([coords, orgs, persons, positions, statuses]) => {
                if (isCancelled) return;
                const safeCoords = coords || [];
                const safeOrgs = orgs || [];
                const safePersons = persons || [];
                const safePositions = positions || [];
                const allowedStatuses = (statuses || []).filter((s) => s !== 'FIRED');

                setCoordinatesList(safeCoords);
                setOrganizationsList(safeOrgs);
                setPersonsList(safePersons);
                setPositionsList(safePositions);
                setStatusesList(allowedStatuses);

                if (initialWorker) {
                    setName(initialWorker.name || '');
                    setCoordinatesId(String(initialWorker.coordinatesId ?? ''));
                    setOrganizationId(
                        initialWorker.organizationId != null
                            ? String(initialWorker.organizationId)
                            : ''
                    );
                    setSalary(String(initialWorker.salary ?? ''));
                    setRating(String(initialWorker.rating ?? ''));
                    setStartDate(toDateTimeLocal(initialWorker.startDate));
                    setPosition(initialWorker.position || '');
                    setStatus(
                        initialWorker.status && initialWorker.status !== 'FIRED'
                            ? initialWorker.status
                            : allowedStatuses[0] || 'REGULAR'
                    );
                    setPersonId(String(initialWorker.personId ?? ''));
                } else {
                    setName('');
                    setCoordinatesId(safeCoords.length > 0 ? String(safeCoords[0].id) : '');
                    setOrganizationId(safeOrgs.length > 0 ? String(safeOrgs[0].id) : '');
                    setSalary('');
                    setRating('');
                    setStartDate(toDateTimeLocal(new Date()));
                    setPosition('');
                    setStatus(allowedStatuses[0] || 'REGULAR');
                    setPersonId(safePersons.length > 0 ? String(safePersons[0].id) : '');
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    showNotification(error.message || 'failed to load dictionaries', 'error');
                }
            })
            .finally(() => {
                if (!isCancelled) setIsLoadingRefs(false);
            });

        return () => {
            isCancelled = true;
        };
    }, [isOpen, initialWorker, showNotification]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            showNotification('name is required and cannot be blank', 'error');
            return;
        }
        if (!coordinatesId || !organizationId || !personId) {
            showNotification('coordinates, organization and person are required', 'error');
            return;
        }

        const parsedSalary = Number(salary);
        if (!Number.isInteger(parsedSalary) || parsedSalary < 1) {
            showNotification('salary must be an integer >= 1', 'error');
            return;
        }

        const parsedRating = Number(rating);
        if (Number.isNaN(parsedRating) || parsedRating <= 0) {
            showNotification('rating must be a number > 0', 'error');
            return;
        }

        if (!startDate) {
            showNotification('start date is required', 'error');
            return;
        }
        const parsedStartDate = new Date(startDate);
        if (Number.isNaN(parsedStartDate.getTime())) {
            showNotification('invalid start date format', 'error');
            return;
        }

        if (!status || status === 'FIRED') {
            showNotification('valid active status is required', 'error');
            return;
        }

        const dto = {
            ...(isEditMode
                ? { id: initialWorker.id, creationTime: initialWorker.creationTime }
                : {}),
            name: name.trim(),
            coordinatesId: Number(coordinatesId),
            organizationId: Number(organizationId),
            salary: parsedSalary,
            rating: parsedRating,
            startDate: parsedStartDate.toISOString(),
            position: position || null,
            status,
            personId: Number(personId),
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
            title={isEditMode ? `edit worker: #${initialWorker.id}` : 'create new worker'}
            maxWidth="720px"
        >
            {isLoadingRefs ? (
                <p>loading dictionaries...</p>
            ) : (
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                        <div className="modal-field">
                            <label>name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="worker name"
                                required
                            />
                        </div>

                        <div className="modal-field">
                            <label>start date *</label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="modal-field">
                            <label>salary (integer &ge; 1) *</label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                placeholder="100000"
                                required
                            />
                        </div>

                        <div className="modal-field">
                            <label>rating (&gt; 0) *</label>
                            <input
                                type="number"
                                step="any"
                                min="0.01"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                placeholder="4.8"
                                required
                            />
                        </div>

                        <div className="modal-field">
                            <label>coordinates *</label>
                            <select
                                value={coordinatesId}
                                onChange={(e) => setCoordinatesId(e.target.value)}
                                required
                            >
                                <option value="">select coordinates</option>
                                {coordinatesList.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        #{c.id} (x: {c.x}, y: {c.y})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>organization *</label>
                            <select
                                value={organizationId}
                                onChange={(e) => setOrganizationId(e.target.value)}
                                required
                            >
                                <option value="">select organization</option>
                                {organizationsList.map((org) => (
                                    <option key={org.id} value={org.id}>
                                        #{org.id} ({org.type || 'NO_TYPE'}, rating: {org.rating})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>person *</label>
                            <select
                                value={personId}
                                onChange={(e) => setPersonId(e.target.value)}
                                required
                            >
                                <option value="">select person</option>
                                {personsList.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        #{p.id} (passport: {p.passportId})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>status *</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                required
                            >
                                {statusesList.map((st) => (
                                    <option key={st} value={st}>
                                        {st}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>position (optional)</label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                            >
                                <option value="">(none)</option>
                                {positionsList.map((pos) => (
                                    <option key={pos} value={pos}>
                                        {pos}
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
