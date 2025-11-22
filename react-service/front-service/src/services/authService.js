import api from './api';

export const register = (username, email, password) => {
    return api.post('/api/auth/register', {
        username,
        email,
        password,
        confirmPassword: password
    });
};

export const login = (username, password) => {
    return api.post('/api/auth/login', {
        username,
        password
    });
};

export const logout = () => {
    return api.post('/api/auth/logout');
};

export const validateToken = () => {
    return api.get('/api/auth/validate');
};

export const refreshAccessToken = (refreshToken) => {
    return api.post('/api/auth/refresh', {
        refreshToken
    });
};