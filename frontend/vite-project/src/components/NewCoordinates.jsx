import {useState} from "react";

function NewCoordinates({ showMessage }) {
    const [x, setX] = useState('');
    const [y, setY] = useState('');

    const handleXChange = (e) => {
        const value = e.target.value;
        if (/^-?\d*([.,]\d{0,3})?$/.test(value)) {
            setX(value);
        }
    }

    const handleYChange = (e) => {
        const value = e.target.value;
        if (/^-?\d*$/.test(value)) {
            if (value === '-') {
                setY(value);
            }
            const numValue = Number(value);
            if (numValue <= 2147483647 && numValue >= -2147483648) {
                setY(value);
            }
        }
    }

    const submitObject = async () => {
        if (x === '' || y === '') {
            showMessage('поля должны быть заполнены!', 'warn' );
            return;
        }

        if (x === '-' || y === '-') {
            showMessage('заполните поля корректно!', 'warn');
            return;
        }

        const coordinates = {
            x: parseFloat(x.replace(',', '.')),
            y: Number(y)
        }

        try {
            const response = await fetch('/api/coordinates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(coordinates)
            })

            if ( response.status === 201) {
                showMessage(await response.text(), 'text',);
                setX('');
                setY('');
            } else {
                showMessage(await response.text(), 'error');
            }
        } catch(err) {
            showMessage('не удалось отправить данные на сервер', 'error')
        }
    }

    return (
        <div className="object-card">
            <h3>новый Coordinates</h3>
            <p>обязательные поля: *</p>

            <form className="object-form">
                <div className="object-item">
                    <label className="object-item-label">* x</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите дробное число"
                        value={x}
                        onChange={(e) => handleXChange(e)}
                    />
                </div>

                <div className="object-item">
                    <label className="object-item-label">* y</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите целое число"
                        value={y}
                        onChange={(e) => handleYChange(e)}
                    />
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

export default NewCoordinates;