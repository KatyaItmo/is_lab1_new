import {useEffect, useState} from "react";
import DateInput from "./DateInput.jsx";

function NewWorker({ showMessage }) {
    const [name, setName] = useState('');
    const [coordinatesId, setCoordinatesId] = useState('');
    const [organizationId, setOrganizationId] = useState('');
    const [salary, setSalary] = useState('');
    const [rating, setRating] = useState('');
    const [startDate, setStartDate] = useState('');
    const [position, setPosition] = useState('');
    const [status, setStatus] = useState('');
    const [personId, setPersonId] = useState('');

    const [coordinatesList, setCoordinatesList] = useState([]);
    const [organizationsList, setOrganizationsList] = useState([]);
    const [personsList, setPersonsList] = useState([]);
    const [positions, setPositions] = useState([]);
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        fetch('/api/coordinates')
            .then(res => res.json())
            .then(data => setCoordinatesList(data))
            .catch(err => showMessage('не удалось загрузить список coordinates', 'error'));

        fetch('/api/organization')
            .then(res => res.json())
            .then(data => setOrganizationsList(data))
            .catch(err => showMessage('не удалось загрузить список organizations', 'error'));

        fetch('/api/person')
            .then(res => res.json())
            .then(data => setPersonsList(data))
            .catch(err => showMessage('не удалось загрузить список persons', 'error'));

        fetch('/api/enum/position')
            .then(res => res.json())
            .then(data => setPositions(data))
            .catch(err => showMessage('не удалось загрузить список positions', 'error'));

        fetch('/api/enum/status')
            .then(res => res.json())
            .then(data => setStatuses(data))
            .catch(err => showMessage('не удалось загрузить список statuses', 'error'));
    }, []);

    const handleNameChange = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Zа-яА-ЯёЁ\s-]*$/.test(value)) {
            setName(value);
        }
    }

    const handleSalaryChange = (e) => {
        const value = e.target.value;
        if (/^[1-9]?\d*$/.test(value)) {
            const numValue = Number(value);
            if (numValue <= 2147483647 && numValue >= -2147483648) {
                setSalary(value);
            }
        }
    }

    const handleRatingChange = (e) => {
        const value = e.target.value;
        if (/^[1-9]?\d*([.,]\d{0,3})?$/.test(value)) {
            setRating(value);
        }
    }

    const isValidDate = (dateStr) => {
        const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        const match = dateStr.match(regex);
        if (!match) return false;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;

        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day;
    }

    const convertDataToBackend = (dateStr) => {
        const parts = dateStr.split('.');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${year}-${month}-${day}T00:00:00Z`;
    }

    const submitObject = async () => {
        if (!name.trim() || coordinatesId === '' || salary === '' || rating === '' || startDate === '' || status === '' || personId === '') {
            showMessage('заполните все обязательные поля!', 'warn');
            return;
        }

        if (!isValidDate(startDate)) {
            showMessage('введена некорректная дата начала работы (startDate)!', 'warn');
            return;
        }

        const worker = {
            name: name.trim(),
            coordinatesId: coordinatesId,
            organizationId: organizationId ? organizationId : null,
            salary: Number(salary),
            rating: Number(rating),
            startDate: convertDataToBackend(startDate),
            position: position ? position : null,
            status: status,
            personId: personId
        }

        try {
            const response = await fetch('/api/worker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(worker)
            })

            if (response.status === 201) {
                showMessage(await response.text(), 'text');
                setName('');
                setCoordinatesId('');
                setOrganizationId('');
                setSalary('');
                setRating('');
                setStartDate('');
                setPosition('');
                setStatus('');
                setPersonId('');
            } else {
                showMessage(await response.text(), 'error');
            }
        } catch (err) {
            showMessage('не удалось отправить данные на сервер', 'error');
        }
    }

    return (
        <div className="object-card">
            <h3>новый Worker</h3>
            <p>обязательные поля: *</p>

            <form className="object-form">
                <div className="object-item">
                    <label className="object-item-label">* name</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите имя"
                        value={name}
                        onChange={(e) => handleNameChange(e)}
                    />
                </div>

                <div className="object-item">
                    <label className="object-item-label">* coordinates</label>
                    <select
                        value={coordinatesId}
                        onChange={(e) => setCoordinatesId(e.target.value)}
                    >
                        <option value=''>(не выбрано)</option>
                        {coordinatesList.map((c) => (
                            <option key={c.id} value={c.id}>
                                id: {c.id} (x: {c.x}, y: {c.y})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="object-item">
                    <label className="object-item-label">organization</label>
                    <select
                        value={organizationId}
                        onChange={(e) => setOrganizationId(e.target.value)}
                    >
                        <option value=''>(не выбрано)</option>
                        {organizationsList.map((org) => (
                            <option key={org.id} value={org.id}>
                                id: {org.id}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="object-item">
                    <label className="object-item-label">* salary</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите целое число"
                        value={salary}
                        onChange={handleSalaryChange}
                    />
                </div>

                <div className="object-item">
                    <label className="object-item-label">* rating</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите дробное число"
                        value={rating}
                        onChange={handleRatingChange}
                    />
                </div>

                <div className="object-item">
                    <label className="object-item-label">* start date</label>
                    <DateInput birthday={startDate} setBirthday={setStartDate} />
                </div>

                <div className="object-item">
                    <label className="object-item-label">position</label>
                    <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                    >
                        <option value=''>(не указано)</option>
                        {positions.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="object-item">
                    <label className="object-item-label">* status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value=''>(не выбрано)</option>
                        {statuses.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="object-item">
                    <label className="object-item-label">* person</label>
                    <select
                        value={personId}
                        onChange={(e) => setPersonId(e.target.value)}
                    >
                        <option value=''>(не выбрано)</option>
                        {personsList.map((p) => (
                            <option key={p.id} value={p.id}>
                                id: {p.id} (passport: {p.passportId})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="object-item">
                    <button
                        type="button"
                        className="object-button"
                        onClick={submitObject}
                    >
                        создать
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NewWorker;