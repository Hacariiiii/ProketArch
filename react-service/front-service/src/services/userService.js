import api from './api';

export const getUserInfo = () => {
    return api.get('/api/auth/me');
};

export const updateUserProfile = (email) => {
    return api.put('/api/users/profile', {
        email
    });
};

export const changePassword = (oldPassword, newPassword) => {
    return api.post('/api/users/change-password', {
        oldPassword,
        newPassword
    });
};