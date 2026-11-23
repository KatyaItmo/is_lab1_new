import {useState} from "react";

function NewLocation({ showMessage }) {
    const [x, setX] = useState('');
    const [y, setY] = useState('');
    const [z, setZ] = useState('');

    const handleXChange = (e) => {
        const value = e.target.value;
        if (/^-?\d*$/.test(value)) {
            if (value === '-') {
                setX(value);
            }
            const numValue = Number(value);
            if (numValue <= 9007199254740990 && numValue >= -9007199254740990) {
                setX(value);
            }
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

    const handleZChange = (e) => {
        const value = e.target.value;
        if (/^-?\d*$/.test(value)) {
            if (value === '-') {
                setZ(value);
            }
            const numValue = Number(value);
            if (numValue <= 2147483647 && numValue >= -2147483648) {
                setZ(value);
            }
        }
    }

    const submitObject = async () => {
        if (x === '' || y === '' || z === '') {
            showMessage('все поля должны быть заполнены!', 'warn' );
            return;
        }

        if (x === '-' || y === '-' || z === '-') {
            showMessage('заполните поля корректно!', 'warn');
            return;
        }

        const location = {
            x: Number(x),
            y: Number(y),
            z: Number(z)
        }

        try {
            const response = await fetch('/api/location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(location)
            })

            if ( response.status === 201) {
                showMessage(await response.text(), 'text',);
                setX('');
                setY('');
                setZ('');
            } else {
                showMessage(await response.text(), 'error');
            }
        } catch(err) {
            showMessage('не удалось отправить данные на сервер', 'error')
        }
    }

    return (
        <div className="object-card">
            <h3>новый Location</h3>
            <p>обязательные поля: *</p>

            <form className="object-form">
                <div className="object-item">
                    <label className="object-item-label">* x</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите целое число"
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
                    <label className="object-item-label">* z</label>
                    <input
                        type="text"
                        className="object-item-input"
                        placeholder="введите целое число"
                        value={z}
                        onChange={(e) => handleZChange(e)}
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

export default NewLocation;