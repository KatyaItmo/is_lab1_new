import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { locationApi, enumApi } from '../../api/service';
import { useNotification } from '../../context/NotificationContext';
import '../workers/WorkerModals.css';

function toDateInputValue(dateValue) {
    if (!dateValue) return '';
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function PersonFormModal({ isOpen, onClose, initialPerson, onSubmit }) {
    const { showNotification } = useNotification();
    const isEditMode = Boolean(initialPerson);

    const [locationsList, setLocationsList] = useState([]);
    const [colorsList, setColorsList] = useState([]);
    const [countriesList, setCountriesList] = useState([]);
    const [isLoadingRefs, setIsLoadingRefs] = useState(false);

    const [eyeColor, setEyeColor] = useState('');
    const [hairColor, setHairColor] = useState('');
    const [locationId, setLocationId] = useState('');
    const [birthday, setBirthday] = useState('');
    const [height, setHeight] = useState('');
    const [passportId, setPassportId] = useState('');
    const [nationality, setNationality] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        let isCancelled = false;
        setIsLoadingRefs(true);

        Promise.all([
            locationApi.getAll(),
            enumApi.getColors(),
            enumApi.getCountries(),
        ])
            .then(([locations, colors, countries]) => {
                if (isCancelled) return;
                const safeLocations = locations || [];
                const safeColors = colors || [];
                const safeCountries = countries || [];

                setLocationsList(safeLocations);
                setColorsList(safeColors);
                setCountriesList(safeCountries);

                if (initialPerson) {
                    setEyeColor(initialPerson.eyeColor || '');
                    setHairColor(initialPerson.hairColor || '');
                    setLocationId(String(initialPerson.locationId ?? ''));
                    setBirthday(toDateInputValue(initialPerson.birthday));
                    setHeight(String(initialPerson.height ?? ''));
                    setPassportId(initialPerson.passportId || '');
                    setNationality(initialPerson.nationality || '');
                } else {
                    setEyeColor(safeColors.length > 0 ? safeColors[0] : '');
                    setHairColor('');
                    setLocationId(safeLocations.length > 0 ? String(safeLocations[0].id) : '');
                    setBirthday('2000-01-01');
                    setHeight('');
                    setPassportId('');
                    setNationality('');
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
    }, [isOpen, initialPerson, showNotification]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!eyeColor) {
            showNotification('eye color is required', 'error');
            return;
        }
        if (!locationId) {
            showNotification('location is required', 'error');
            return;
        }
        if (!birthday) {
            showNotification('birthday is required', 'error');
            return;
        }

        const parsedBirthday = new Date(`${birthday}T00:00:00`);
        if (Number.isNaN(parsedBirthday.getTime())) {
            showNotification('invalid birthday date', 'error');
            return;
        }

        const parsedHeight = Number(height);
        if (!Number.isInteger(parsedHeight) || parsedHeight < 1) {
            showNotification('height must be an integer >= 1', 'error');
            return;
        }

        if (!passportId.trim() || passportId.trim().length < 8) {
            showNotification('passport id must be at least 8 characters long', 'error');
            return;
        }

        const dto = {
            ...(isEditMode ? { id: initialPerson.id } : {}),
            eyeColor,
            hairColor: hairColor || null,
            locationId: Number(locationId),
            birthday: parsedBirthday.toISOString(),
            height: parsedHeight,
            passportId: passportId.trim(),
            nationality: nationality || null,
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
            title={isEditMode ? `edit person: #${initialPerson.id}` : 'create person'}
            maxWidth="700px"
        >
            {isLoadingRefs ? (
                <p>loading dictionaries...</p>
            ) : (
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                        <div className="modal-field">
                            <label>passport id (min 8 chars) *</label>
                            <input
                                type="text"
                                minLength={8}
                                value={passportId}
                                onChange={(e) => setPassportId(e.target.value)}
                                placeholder="4015123456"
                                required
                            />
                        </div>

                        <div className="modal-field">
                            <label>birthday *</label>
                            <input
                                type="date"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                required
                            />
                        </div>

                        <div className="modal-field">
                            <label>height (integer {'>='} 1) *</label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="175"
                                required
                            />
                        </div>

                        <div className="modal-field">
                            <label>location *</label>
                            <select
                                value={locationId}
                                onChange={(e) => setLocationId(e.target.value)}
                                required
                            >
                                <option value="">select location</option>
                                {locationsList.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        #{loc.id} (x: {loc.x}, y: {loc.y}, z: {loc.z})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>eye color *</label>
                            <select
                                value={eyeColor}
                                onChange={(e) => setEyeColor(e.target.value)}
                                required
                            >
                                <option value="">select color</option>
                                {colorsList.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>hair color (optional)</label>
                            <select
                                value={hairColor}
                                onChange={(e) => setHairColor(e.target.value)}
                            >
                                <option value="">(none)</option>
                                {colorsList.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>nationality (optional)</label>
                            <select
                                value={nationality}
                                onChange={(e) => setNationality(e.target.value)}
                            >
                                <option value="">(none)</option>
                                {countriesList.map((country) => (
                                    <option key={country} value={country}>
                                        {country}
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
