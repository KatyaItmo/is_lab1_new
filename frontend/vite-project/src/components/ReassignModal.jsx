import { useState, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { useNotification } from '../context/NotificationContext';
import './ReassignModal.css';

function isNullableDependency(deletedEntityType, depEntityType) {
    if (deletedEntityType === 'location' && depEntityType === 'ADDRESS') return true;
    if (deletedEntityType === 'address' && depEntityType === 'ORGANIZATION_OFFICIAL_ADDRESS') return true;
    if (deletedEntityType === 'organization' && depEntityType === 'WORKER') return true;
    return false;
}

const ENTITY_TYPE_LABELS = {
    WORKER: 'workers',
    ORGANIZATION: 'organizations',
    ORGANIZATION_OFFICIAL_ADDRESS: 'organizations (official address)',
    ORGANIZATION_POSTAL_ADDRESS: 'organizations (postal address)',
    PERSON: 'persons',
    ADDRESS: 'addresses',
};

function formatReplacementOption(entityType, item) {
    switch (entityType) {
        case 'coordinates':
            return `#${item.id} (x: ${item.x}, y: ${item.y})`;
        case 'location':
            return `#${item.id} (x: ${item.x}, y: ${item.y}, z: ${item.z})`;
        case 'address':
            return `#${item.id} (${item.street})`;
        case 'person':
            return `#${item.id} (passport: ${item.passportId})`;
        case 'organization':
            return `organization #${item.id}`;
        default:
            return `#${item.id}`;
    }
}

export function ReassignModal({
                                  isOpen,
                                  onClose,
                                  entityType,
                                  targetId,
                                  api,
                                  onSuccess,
                              }) {
    const { showNotification } = useNotification();

    const [dependencies, setDependencies] = useState([]);
    const [availableOptions, setAvailableOptions] = useState([]);
    const [selections, setSelections] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadConflictData = useCallback(async () => {
        if (!targetId || !api) return;

        setIsLoading(true);
        try {
            const [deps, exceptList] = await Promise.all([
                api.getDependencies(targetId),
                api.getExcept(targetId),
            ]);

            const safeDeps = deps || [];
            const safeOptions = exceptList || [];

            setDependencies(safeDeps);
            setAvailableOptions(safeOptions);

            const initialSelections = {};
            safeDeps.forEach((dep) => {
                const key = `${dep.entityType}_${dep.entityId}`;
                const nullable = isNullableDependency(entityType, dep.entityType);

                if (safeOptions.length > 0) {
                    initialSelections[key] = String(safeOptions[0].id);
                } else if (nullable) {
                    initialSelections[key] = 'null';
                } else {
                    initialSelections[key] = '';
                }
            });

            setSelections(initialSelections);
        } catch (error) {
            showNotification(error.message || 'failed to load dependencies', 'error');
            onClose();
        } finally {
            setIsLoading(false);
        }
    }, [targetId, api, entityType, showNotification, onClose]);

    useEffect(() => {
        if (isOpen) {
            loadConflictData().then(r => {});
        }
    }, [isOpen, loadConflictData]);

    const handleSelectionChange = (key, value) => {
        setSelections((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updates = [];
        for (const dep of dependencies) {
            const key = `${dep.entityType}_${dep.entityId}`;
            const chosen = selections[key];

            if (!chosen) {
                showNotification(
                    `please select a replacement for ${dep.entityType.toLowerCase()} #${dep.entityId}`,
                    'error'
                );
                return;
            }

            updates.push({
                entityType: dep.entityType,
                entityId: dep.entityId,
                replacementId: chosen === 'null' ? null : Number(chosen),
            });
        }

        setIsSubmitting(true);
        try {
            await api.reassignAndDelete(targetId, updates);
            showNotification(`${entityType} #${targetId} reassigned and deleted`, 'success');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            if (error.status === 409) {
                showNotification('conflict still exists (new references appeared), reloading list...', 'error');
                await loadConflictData();
            } else {
                showNotification(error.message || 'failed to reassign and delete', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const groupedDependencies = dependencies.reduce((acc, dep) => {
        if (!acc[dep.entityType]) {
            acc[dep.entityType] = [];
        }
        acc[dep.entityType].push(dep);
        return acc;
    }, {});

    const modalProps = {
        isOpen,
        onClose,
        title: `resolve conflict: delete ${entityType} #${targetId}`,
        maxWidth: '720px',
    };

    return (
        <Modal {...modalProps}>
            {isLoading ? (
                <p>loading dependent objects...</p>
            ) : (
                <form className="modal-form" onSubmit={handleSubmit}>
                    <p className="reassign-hint">
                        cannot delete <strong>{entityType} #{targetId}</strong> because it is referenced by the objects below.
                        choose a replacement for each item:
                    </p>

                    <div className="reassign-groups">
                        {Object.entries(groupedDependencies).map(([depType, items]) => {
                            const nullable = isNullableDependency(entityType, depType);

                            return (
                                <div key={depType} className="reassign-group-block">
                                    <h4 className="reassign-group-title">
                                        {ENTITY_TYPE_LABELS[depType] || depType} ({items.length})
                                    </h4>

                                    <table className="reassign-table">
                                        <thead>
                                        <tr>
                                            <th>dependent id</th>
                                            <th>new {entityType}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {items.map((dep) => {
                                            const key = `${dep.entityType}_${dep.entityId}`;
                                            return (
                                                <tr key={key}>
                                                    <td className="dep-id-cell">#{dep.entityId}</td>
                                                    <td>
                                                        <select
                                                            className="reassign-select"
                                                            value={selections[key] ?? ''}
                                                            onChange={(e) => handleSelectionChange(key, e.target.value)}
                                                            disabled={isSubmitting}
                                                        >
                                                            {!nullable && availableOptions.length === 0 && (
                                                                <option value="">no other {entityType} available</option>
                                                            )}
                                                            {nullable && (
                                                                <option value="null">(none)</option>
                                                            )}
                                                            {availableOptions.map((opt) => (
                                                                <option key={opt.id} value={opt.id}>
                                                                    {formatReplacementOption(entityType, opt)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} disabled={isSubmitting}>
                            cancel
                        </button>
                        <button type="submit" className="btn-danger" disabled={isSubmitting}>
                            {isSubmitting ? 'processing...' : 'reassign & delete'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
