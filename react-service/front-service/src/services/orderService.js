import api from './api';

// Fetch cart items (products)
export const getCartItems = () => {
    return api.get('/api/orders/cart-items');
};

// Create new order
export const createOrder = (orderData) => {
    return api.post('/api/orders/create', orderData);
};

// Get all orders (optional)
export const getOrders = () => {
    return api.get('/api/orders');
};

// Get order by ID (optional)
export const getOrderById = (orderId) => {
    return api.get(`/api/orders/${orderId}`);
};