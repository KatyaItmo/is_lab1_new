import {useEffect, useState} from "react";

function MainPage({ showMessage }) {
    const [workers, setWorkers] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [filteredValue, setFilteredValue] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [totalCount, setTotalCount] = useState(0);

    const getWorkers = async () => {
        try {
            const params = new URLSearchParams({
                filteredValue: filteredValue.trim(),
                page: String(page),
                size: String(size),
                sortOrder: sortOrder
            });

            const response = await fetch(`/api/worker/paginated?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setWorkers(data);

                const total = response.headers.get('total-count');
                if (total) {
                    setTotalCount(Number(total));
                }
            } else {
                showMessage('не удалось загрузить список workers', 'error');
            }
        } catch (err) {
            showMessage('ошибка подключения к серверу', 'error');
        }
    }

    useEffect(() => {
        getWorkers().then(r => {});
    }, [page, size, sortOrder]);

    const handleSearch = async () => {
        setPage(0);
        await getWorkers();
    };

    const totalPages = Math.ceil(totalCount / size) || 1;


    const handleFilteredValue = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Zа-яА-ЯёЁ\s-]*$/.test(value)) {
            setFilteredValue(value);
        }
    }

    return (
        <div className="interior-container">
            <h2>список всех объектов Worker</h2>

            <div className="panel">
                <div className="sub-panel">
                    <form className="sub-panel-form">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="фильтр по name"
                            value={filteredValue}
                            onChange={(e) => handleFilteredValue(e)}
                        />
                        <button type="button" className="search-button" onClick={handleSearch}>найти</button>
                    </form>
                </div>

                <div className="sub-panel">
                    <form className="sub-panel-form">
                        <label className="sort-label">сортировка по name:</label>
                        <select
                            value={sortOrder}
                            onChange={(e) => {
                                setSortOrder(e.target.value);
                                setPage(0);
                            }}
                            className="sort-select"
                        >
                            <option value="asc">по возрастанию</option>
                            <option value="desc">по убыванию</option>
                        </select>
                        <button type="button" className="search-button" onClick={handleSearch}>найти</button>
                    </form>
                </div>
            </div>

            {workers.length === 0 && (
                <p className="no-object-message">список workers пустой</p>
            )}

            <div className="table-container">
                {workers.length > 0 && (
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>name</th>
                            <th>coordinates ID</th>
                            <th>creation time</th>
                            <th>organization ID</th>
                            <th>salary</th>
                            <th>rating</th>
                            <th>start date</th>
                            <th>position</th>
                            <th>status</th>
                            <th>person ID</th>
                        </tr>
                        </thead>
                        <tbody>
                        {workers.map((w) => (
                            <tr key={w.id}>
                                <td>{w.id}</td>
                                <td>{w.name}</td>
                                <td>{w.coordinatesId}</td>
                                <td>{w.creationTime}</td>
                                <td>{w.organizationId}</td>
                                <td>{w.salary}</td>
                                <td>{w.rating}</td>
                                <td>{w.startDate}</td>
                                <td>{w.position}</td>
                                <td>{w.status}</td>
                                <td>{w.personId}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                <div className="panel">
                    <button
                        className="page-button"
                        disabled={page === 0}
                        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    >
                        назад
                    </button>

                    <span>страница {page + 1} из {totalPages} (всего записей: {totalCount})</span>

                    <button
                        className="page-button"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(prev => prev + 1)}
                    >
                        вперед
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MainPage;