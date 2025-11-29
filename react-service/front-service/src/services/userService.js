import api from './api';

export const getUserInfo = () => {
    return api.get('/api/auth/me');
};

export const updateUserProfile = (email) => {
    const token = localStorage.getItem('jwt');
    return api.put('/api/auth/profile',
        { email },
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
};

export const changePassword = (oldPassword, newPassword) => {
    const token = localStorage.getItem('jwt');
    return api.post('/api/auth/change-password',
        { oldPassword, newPassword },
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
};