import React, { useState } from 'react';

function DateInput({ birthday, setBirthday }) {
    const handleChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 8) {
            value = value.slice(0, 8);
        }

        let formatted = '';
        if (value.length > 0) {
            let day = value.substring(0, 2);
            if (parseInt(day[0]) > 3) day = '3';
            if (parseInt(day) > 31) day = '31';
            formatted = day;
        }

        if (value.length >= 3) {
            let month = value.substring(2, 4);
            if (parseInt(month[0]) > 1) month = '1';
            if (parseInt(month) > 12) month = '12';
            formatted += '.' + month;
        }

        if (value.length >= 5) {
            let year = value.substring(4, 8);
            formatted += '.' + year;
        }

        setBirthday(formatted);
    };

    return (
        <input
            type="text"
            className="object-item-input"
            value={birthday}
            onChange={handleChange}
            placeholder="введите дату в формате дд.мм.гггг"
            maxLength={10}
        />
    );
}

export default DateInput;