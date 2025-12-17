// services/orderService.js
import axios from 'axios';

// CORRECT: Order Service f port 8086
const ORDER_API_BASE_URL = 'http://localhost:8086';

const orderApi = axios.create({
    baseURL: ORDER_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000
});

// Add JWT token automatically
orderApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token added to order request:', token.substring(0, 20) + '...');
    } else {
        console.warn('⚠️ No JWT token found for order request');
    }
    return config;
});

// Debug responses
orderApi.interceptors.response.use(
    (response) => {
        console.log('✅ Order API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('❌ Order API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            response: error.response?.data
        });

        // Si 401, redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('jwt');
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

// Fetch cart items (products)
export const getCartItems = () => {
    console.log('📦 Fetching cart items from:', ORDER_API_BASE_URL + '/api/orders/cart-items');
    return orderApi.get('/api/orders/cart-items');
};

// Create new order
export const createOrder = (orderData) => {
    console.log('🛒 Creating order:', orderData);
    return orderApi.post('/api/orders/create', orderData);
};

// Test connection
export const testOrderService = () => {
    return orderApi.get('/api/orders/test');
};

// Alternative: Direct fetch with JWT
export const fetchCartItemsDirect = async () => {
    const token = localStorage.getItem('jwt');
    const response = await fetch('http://localhost:8086/api/orders/cart-items', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
};