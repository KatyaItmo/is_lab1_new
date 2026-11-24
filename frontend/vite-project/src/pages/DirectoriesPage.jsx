import { useState, useEffect, useCallback } from 'react';
import {
    coordinatesApi,
    locationApi,
    addressApi,
    personApi,
    organizationApi,
} from '../api/service';
import { useNotification } from '../context/NotificationContext';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { ReassignModal } from '../components/ReassignModal';
import {
    CreateCoordinatesModal,
    CreateLocationModal,
} from '../components/directories/SimpleEntityModals';
import { AddressFormModal } from '../components/directories/AddressFormModal';
import { PersonFormModal } from '../components/directories/PersonFormModal';
import { OrganizationFormModal } from '../components/directories/OrganizationFormModal';
import './DirectoriesPage.css';

const ENTITY_CONFIG = {
    coordinates: { label: 'coordinates', api: coordinatesApi, canEdit: false },
    location: { label: 'locations', api: locationApi, canEdit: false },
    address: { label: 'addresses', api: addressApi, canEdit: true },
    person: { label: 'persons', api: personApi, canEdit: true },
    organization: { label: 'organizations', api: organizationApi, canEdit: true },
};

export function DirectoriesPage({ wsEvent }) {
    const { showNotification } = useNotification();

    const [activeEntity, setActiveEntity] = useState('coordinates');
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [conflictTargetId, setConflictTargetId] = useState(null);

    const currentConfig = ENTITY_CONFIG[activeEntity];

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await currentConfig.api.getAll();
            setItems(data || []);
        } catch (error) {
            showNotification(error.message || `failed to load ${currentConfig.label}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [currentConfig, showNotification]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems, wsEvent]);

    const handleCreate = async (dto) => {
        try {
            const res = await currentConfig.api.create(dto);
            showNotification(typeof res === 'string' ? res : `${activeEntity} created`, 'success');
            await fetchItems();
        } catch (error) {
            showNotification(error.message || 'creation failed', 'error');
            throw error;
        }
    };

    const handleUpdate = async (dto) => {
        try {
            const res = await currentConfig.api.update(dto);
            showNotification(typeof res === 'string' ? res : `${activeEntity} updated`, 'success');
            await fetchItems();
        } catch (error) {
            showNotification(error.message || 'update failed', 'error');
            throw error;
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingItem) return;

        const targetId = deletingItem.id;
        setIsDeleting(true);
        try {
            await currentConfig.api.delete(targetId);
            showNotification(`${activeEntity} #${targetId} deleted`, 'success');
            setDeletingItem(null);
            await fetchItems();
        } catch (error) {
            setDeletingItem(null);
            if (error.status === 409) {
                setConflictTargetId(targetId);
            } else {
                showNotification(error.message || 'delete failed', 'error');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (val) => {
        if (!val) return '—';
        try {
            return new Date(val).toLocaleDateString();
        } catch {
            return String(val);
        }
    };

    const renderTableHeaders = () => {
        switch (activeEntity) {
            case 'coordinates':
                return (
                    <tr>
                        <th>id</th>
                        <th>x</th>
                        <th>y</th>
                        <th>actions</th>
                    </tr>
                );
            case 'location':
                return (
                    <tr>
                        <th>id</th>
                        <th>x</th>
                        <th>y</th>
                        <th>z</th>
                        <th>actions</th>
                    </tr>
                );
            case 'address':
                return (
                    <tr>
                        <th>id</th>
                        <th>street</th>
                        <th>town id</th>
                        <th>actions</th>
                    </tr>
                );
            case 'person':
                return (
                    <tr>
                        <th>id</th>
                        <th>passport id</th>
                        <th>eye color</th>
                        <th>hair color</th>
                        <th>location id</th>
                        <th>birthday</th>
                        <th>height</th>
                        <th>nationality</th>
                        <th>actions</th>
                    </tr>
                );
            case 'organization':
                return (
                    <tr>
                        <th>id</th>
                        <th>type</th>
                        <th>annual turnover</th>
                        <th>employees count</th>
                        <th>rating</th>
                        <th>postal addr id</th>
                        <th>official addr id</th>
                        <th>actions</th>
                    </tr>
                );
            default:
                return null;
        }
    };

    const renderTableCells = (item) => {
        switch (activeEntity) {
            case 'coordinates':
                return (
                    <>
                        <td>#{item.id}</td>
                        <td>{item.x}</td>
                        <td>{item.y}</td>
                    </>
                );
            case 'location':
                return (
                    <>
                        <td>#{item.id}</td>
                        <td>{item.x}</td>
                        <td>{item.y}</td>
                        <td>{item.z}</td>
                    </>
                );
            case 'address':
                return (
                    <>
                        <td>#{item.id}</td>
                        <td>{item.street}</td>
                        <td>{item.townId != null ? `#${item.townId}` : 'null'}</td>
                    </>
                );
            case 'person':
                return (
                    <>
                        <td>#{item.id}</td>
                        <td>{item.passportId}</td>
                        <td>{item.eyeColor}</td>
                        <td>{item.hairColor || 'null'}</td>
                        <td>#{item.locationId}</td>
                        <td>{formatDate(item.birthday)}</td>
                        <td>{item.height}</td>
                        <td>{item.nationality || 'null'}</td>
                    </>
                );
            case 'organization':
                return (
                    <>
                        <td>#{item.id}</td>
                        <td>{item.type || 'null'}</td>
                        <td>{item.annualTurnover}</td>
                        <td>{item.employeesCount ?? 'null'}</td>
                        <td>{item.rating}</td>
                        <td>#{item.postalAddressId}</td>
                        <td>{item.officialAddressId != null ? `#${item.officialAddressId}` : 'null'}</td>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <h2 className="page-title">create and redact {currentConfig.label}</h2>

            <div className="subtabs-bar">
                <div className="subtabs-list">
                    {Object.entries(ENTITY_CONFIG).map(([key, cfg]) => (
                        <button
                            key={key}
                            type="button"
                            className={`subtab-btn ${activeEntity === key ? 'active' : ''}`}
                            onClick={() => setActiveEntity(key)}
                        >
                            {cfg.label}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setIsCreateOpen(true)}
                >
                    + create {activeEntity}
                </button>
            </div>

            <div className="table-wrapper">
                {isLoading ? (
                    <p className="empty-table-msg">loading {currentConfig.label}...</p>
                ) : items.length === 0 ? (
                    <p className="empty-table-msg">no {currentConfig.label} found</p>
                ) : (
                    <table className="data-table">
                        <thead>{renderTableHeaders()}</thead>
                        <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                {renderTableCells(item)}
                                <td>
                                    <div className="table-actions">
                                        {currentConfig.canEdit && (
                                            <button
                                                type="button"
                                                className="btn-sm"
                                                onClick={() => setEditingItem(item)}
                                            >
                                                edit
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="btn-sm btn-danger"
                                            onClick={() => setDeletingItem(item)}
                                        >
                                            delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {activeEntity === 'coordinates' && (
                <CreateCoordinatesModal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onSubmit={handleCreate}
                />
            )}
            {activeEntity === 'location' && (
                <CreateLocationModal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onSubmit={handleCreate}
                />
            )}
            {activeEntity === 'address' && (
                <AddressFormModal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onSubmit={handleCreate}
                />
            )}
            {activeEntity === 'person' && (
                <PersonFormModal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onSubmit={handleCreate}
                />
            )}
            {activeEntity === 'organization' && (
                <OrganizationFormModal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onSubmit={handleCreate}
                />
            )}

            {activeEntity === 'address' && (
                <AddressFormModal
                    isOpen={Boolean(editingItem)}
                    onClose={() => setEditingItem(null)}
                    initialAddress={editingItem}
                    onSubmit={handleUpdate}
                />
            )}
            {activeEntity === 'person' && (
                <PersonFormModal
                    isOpen={Boolean(editingItem)}
                    onClose={() => setEditingItem(null)}
                    initialPerson={editingItem}
                    onSubmit={handleUpdate}
                />
            )}
            {activeEntity === 'organization' && (
                <OrganizationFormModal
                    isOpen={Boolean(editingItem)}
                    onClose={() => setEditingItem(null)}
                    initialOrganization={editingItem}
                    onSubmit={handleUpdate}
                />
            )}

            <ConfirmActionModal
                isOpen={Boolean(deletingItem)}
                onClose={() => setDeletingItem(null)}
                onConfirm={handleConfirmDelete}
                title={`delete ${activeEntity}: #${deletingItem?.id}`}
                message={`are you sure you want to delete ${activeEntity} #${deletingItem?.id}?`}
                confirmText="delete"
                isDanger={true}
                isSubmitting={isDeleting}
            />

            <ReassignModal
                isOpen={conflictTargetId !== null}
                onClose={() => setConflictTargetId(null)}
                entityType={activeEntity}
                targetId={conflictTargetId}
                api={currentConfig.api}
                onSuccess={fetchItems}
            />
        </div>
    );
}
