import { useState, useEffect, useCallback } from 'react';
import { workerApi, organizationApi, enumApi } from '../api/service';
import { useNotification } from '../context/NotificationContext';
import './OperationsPage.css';

export function OperationsPage({ wsEvent }) {
    const { showNotification } = useNotification();

    const [avgWorkerRating, setAvgWorkerRating] = useState(null);
    const [loadingWorkerRating, setLoadingWorkerRating] = useState(false);

    const [avgOrgRating, setAvgOrgRating] = useState(null);
    const [loadingOrgRating, setLoadingOrgRating] = useState(false);

    const [allStatuses, setAllStatuses] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [statusLessCount, setStatusLessCount] = useState(null);
    const [loadingCount, setLoadingCount] = useState(false);

    const [distinctStatuses, setDistinctStatuses] = useState(null);
    const [loadingDistinct, setLoadingDistinct] = useState(false);

    const [fireWorkerId, setFireWorkerId] = useState('');
    const [fireResult, setFireResult] = useState(null);
    const [loadingFire, setLoadingFire] = useState(false);

    // 6. Индексация зарплаты по ID и коэффициенту
    const [salaryWorkerId, setSalaryWorkerId] = useState('');
    const [salaryCoefficient, setSalaryCoefficient] = useState('2');
    const [salaryResult, setSalaryResult] = useState(null);
    const [loadingSalary, setLoadingSalary] = useState(false);

    useEffect(() => {
        enumApi
            .getStatuses()
            .then((statuses) => {
                const safe = statuses || [];
                setAllStatuses(safe);
                if (safe.length > 0) {
                    setSelectedStatus(safe);
                }
            })
            .catch((error) => {
                showNotification(error.message || 'failed to load statuses enum', 'error');
            });
    }, [showNotification]);

    const fetchAvgWorkerRating = useCallback(async () => {
        setLoadingWorkerRating(true);
        try {
            const value = await workerApi.getAverageRating();
            setAvgWorkerRating(value);
        } catch (error) {
            showNotification(error.message || 'failed to calculate average worker rating', 'error');
        } finally {
            setLoadingWorkerRating(false);
        }
    }, [showNotification]);

    const fetchAvgOrgRating = useCallback(async () => {
        setLoadingOrgRating(true);
        try {
            const value = await organizationApi.getAverageRating();
            setAvgOrgRating(value);
        } catch (error) {
            showNotification(error.message || 'failed to calculate average organization rating', 'error');
        } finally {
            setLoadingOrgRating(false);
        }
    }, [showNotification]);

    const fetchCountStatusLessThan = async (e) => {
        if (e) e.preventDefault();
        if (!selectedStatus) {
            showNotification('please select a status', 'error');
            return;
        }

        setLoadingCount(true);
        try {
            const count = await workerApi.countStatusLessThan(selectedStatus);
            setStatusLessCount(count);
        } catch (error) {
            showNotification(error.message || 'failed to count workers by status', 'error');
        } finally {
            setLoadingCount(false);
        }
    };

    const fetchDistinctStatuses = useCallback(async () => {
        setLoadingDistinct(true);
        try {
            const list = await workerApi.getDistinctStatuses();
            setDistinctStatuses(list || []);
        } catch (error) {
            showNotification(error.message || 'failed to load distinct statuses', 'error');
        } finally {
            setLoadingDistinct(false);
        }
    }, [showNotification]);

    const handleFireWorker = async (e) => {
        e.preventDefault();
        const parsedId = Number(fireWorkerId);
        if (!fireWorkerId || !Number.isInteger(parsedId) || parsedId < 1) {
            showNotification('worker id must be a positive integer', 'error');
            return;
        }

        setLoadingFire(true);
        try {
            const res = await workerApi.fire(parsedId);
            const msg = typeof res === 'string' ? res : `worker #${parsedId} fired`;
            setFireResult(msg);
            showNotification(msg, 'success');
            setFireWorkerId('');
        } catch (error) {
            showNotification(error.message || 'failed to fire worker', 'error');
        } finally {
            setLoadingFire(false);
        }
    };

    const handleIndexSalary = async (e) => {
        e.preventDefault();
        const parsedId = Number(salaryWorkerId);
        const parsedCoeff = Number(salaryCoefficient);

        if (!salaryWorkerId || !Number.isInteger(parsedId) || parsedId < 1) {
            showNotification('worker id must be a positive integer', 'error');
            return;
        }
        if (!salaryCoefficient || !Number.isInteger(parsedCoeff) || parsedCoeff < 1) {
            showNotification('coefficient must be an integer >= 1', 'error');
            return;
        }

        setLoadingSalary(true);
        try {
            const res = await workerApi.indexSalary(parsedId, parsedCoeff);
            const msg = typeof res === 'string' ? res : `salary indexed for worker #${parsedId}`;
            setSalaryResult(msg);
            showNotification(msg, 'success');
            setSalaryWorkerId('');
        } catch (error) {
            showNotification(error.message || 'failed to index salary', 'error');
        } finally {
            setLoadingSalary(false);
        }
    };

    useEffect(() => {
        if (!wsEvent?.timestamp) return;
        if (avgWorkerRating !== null) fetchAvgWorkerRating();
        if (avgOrgRating !== null) fetchAvgOrgRating();
        if (distinctStatuses !== null) fetchDistinctStatuses();
    }, [wsEvent]);

    return (
        <div>
            <h2 className="page-title">special worker operations</h2>

            <div className="operations-grid">
                <div className="operation-card">
                    <div>
                        <h3>average worker rating</h3>
                        <p className="operation-desc">
                            calculate the average of the <strong>rating</strong> across all workers
                        </p>
                    </div>

                    {avgWorkerRating !== null && (
                        <div className="operation-result-box">
                            {Number(avgWorkerRating).toFixed(2)}
                        </div>
                    )}

                    <div className="operation-controls">
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={fetchAvgWorkerRating}
                            disabled={loadingWorkerRating}
                        >
                            {loadingWorkerRating ? 'calculating...' : 'calculate'}
                        </button>
                    </div>
                </div>

                <div className="operation-card">
                    <div>
                        <h3>count status less than</h3>
                        <p className="operation-desc">
                            return the number of workers whose <strong>status</strong> is less than the selected value
                        </p>
                    </div>

                    {statusLessCount !== null && (
                        <div className="operation-result-box">
                            count: {statusLessCount}
                        </div>
                    )}

                    <form className="operation-controls" onSubmit={fetchCountStatusLessThan}>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            {allStatuses.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loadingCount || !selectedStatus}
                        >
                            {loadingCount ? 'counting...' : 'count'}
                        </button>
                    </form>
                </div>

                <div className="operation-card">
                    <div>
                        <h3>distinct worker statuses</h3>
                        <p className="operation-desc">
                            return an array of <strong>unique status values</strong> among all workers
                        </p>
                    </div>

                    {distinctStatuses !== null && (
                        <div className="operation-result-box">
                            {distinctStatuses.length === 0 ? (
                                <span>no statuses in db</span>
                            ) : (
                                <div className="distinct-statuses-list">
                                    {distinctStatuses.map((st) => (
                                        <span key={st} className="distinct-badge">
                      {st}
                    </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="operation-controls">
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={fetchDistinctStatuses}
                            disabled={loadingDistinct}
                        >
                            {loadingDistinct ? 'loading...' : 'get distinct statuses'}
                        </button>
                    </div>
                </div>

                <div className="operation-card">
                    <div>
                        <h3>fire worker by id</h3>
                        <p className="operation-desc">
                            fire a worker with by <strong>id</strong> from his organization
                        </p>
                    </div>

                    {fireResult !== null && (
                        <div className="operation-result-box" style={{ fontSize: '16px' }}>
                            {fireResult}
                        </div>
                    )}

                    <form className="operation-controls" onSubmit={handleFireWorker}>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="worker id"
                            value={fireWorkerId}
                            onChange={(e) => setFireWorkerId(e.target.value)}
                            style={{ width: '150px' }}
                            required
                        />

                        <button
                            type="submit"
                            className="btn-danger"
                            disabled={loadingFire}
                        >
                            {loadingFire ? 'firing...' : 'fire'}
                        </button>
                    </form>
                </div>

                <div className="operation-card">
                    <div>
                        <h3>index worker salary</h3>
                        <p className="operation-desc">
                            multiply a worker's <strong>salary</strong> by integer coefficient ({'>='} 1)
                        </p>
                    </div>

                    {salaryResult !== null && (
                        <div className="operation-result-box" style={{ fontSize: '16px' }}>
                            {salaryResult}
                        </div>
                    )}

                    <form className="operation-controls" onSubmit={handleIndexSalary}>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="worker id"
                            value={salaryWorkerId}
                            onChange={(e) => setSalaryWorkerId(e.target.value)}
                            style={{ width: '140px' }}
                            required
                        />

                        <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="coeff..."
                            value={salaryCoefficient}
                            onChange={(e) => setSalaryCoefficient(e.target.value)}
                            style={{ width: '120px' }}
                            required
                        />

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loadingSalary}
                        >
                            {loadingSalary ? 'indexing...' : 'index'}
                        </button>
                    </form>
                </div>

                <div className="operation-card">
                    <div>
                        <h3>average organization rating</h3>
                        <p className="operation-desc">
                            calculate the average of the <strong>rating</strong> across all organizations
                        </p>
                    </div>

                    {avgOrgRating !== null && (
                        <div className="operation-result-box">
                            {Number(avgOrgRating).toFixed(2)}
                        </div>
                    )}

                    <div className="operation-controls">
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={fetchAvgOrgRating}
                            disabled={loadingOrgRating}
                        >
                            {loadingOrgRating ? 'calculating...' : 'calculate'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
