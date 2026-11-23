import {useEffect, useState} from "react";
import DateInput from "./DateInput.jsx";

function NewPerson({ showMessage }) {
    const [eyeColor, setEyeColor] = useState('');
    const [hairColor, setHairColor] = useState('');
    const [locationId, setLocationId] = useState('');
    const [birthday, setBirthday] = useState('');
    const [height, setHeight] = useState('');
    const [passportId, setPassportId] = useState('');
    const [nationality, setNationality] = useState('');

    const [colors, setColors] = useState([]);
    const [locations, setLocations] = useState([]);
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        fetch('/api/enum/color')
            .then(res => res.json())
            .then(data => setColors(data))
            .catch(err => showMessage('не удалось загрузить список colors', 'error'));

        fetch('/api/location')
            .then(res => res.json())
            .then(data => setLocations(data))
            .catch(err => showMessage('не удалось загрузить список locations', 'error'));

        fetch('/api/enum/country')
            .then(res => res.json())
            .then(data => setCountries(data))
            .catch(err => showMessage('не удалось загрузить список countries', 'error'));
    }, []);

    const handleHeightChange = (e) => {
        const value = e.target.value;
        if (/^[1-9]?\d*$/.test(value)) {
            const numValue = Number(value);
            if (numValue <= 2147483647 && numValue >= -2147483648) {
                setHeight(value);
            }
        }
    }

    const handlePassportIdChange = (e) => {
        const value = e.target.value;
        if (/^[1-9]?\d*$/.test(value)) {
            setPassportId(value);
        }
    }

    const isValidDate = () => {
        const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        const match = birthday.match(regex);
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

    const convertDataToBackend = () => {
        const parts = birthday.split('.');

        const day = parts[0];
        const month = parts[1];
        const year = parts[2];

        return `${year}-${month}-${day}T00:00:00Z`;
    }

    const submitObject = async () => {
        if (eyeColor === '' || locationId === '' || birthday === '' || height === '' || passportId === '') {
            showMessage('все поля (за исключением hair color и nationality) должны быть обязательно заполнены!', 'warn' );
            return;
        }

        if (!isValidDate()) {
            showMessage('введена некорректная дата!', 'warn');
            setBirthday('');
            return;
        }

        if (passportId.length < 8) {
            showMessage('длина passportID должна быть не меньше 8!', 'warn');
            return;
        }

        const person = {
            eyeColor: eyeColor,
            hairColor: hairColor ? hairColor : null,
            locationId: locationId,
            birthday: convertDataToBackend(),
            height: Number(height),
            passportId: passportId,
            nationality: nationality ? nationality : null
        }

        try {
            const response = await fetch('/api/person', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(person)
            })

            if ( response.status === 201) {
                showMessage(await response.text(), 'text',);
                setEyeColor('');
                setHairColor('');
                setLocationId('');
                setBirthday('');
                setHeight('');
                setPassportId('');
                setNationality('');
            } else {
                showMessage(await response.text(), 'error');
            }
        } catch(err) {
            showMessage('не удалось отправить данные на сервер', 'error')
        }
    }

    return (
        <div className="object-card">
            <h3>новый Person</h3>
            <p>обязательные поля: *</p>

            <form className="object-form">
                <div className="object-item">
                    <label className="object-item-label">* eye color</label>
                    <select
                        value={eyeColor}
                        onChange={(e) => setEyeColor(e.target.value)}
                    >
                        <option value=''>(не выбрано)</option>
                        {colors.map((item) =>(
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="object-item">
                    <label className="object-item-label">hair color</label>
                    <select
                        value={hairColor}
                        onChange={(e) => setHairColor(e.target.value)}
                    >
                        <option value=''>(не указано)</option>
                        {colors.map((item) =>(
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="object-item">
                    <label className="object-item-label">* location</label>
                    <select
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                    >
                        <option value=''>(не выбрано)</option>
                        {locations.map((loc) =>(
                            <option key={loc.id} value={loc.id}>
                                id: {loc.id} (x: {loc.x}, y: {loc.y}, z: {loc.z})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="object-item">
                    <label className="object-item-label">* birthday</label>
                    <DateInput birthday={birthday} setBirthday={setBirthday} />
                </div>

                <div className="object-item">
                    <label className="object-item-label">* height</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите число"
                        value={height}
                        onChange={(e) => handleHeightChange(e)}
                    />
                </div>

                <div className="object-item">
                    <label className="object-item-label">* passportID</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите числовую строку"
                        value={passportId}
                        onChange={(e) => handlePassportIdChange(e)}
                    />
                </div>

                <div className="object-item">
                    <label className="object-item-label">nationality</label>
                    <select
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                    >
                        <option value=''>(не указано)</option>
                        {countries.map((item) =>(
                            <option key={item} value={item}>
                                {item}
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

export default NewPerson;