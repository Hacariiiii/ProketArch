// src/services/catalogueService.js
import axios from "axios";

const CATALOGUE_API_BASE_URL = "http://localhost:8090/api/catalogue";

// Instance axios
const catalogueApi = axios.create({
    baseURL: CATALOGUE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 8000,
});

// Intercepteurs
catalogueApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("jwt");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

catalogueApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("jwt");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Fonctions du service
export const testConnection = async () => {
    try {
        const response = await catalogueApi.get("/health");
        return { status: 'UP', data: response.data };
    } catch (error) {
        return { status: 'DOWN', message: error.message };
    }
};

export const getMyOrderHistory = async () => {
    try {
        const response = await catalogueApi.get("/my-history");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMyOrdersByStatus = async (status) => {
    try {
        const response = await catalogueApi.get(`/my-history/status/${status}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMyOrdersByDateRange = async (startDate, endDate) => {
    try {
        const response = await catalogueApi.get(`/my-history/date-range`, {
            params: { startDate, endDate },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMyOrderSummary = async () => {
    try {
        const response = await catalogueApi.get("/my-summary");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUserOrderHistory = async (userId) => {
    try {
        const response = await catalogueApi.get(`/users/${userId}/history`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUserOrderSummary = async (userId) => {
    try {
        const response = await catalogueApi.get(`/users/${userId}/summary`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllOrders = async () => {
    try {
        const response = await catalogueApi.get("/orders/all");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getOrderByNumber = async (orderNumber) => {
    try {
        const response = await catalogueApi.get(`/orders/${orderNumber}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getGlobalStatistics = async () => {
    try {
        const response = await catalogueApi.get("/statistics");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const recordOrder = async (orderData) => {
    try {
        const response = await catalogueApi.post("/orders", orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fonctions utilitaires
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "MAD 0.00";
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

export const formatOrderDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (error) {
        return "Date invalide";
    }
};

export const getStatusLabel = (status) => {
    const labels = {
        'PENDING': 'En attente',
        'CONFIRMED': 'Confirmée',
        'PROCESSING': 'En traitement',
        'SHIPPED': 'Expédiée',
        'DELIVERED': 'Livrée',
        'CANCELLED': 'Annulée'
    };
    return labels[status] || status;
};

export const getStatusColor = (status) => {
    const colors = {
        'PENDING': 'warning',
        'CONFIRMED': 'info',
        'PROCESSING': 'primary',
        'SHIPPED': 'success',
        'DELIVERED': 'success',
        'CANCELLED': 'danger'
    };
    return colors[status] || 'secondary';
};

export const getStatusIcon = (status) => {
    const icons = {
        'PENDING': '⏳',
        'CONFIRMED': '✅',
        'PROCESSING': '⚙️',
        'SHIPPED': '🚚',
        'DELIVERED': '📦',
        'CANCELLED': '❌'
    };
    return icons[status] || '📋';
};

export const checkServiceStatus = async () => {
    try {
        const result = await testConnection();
        return result.status === 'UP';
    } catch (error) {
        return false;
    }
};

// Export par défaut
export default {
    testConnection,
    checkServiceStatus,
    getMyOrderHistory,
    getMyOrdersByStatus,
    getMyOrdersByDateRange,
    getMyOrderSummary,
    getUserOrderHistory,
    getUserOrderSummary,
    getAllOrders,
    getOrderByNumber,
    getGlobalStatistics,
    recordOrder,
    formatCurrency,
    formatOrderDate,
    getStatusLabel,
    getStatusColor,
    getStatusIcon
};