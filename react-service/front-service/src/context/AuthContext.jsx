import { createContext, useReducer, useEffect } from 'react';
import { isAuthenticated, getUser, getAccessToken } from '../utils/tokenManager';

export const AuthContext = createContext();

const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null
};

function authReducer(state, action) {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                error: null
            };

        case 'LOGIN_FAILURE':
            return {
                ...state,
                error: action.payload,
                isAuthenticated: false
            };

        case 'LOGOUT':
            return {
                ...initialState,
                loading: false
            };

        case 'INIT_AUTH':
            return {
                ...state,
                isAuthenticated: action.payload.isAuthenticated,
                user: action.payload.user,
                token: action.payload.token,
                loading: false
            };

        case 'SET_LOADING':
            return { ...state, loading: action.payload };

        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check auth on app load
    useEffect(() => {
        if (isAuthenticated()) {
            const user = getUser();
            const token = getAccessToken();
            dispatch({
                type: 'INIT_AUTH',
                payload: { isAuthenticated: true, user, token }
            });
        } else {
            dispatch({
                type: 'INIT_AUTH',
                payload: { isAuthenticated: false, user: null, token: null }
            });
        }
    }, []);

    const login = (user, token) => {
        dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token }
        });
    };

    const logout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    const setError = (error) => {
        dispatch({
            type: 'LOGIN_FAILURE',
            payload: error
        });
    };

    const setLoading = (loading) => {
        dispatch({
            type: 'SET_LOADING',
            payload: loading
        });
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                logout,
                setError,
                setLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
