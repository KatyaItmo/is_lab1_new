import { useState, useEffect, useCallback } from 'react';
import { workerApi } from '../api/service';
import { useNotification } from '../context/NotificationContext';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { WorkerFormModal } from '../components/workers/WorkerFormModal';
import { WorkerDetailsModal } from '../components/workers/WorkerDetailsModal';
import { IndexSalaryModal } from '../components/workers/IndexSalaryModal';
import './DirectoriesPage.css';
import './WorkersPage.css';

export function WorkersPage({ wsEvent }) {
    const { showNotification } = useNotification();

    const [workers, setWorkers] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [filteredValue, setFilteredValue] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isLoading, setIsLoading] = useState(false);

    const [searchId, setSearchId] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [detailsWorker, setDetailsWorker] = useState(null);
    const [firingWorker, setFiringWorker] = useState(null);
    const [indexingWorker, setIndexingWorker] = useState(null);
    const [deletingWorker, setDeletingWorker] = useState(null);
    const [isActionSubmitting, setIsActionSubmitting] = useState(false);

    const fetchWorkers = useCallback(async () => {
        setIsLoading(true);
        try {
            const { items, totalCount: total } = await workerApi.getPaginated({
                filteredValue,
                sortOrder,
                page,
                size,
            });
            setWorkers(items);
            setTotalCount(total);
        } catch (error) {
            showNotification(error.message || 'failed to load workers', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filteredValue, sortOrder, page, size, showNotification]);

    useEffect(() => {
        fetchWorkers();
    }, [fetchWorkers, wsEvent]);

    const handleOpenDetailsById = async (idToFetch) => {
        try {
            const fullWorker = await workerApi.getById(idToFetch);
            setDetailsWorker(fullWorker);
        } catch (error) {
            showNotification(error.message || `worker #${idToFetch} not found`, 'error');
        }
    };

    const handleFindByIdSubmit = (e) => {
        e.preventDefault();
        const parsed = Number(searchId);
        if (!searchId || !Number.isInteger(parsed) || parsed < 1) {
            showNotification('enter a valid positive integer id', 'error');
            return;
        }
        handleOpenDetailsById(parsed);
    };

    const handleCreate = async (dto) => {
        try {
            const res = await workerApi.create(dto);
            showNotification(typeof res === 'string' ? res : 'worker created', 'success');
            await fetchWorkers();
        } catch (error) {
            showNotification(error.message || 'failed to create worker', 'error');
            throw error;
        }
    };

    const handleUpdate = async (dto) => {
        try {
            const res = await workerApi.update(dto);
            showNotification(typeof res === 'string' ? res : 'worker updated', 'success');
            await fetchWorkers();
        } catch (error) {
            showNotification(error.message || 'failed to update worker', 'error');
            throw error;
        }
    };

    const handleConfirmFire = async () => {
        if (!firingWorker) return;
        setIsActionSubmitting(true);
        try {
            const res = await workerApi.fire(firingWorker.id);
            showNotification(typeof res === 'string' ? res : `worker #${firingWorker.id} fired`, 'success');
            setFiringWorker(null);
            await fetchWorkers();
        } catch (error) {
            showNotification(error.message || 'failed to fire worker', 'error');
        } finally {
            setIsActionSubmitting(false);
        }
    };

    const handleIndexSalary = async (workerId, coefficient) => {
        try {
            const res = await workerApi.indexSalary(workerId, coefficient);
            showNotification(typeof res === 'string' ? res : 'salary indexed', 'success');
            await fetchWorkers();
        } catch (error) {
            showNotification(error.message || 'failed to index salary', 'error');
            throw error;
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingWorker) return;
        setIsActionSubmitting(true);
        try {
            await workerApi.delete(deletingWorker.id);
            showNotification(`worker #${deletingWorker.id} deleted`, 'success');
            setDeletingWorker(null);
            await fetchWorkers();
        } catch (error) {
            showNotification(error.message || 'failed to delete worker', 'error');
        } finally {
            setIsActionSubmitting(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / size));

    return (
        <div>
            <h2 className="page-title">create and redact workers</h2>

            <div className="workers-toolbar">
                <div className="toolbar-group">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="filter by name"
                        value={filteredValue}
                        onChange={(e) => {
                            setFilteredValue(e.target.value);
                            setPage(0);
                        }}
                    />

                    <button
                        type="button"
                        onClick={() => {
                            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                            setPage(0);
                        }}
                    >
                        sort by name: {sortOrder === 'asc' ? 'asc' : 'desc'}
                    </button>
                </div>

                <div className="toolbar-group">
                    <form className="find-id-form" onSubmit={handleFindByIdSubmit}>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            className="find-id-input"
                            placeholder="worker id"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                        <button type="submit">find by id</button>
                    </form>

                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        + create worker
                    </button>
                </div>
            </div>

            <div className="table-wrapper">
                {isLoading ? (
                    <p className="empty-table-msg">loading workers...</p>
                ) : workers.length === 0 ? (
                    <p className="empty-table-msg">no workers found</p>
                ) : (
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>id</th>
                            <th>name</th>
                            <th>salary</th>
                            <th>rating</th>
                            <th>position</th>
                            <th>status</th>
                            <th>org id</th>
                            <th>actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {workers.map((w) => {
                            const isFired = w.status === 'FIRED';
                            const hasNoOrg = w.organizationId == null;
                            const isEditDisabled = isFired || hasNoOrg;

                            return (
                                <tr key={w.id}>
                                    <td>#{w.id}</td>
                                    <td>{w.name}</td>
                                    <td>{w.salary}</td>
                                    <td>{w.rating}</td>
                                    <td>{w.position || 'null'}</td>
                                    <td>
                      <span className={`status-badge ${isFired ? 'fired' : ''}`}>
                        {w.status}
                      </span>
                                    </td>
                                    <td>{hasNoOrg ? 'null' : `#${w.organizationId}`}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                type="button"
                                                className="btn-sm"
                                                onClick={() => handleOpenDetailsById(w.id)}
                                            >
                                                info
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-sm"
                                                disabled={isEditDisabled}
                                                title={
                                                    hasNoOrg
                                                        ? 'cannot edit worker without organization'
                                                        : isFired
                                                            ? 'cannot edit fired worker'
                                                            : 'edit worker'
                                                }
                                                onClick={() => setEditingWorker(w)}
                                            >
                                                edit
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-sm"
                                                disabled={isFired}
                                                onClick={() => setFiringWorker(w)}
                                            >
                                                fire
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-sm"
                                                disabled={isEditDisabled}
                                                title={
                                                    hasNoOrg
                                                        ? 'cannot index salary for worker without organization'
                                                        : isFired
                                                            ? 'cannot index salary for fired worker'
                                                            : 'index salary'
                                                }
                                                onClick={() => setIndexingWorker(w)}
                                            >
                                                salary
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-sm btn-danger"
                                                onClick={() => setDeletingWorker(w)}
                                            >
                                                delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="pagination-bar">
                <div className="pagination-info">
                    total workers: {totalCount} | page {page + 1} of {totalPages}
                </div>

                <div className="pagination-controls">
                    <label>
                        rows:{' '}
                        <select
                            className="page-size-select"
                            value={size}
                            onChange={(e) => {
                                setSize(Number(e.target.value));
                                setPage(0);
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </label>

                    <button
                        type="button"
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                        {'<- prev'}
                    </button>

                    <button
                        type="button"
                        disabled={page + 1 >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        {'next ->'}
                    </button>
                </div>
            </div>

            <WorkerFormModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreate}
            />

            <WorkerFormModal
                isOpen={Boolean(editingWorker)}
                onClose={() => setEditingWorker(null)}
                initialWorker={editingWorker}
                onSubmit={handleUpdate}
            />

            <WorkerDetailsModal
                isOpen={Boolean(detailsWorker)}
                onClose={() => setDetailsWorker(null)}
                worker={detailsWorker}
            />

            <IndexSalaryModal
                isOpen={Boolean(indexingWorker)}
                onClose={() => setIndexingWorker(null)}
                worker={indexingWorker}
                onSubmit={handleIndexSalary}
            />

            <ConfirmActionModal
                isOpen={Boolean(firingWorker)}
                onClose={() => setFiringWorker(null)}
                onConfirm={handleConfirmFire}
                title={`fire worker: #${firingWorker?.id}`}
                message={`are you sure you want to fire ${firingWorker?.name} (#${firingWorker?.id})?`}
                confirmText="fire"
                isDanger={true}
                isSubmitting={isActionSubmitting}
            />

            <ConfirmActionModal
                isOpen={Boolean(deletingWorker)}
                onClose={() => setDeletingWorker(null)}
                onConfirm={handleConfirmDelete}
                title={`delete worker: #${deletingWorker?.id}`}
                message={`are you sure you want to delete ${deletingWorker?.name} (#${deletingWorker?.id})?`}
                confirmText="delete"
                isDanger={true}
                isSubmitting={isActionSubmitting}
            />
        </div>
    );
}
