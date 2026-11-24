import { request } from './httpClient';

function createEntityApi(basePath) {
    return {
        getAll: async () => {
            const { data } = await request(basePath);
            return data;
        },

        getById: async (id) => {
            const { data } = await request(`${basePath}/${id}`);
            return data;
        },

        create: async (dto) => {
            const { data } = await request(basePath, {
                method: 'POST',
                body: JSON.stringify(dto),
            });
            return data;
        },

        update: async (dto) => {
            const { data } = await request(basePath, {
                method: 'PUT',
                body: JSON.stringify(dto),
            });
            return data;
        },

        delete: async (id) => {
            const { data } = await request(`${basePath}/${id}`, {
                method: 'DELETE',
            });
            return data;
        },

        getDependencies: async (id) => {
            const { data } = await request(`${basePath}/${id}/dependencies`);
            return data;
        },

        getExcept: async (id) => {
            const { data } = await request(`${basePath}/except/${id}`);
            return data;
        },

        reassignAndDelete: async (id, updates) => {
            const { data } = await request(`${basePath}/${id}/reassign-delete`, {
                method: 'POST',
                body: JSON.stringify(updates),
            });
            return data;
        },
    };
}

export const organizationApi = {
    ...createEntityApi('/organization'),
    getAverageRating: async () => {
        const { data } = await request('/organization/average-rating');
        return data;
    },
};

export const personApi = createEntityApi('/person');
export const addressApi = createEntityApi('/address');
export const locationApi = createEntityApi('/location');
export const coordinatesApi = createEntityApi('/coordinates');

export const workerApi = {
    getPaginated: async ({ filteredValue = '', sortOrder = 'asc', page = 0, size = 10 } = {}) => {
        const params = new URLSearchParams({
            sortOrder,
            page: String(page),
            size: String(size),
        });

        if (filteredValue && filteredValue.trim() !== '') {
            params.append('filteredValue', filteredValue.trim());
        }

        const { data, headers } = await request(`/worker?${params.toString()}`);
        const totalCount = Number(headers.get('total-count')) || 0;

        return {
            items: data || [],
            totalCount,
        };
    },

    getById: async (id) => {
        const { data } = await request(`/worker/${id}`);
        return data;
    },

    create: async (dto) => {
        const { data } = await request('/worker', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return data;
    },

    update: async (dto) => {
        const { data } = await request('/worker', {
            method: 'PUT',
            body: JSON.stringify(dto),
        });
        return data;
    },

    delete: async (id) => {
        const { data } = await request(`/worker/${id}`, {
            method: 'DELETE',
        });
        return data;
    },

    fire: async (id) => {
        const { data } = await request(`/worker/${id}/fire`, {
            method: 'PUT',
        });
        return data;
    },

    indexSalary: async (id, coefficient) => {
        const { data } = await request(`/worker/${id}/salary?coefficient=${coefficient}`, {
            method: 'PUT',
        });
        return data;
    },

    getAverageRating: async () => {
        const { data } = await request('/worker/average-rating');
        return data;
    },

    countStatusLessThan: async (status) => {
        const { data } = await request(`/worker/count-status-less-than?status=${status}`);
        return data;
    },

    getDistinctStatuses: async () => {
        const { data } = await request('/worker/statuses');
        return data;
    },
};

export const enumApi = {
    getColors: async () => {
        const { data } = await request('/enum/color');
        return data;
    },

    getCountries: async () => {
        const { data } = await request('/enum/country');
        return data;
    },

    getOrganizationTypes: async () => {
        const { data } = await request('/enum/organization_type');
        return data;
    },

    getPositions: async () => {
        const { data } = await request('/enum/position');
        return data;
    },

    getStatuses: async () => {
        const { data } = await request('/enum/status');
        return data;
    },
};
