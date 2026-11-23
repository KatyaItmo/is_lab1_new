import { useState } from "react";

function SearchPage({ showMessage }) {
    const [workerId, setWorkerId] = useState('');
    const [worker, setWorker] = useState(null);

    const handleIdChange = (e) => {
        const value = e.target.value;
        if (/^[1-9]?\d*$/.test(value)) {
            const numValue = Number(value);
            if (numValue <= 2147483647 && numValue >= -2147483648) {
                setWorkerId(value);
            }
        }
    }

    const handleSearch = async () => {
        if (!workerId) {
            showMessage('введите ID', 'warn');
            return;
        }

        try {
            const response = await fetch(`/api/worker/${workerId.trim()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setWorker(data);
            } else if (response.status === 404) {
                setWorker(null);
                showMessage(response.text(), 'error');
            } else {
                setWorker(null);
                showMessage('ошибка при поиске Worker', 'error');
            }
        } catch (err) {
            showMessage('ошибка подключения к серверу', 'error');
        }
    };

    return (
        <div className="interior-container">
            <h2>Поиск Worker по ID</h2>
            <div className="panel">
                <form className="sub-panel-form">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="введите ID"
                        value={workerId}
                        onChange={(e) => handleIdChange(e)}
                    />
                    <button type="button" className="search-button" onClick={handleSearch}>найти</button>
                </form>
            </div>

            {worker && (
                <div className="object-card">
                    <h3>Worker #{worker.id}</h3>

                    <div>
                        <div>
                            <h4>основная информация</h4>
                            <p><b>зарплата:</b> {worker.salary}</p>
                            <p><b>рейтинг:</b> {worker.rating}</p>
                            <p><b>статус:</b> {worker.status}</p>
                            <p><b>должность:</b> {worker.position || 'не указана'}</p>
                            <p><b>дата начала:</b> {worker.startDate}</p>
                            <p><b>дата создания записи:</b> {worker.creationTime}</p>
                        </div>

                        <div>
                            <h4>координаты (ID: {worker.coordinates.id})</h4>
                            <p><b>X:</b> {worker.coordinates.x}</p>
                            <p><b>Y:</b> {worker.coordinates.y}</p>
                        </div>
                    </div>

                    <div>
                        <h4>организация</h4>
                        {worker.organization ? (
                            <div>
                                <p><b>ID:</b> {worker.organization.id}</p>
                                <p><b>тип:</b> {worker.organization.type || 'не указан'}</p>
                                <p><b>годовой оборот:</b> {worker.organization.annualTurnover}</p>
                                <p><b>кол-во сотрудников:</b> {worker.organization.employeesCount || '-'}</p>
                                <p><b>рейтинг:</b> {worker.organization.rating}</p>

                                {worker.organization.officialAddress ? (
                                    <div>
                                        <p><b>официальный адрес:</b></p>
                                        <p>улица: {worker.organization.officialAddress.street || '-'}</p>

                                        {worker.organization.officialAddress.town ? (
                                            <p>город (ID: {worker.organization.officialAddress.town.id}): x={worker.organization.officialAddress.town.x}, y={worker.organization.officialAddress.town.y}, z={worker.organization.officialAddress.town.z}</p>
                                        ) : (
                                            <p>город не указан</p>
                                        )}

                                    </div>
                                ) : (
                                    <p>официальный адрес не указан</p>
                                )}

                                <div>
                                    <p><b>почтовый адрес:</b></p>
                                    <p>улица: {worker.organization.postalAddress.street || '-'}</p>

                                    {worker.organization.postalAddress.town ? (
                                        <p>город (ID: {worker.organization.postalAddress.town.id}): x={worker.organization.postalAddress.town.x}, y={worker.organization.postalAddress.town.y}, z={worker.organization.postalAddress.town.z}</p>
                                    ) : (
                                        <p>город не указан</p>
                                    )}

                                </div>
                            </div>
                        ) : (
                            <p>организация не привязана</p>
                        )}
                    </div>

                    <div>
                        <h4>персона (ID: {worker.person.id})</h4>
                        <div>
                            <p><b>паспорт (passportID):</b> {worker.person.passportID}</p>
                            <p><b>день рождения:</b> {worker.person.birthday}</p>
                            <p><b>рост:</b> {worker.person.height}</p>
                            <p><b>цвет глаз:</b> {worker.person.eyeColor}</p>
                            <p><b>цвет волос:</b> {worker.person.hairColor || 'не указан'}</p>
                            <p><b>национальность:</b> {worker.person.nationality || 'не указана'}</p>

                            <div>
                                <p><b>локация (ID: {worker.person.location.id}):</b></p>
                                <p>X: {worker.person.location.x}, Y: {worker.person.location.y}, Z: {worker.person.location.z}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchPage;