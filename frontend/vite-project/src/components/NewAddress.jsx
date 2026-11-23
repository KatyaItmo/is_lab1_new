import {useEffect, useState} from "react";

function NewAddress({ showMessage }) {
    const [street, setStreet] = useState('');
    const [locationId, setLocationId] = useState('');

    const [locations, setLocations] = useState([]);

    const handleStreetChange = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Zа-яА-ЯёЁ\s-]*$/.test(value)) {
            setStreet(value);
        }
    }

    useEffect(() => {
        fetch('/api/location')
            .then(res => res.json())
            .then(data => setLocations(data))
            .catch(err => showMessage('не удалось загрузить список locations', 'error'));
    }, []);

    const submitObject = async () => {
        if (!street.trim()) {
            showMessage('поле street должно быть заполнено!', 'warn' );
            return;
        }

        const address = {
            street: street.trim(),
            locationId: locationId ? locationId : null
        }

        try {
            const response = await fetch('/api/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(address)
            })

            if ( response.status === 201) {
                showMessage(await response.text(), 'text',);
                setStreet('');
                setLocationId('');
            } else {
                showMessage(await response.text(), 'error');
            }
        } catch(err) {
            showMessage('не удалось отправить данные на сервер', 'error')
        }
    }

    return (
        <div className="object-card">
            <h3>новый Address</h3>
            <p>обязательные поля: *</p>

            <form className="object-form">
                <div className="object-item">
                    <label className="object-item-label">* street</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите улицу"
                        value={street}
                        onChange={(e) => handleStreetChange(e)}
                    />
                </div>

                <div className="object-item">
                    <label className="object-item-label">location</label>
                    <select
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                    >
                        <option value=''>(не указано)</option>
                        {locations.map((loc) =>(
                            <option key={loc.id} value={loc.id}>
                                id: {loc.id} (x: {loc.x}, y: {loc.y}, z: {loc.z})
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

export default NewAddress;