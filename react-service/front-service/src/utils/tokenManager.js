// Save tokens after login
export const saveTokens = (accessToken, refreshToken) => {
    localStorage.setItem('jwt', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

// Get access token
export const getAccessToken = () => {
    return localStorage.getItem('jwt');
};

// Get refresh token
export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

// Save user info
export const saveUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

// Get user info
export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Check if authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('jwt');
};

// Remove all data (logout)
export const removeTokens = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};