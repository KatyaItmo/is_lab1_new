const APP_PREFIX = window.location.pathname.replace(/\/$/, '');
const BASE_URL = `${APP_PREFIX}/api`;

let onUnauthorizedCallback = null;

export function setUnauthorizedHandler(callback) {
    onUnauthorizedCallback = callback;
}

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        if (onUnauthorizedCallback) {
            onUnauthorizedCallback();
        }
        throw new ApiError('session expired, please log in again', 401);
    }

    const rawText = await response.text();
    let parsedData = null;

    if (rawText) {
        try {
            parsedData = JSON.parse(rawText);
        } catch {
            parsedData = rawText;
        }
    }

    if (!response.ok) {
        const errorMessage =
            (parsedData && typeof parsedData === 'object' && parsedData.message) ||
            (typeof parsedData === 'string' && parsedData) ||
            `error request (${response.status})`;

        throw new ApiError(errorMessage, response.status);
    }

    return {
        data: parsedData,
        headers: response.headers,
    };
}
