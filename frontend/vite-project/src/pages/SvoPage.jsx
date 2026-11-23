import { useEffect, useState } from "react";

function SpecialOperationsPage({ showMessage }) {
    const [averageRating, setAverageRating] = useState(null);

    const [statusForCount, setStatusForCount] = useState('');
    const [statusCountResult, setStatusCountResult] = useState(null);

    const [distinctStatuses, setDistinctStatuses] = useState([]);

    const [fireWorkerId, setFireWorkerId] = useState('');

    const [salaryWorkerId, setSalaryWorkerId] = useState('');
    const [salaryCoefficient, setSalaryCoefficient] = useState('');

    const [availableStatuses, setAvailableStatuses] = useState(['FIRED', 'REGULAR', 'PROBATION']);

    useEffect(() => {
        fetch('/api/worker/statuses', {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setAvailableStatuses(data);
                }
            })
            .catch(() => {
            });
    }, []);

    const handleGetAverageRating = async () => {
        try {
            const response = await fetch('/api/worker/average-rating', {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setAverageRating(data);
            } else {
                showMessage('не удалось рассчитать средний рейтинг', 'error');
            }
        } catch (err) {
            showMessage('ошибка подключения к серверу', 'error');
        }
    };

    const handleCountStatusLessThan = async () => {
        if (!statusForCount) {
            showMessage('выберите статус', 'warn');
            return;
        }

        try {
            const response = await fetch(`/api/worker/count-status-less-than?status=${encodeURIComponent(statusForCount)}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const count = await response.json();
                setStatusCountResult(count);
            } else {
                const errText = await response.text();
                showMessage(errText || 'ошибка при подсчете статусов', 'error');
            }
        } catch (err) {
            showMessage('ошибка подключения к серверу', 'error');
        }
    };

    const handleGetDistinctStatuses = async () => {
        try {
            const response = await fetch('/api/worker/statuses', {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const statuses = await response.json();
                setDistinctStatuses(statuses);
            } else {
                showMessage('не удалось получить статусы', 'error');
            }
        } catch (err) {
            showMessage('ошибка подключения к серверу', 'error');
        }
    };

    const handleFireWorker = async () => {
        if (!fireWorkerId) {
            showMessage('введите ID сотрудника для увольнения', 'warn');
            return;
        }

        try {
            const response = await fetch(`/api/worker/${fireWorkerId.trim()}/fire`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (response.ok) {
                const text = await response.text();
                showMessage(text, 'text');
                setFireWorkerId('');
            } else {
                const errText = await response.text();
                showMessage(errText || 'не удалось уволить сотрудника', 'error');
            }
        } catch (err) {
            showMessage('ошибка подключения к серверу', 'error');
        }
    };

    const handleIndexSalary = async () => {
        if (!salaryWorkerId || !salaryCoefficient) {
            showMessage('заполните ID сотрудника и коэффициент', 'warn');
            return;
        }

        try {
            const params = new URLSearchParams({ coefficient: salaryCoefficient.trim() });
            const response = await fetch(`/api/worker/${salaryWorkerId.trim()}/salary?${params.toString()}`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (response.ok) {
                const text = await response.text();
                showMessage(text, 'text');
                setSalaryWorkerId('');
                setSalaryCoefficient('');
            } else {
                const errText = await response.text();
                showMessage(errText || 'не удалось проиндексировать зарплату', 'error');
            }
        } catch (err) {
            showMessage('ошибка подключения к серверу', 'error');
        }
    };

    const handleCoefficientChange = (e) => {
        const value = e.target.value;
        if (/^[1-9]?\d{0,2}$/.test(value)) {
            const numValue = Number(value);
            setSalaryCoefficient(value);
        }
    }

    const handleFiredWorkerIdChange = (e) => {
        const value = e.target.value;
        if (/^[1-9]?\d*$/.test(value)) {
            const numValue = Number(value);
            if (numValue <= 2147483647 && numValue >= -2147483648) {
                setFireWorkerId(value);
            }
        }
    }

    const handleSalaryWorkerIdChange = (e) => {
        const value = e.target.value;
        if (/^[1-9]?\d*$/.test(value)) {
            const numValue = Number(value);
            if (numValue <= 2147483647 && numValue >= -2147483648) {
                setSalaryWorkerId(value);
            }
        }
    }

    return (
        <div className="interior-container">
            <h2>специальные вычислительные операции</h2>

            <div>
                <div className="object-card">
                    <h3>средний рейтинг (average rating)</h3>
                    <p>рассчитать среднее значение поля rating для всех объектов</p>
                    <button type="button" className="object-button" onClick={handleGetAverageRating}>
                        рассчитать
                    </button>
                    {averageRating !== null && (
                        <p><b>результат:</b> {averageRating}</p>
                    )}
                </div>

                <div className="object-card">
                    <h3>подсчет по статусу</h3>
                    <p>количество объектов со статусом меньше заданного</p>
                    <form className="sub-panel-form">
                        <select
                            value={statusForCount}
                            onChange={(e) => setStatusForCount(e.target.value)}
                            className="sort-select"
                        >
                            <option value="">(выберите статус)</option>
                            {availableStatuses.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <button type="button" className="object-button" onClick={handleCountStatusLessThan}>посчитать</button>
                    </form>
                    {statusCountResult !== null && (
                        <p><b>количество:</b> {statusCountResult}</p>
                    )}
                </div>

                <div className="object-card">
                    <h3>уникальные статусы</h3>
                    <p>вернуть массив уникальных значений поля status</p>
                    <button type="button" className="object-button" onClick={handleGetDistinctStatuses}>
                        получить список
                    </button>
                    {distinctStatuses.length > 0 && (
                        <ul>
                            {distinctStatuses.map((st, idx) => (
                                <li key={idx}><b>{st}</b></li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="object-card">
                    <h3>увольнение сотрудника</h3>
                    <p>изменить статус сотрудника с заданным ID на FIRED</p>
                    <form>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="ID сотрудника"
                            value={fireWorkerId}
                            onChange={(e) => handleFiredWorkerIdChange(e)}
                        />
                        <button type="button" className="object-button" onClick={handleFireWorker}>уволить</button>
                    </form>
                </div>

                <div className="object-card">
                    <h3>индексация заработной платы</h3>
                    <p>проиндексировать зарплату указанному сотруднику на заданный коэффициент</p>
                    <form>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="ID сотрудника"
                            value={salaryWorkerId}
                            onChange={(e) => handleSalaryWorkerIdChange(e)}
                        />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="коэффициент (от 1 до 999)"
                            value={salaryCoefficient}
                            onChange={(e) => handleCoefficientChange(e)}
                        />
                        <button type="button" className="object-button" onClick={handleIndexSalary}> проиндексировать</button>
                    </form>
                </div>

            </div>
        </div>
    );
}

export default SpecialOperationsPage;