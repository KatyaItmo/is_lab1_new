import {useEffect, useState} from "react";

function NewOrganization({ showMessage }) {
    const [officialAddressId, setOfficialAddressId] = useState('');
    const [annualTurnover, setAnnualTurnover] = useState('');
    const [employeesCount, setEmployeesCount] = useState('');
    const [rating, setRating] = useState('');
    const [type, setType] = useState('');
    const [postalAddressId, setPostalAddressId] = useState('');

    const [addresses, setAddresses] = useState([]);
    const [types, setTypes] = useState([]);

    useEffect(() => {
        fetch('/api/address')
            .then(res => res.json())
            .then(data => setAddresses(data))
            .catch(err => showMessage('не удалось загрузить список addresses', 'error'));

        fetch('/api/enum/type')
            .then(res => res.json())
            .then(data => setTypes(data))
            .catch(err => showMessage('не удалось загрузить список types', 'error'));
    }, []);

    const handleAnnualTurnoverChange = (e) => {
        const value = e.target.value;
        if (/^[1-9]?\d*$/.test(value)) {
            const numValue = Number(value);
            if (numValue <= 9007199254740990 && numValue >= -9007199254740990) {
                setAnnualTurnover(value);
            }
        }
    }

    const handleEmployeesCountChange = (e) => {
        const value = e.target.value;
        if (/^[1-9]?\d*$/.test(value)) {
            const numValue = Number(value);
            if (numValue <= 2147483647 && numValue >= -2147483648) {
                setEmployeesCount(value);
            }
        }
    }

    const handleRatingChange = (e) => {
        const value = e.target.value;
        if (/^[1-9]?\d*$/.test(value)) {
            const numValue = Number(value);
            if (numValue <= 9007199254740990 && numValue >= -9007199254740990) {
                setRating(value);
            }
        }
    }

    const submitObject = async () => {
        if (annualTurnover === '' || rating === '' || postalAddressId === '') {
            showMessage('поля annual turnover, rating и postal address должны быть заполнены!', 'warn' );
            return;
        }

        const organization = {
            officialAddressId: officialAddressId ? officialAddressId : null,
            annualTurnover: Number(annualTurnover),
            employeesCount: employeesCount ? Number(employeesCount) : null,
            rating: Number(rating),
            type: type ? type : null,
            postalAddressId: postalAddressId
        }

        try {
            const response = await fetch('/api/organization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(organization)
            })

            if ( response.status === 201) {
                showMessage(await response.text(), 'text',);
                setOfficialAddressId('');
                setAnnualTurnover('');
                setEmployeesCount('');
                setRating('');
                setType('');
                setPostalAddressId('');
            } else {
                showMessage(await response.text(), 'error');
            }
        } catch(err) {
            showMessage('не удалось отправить данные на сервер', 'error')
        }
    }

    return (
        <div className="object-card">
            <h3>новый Organization</h3>
            <p>обязательные поля: *</p>

            <form className="object-form">
                <div className="object-item">
                    <label className="object-item-label">official address</label>
                    <select
                        value={officialAddressId}
                        onChange={(e) => setOfficialAddressId(e.target.value)}
                    >
                        <option value=''>(не указано)</option>
                        {addresses.map((address) =>(
                            <option key={address.id} value={address.id}>
                                id: {address.id} (street: {address.street}, location_id: {address.locationId})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="object-item">
                    <label className="object-item-label">* annual turnover</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите число"
                        value={annualTurnover}
                        onChange={(e) => handleAnnualTurnoverChange(e)}
                    />
                </div>

                <div className="object-item">
                    <label className="object-item-label">employees count</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите число"
                        value={employeesCount}
                        onChange={(e) => handleEmployeesCountChange(e)}
                    />
                </div>

                <div className="object-item">
                    <label className="object-item-label">* rating</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите число"
                        value={rating}
                        onChange={(e) => handleRatingChange(e)}
                    />
                </div>

                <div className="object-item">
                    <label className="object-item-label">organization type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value=''>(не указано)</option>
                        {types.map((item) =>(
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="object-item">
                    <label className="object-item-label">* postal address</label>
                    <select
                        value={postalAddressId}
                        onChange={(e) => setPostalAddressId(e.target.value)}
                    >
                        <option value=''>(не выбрано)</option>
                        {addresses.map((address) =>(
                            <option key={address.id} value={address.id}>
                                id: {address.id} (street: {address.street}, location_id: {address.locationId})
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

export default NewOrganization;