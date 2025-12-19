// src/services/reviewService.js
import axios from 'axios';

const REVIEW_API_BASE_URL = 'http://localhost:8088/api/reviews';

const reviewApi = axios.create({
    baseURL: REVIEW_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 5000
});

// Token JWT
reviewApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Gestion erreurs
reviewApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('jwt');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ==================== FONCTIONS PRINCIPALES ====================

/**
 * 1. AJOUTER UN REVIEW
 */
export const addReview = async (reviewData) => {
    try {
        console.log('➕ Ajout review:', reviewData);
        const response = await reviewApi.post('', reviewData);
        console.log('✅ Review ajouté:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur ajout review:', error);
        throw new Error(error.response?.data?.error || error.message);
    }
};

/**
 * 2. RÉCUPÉRER TOUS LES REVIEWS
 */
export const getAllReviews = async () => {
    try {
        console.log('📊 Récupération de TOUS les reviews...');
        const response = await reviewApi.get('/all');

        console.log(`✅ ${response.data?.length || 0} reviews récupérés:`, response.data);
        return response.data || [];

    } catch (error) {
        console.error('❌ Erreur récupération tous reviews:', error);
        return [];
    }
};

/**
 * 3. RÉCUPÉRER REVIEWS D'UN PRODUIT
 */
export const getReviewsByProduct = async (productId) => {
    try {
        console.log(`📊 Récupération reviews produit ${productId}...`);
        const response = await reviewApi.get(`/product/${productId}`);
        console.log(`✅ ${response.data?.length || 0} reviews pour produit ${productId}`);
        return response.data || [];
    } catch (error) {
        console.error(`❌ Erreur reviews produit ${productId}:`, error);
        return [];
    }
};

/**
 * 4. RÉCUPÉRER REVIEWS D'UN UTILISATEUR
 */
export const getUserReviews = async (userId) => {
    try {
        console.log(`📊 Récupération reviews utilisateur ${userId}...`);
        // Récupère tous les reviews puis filtre
        const allReviews = await getAllReviews();
        const userReviews = allReviews.filter(review => review.userId === userId);
        console.log(`✅ ${userReviews.length} reviews pour utilisateur ${userId}`);
        return userReviews;

    } catch (error) {
        console.error('❌ Erreur getUserReviews:', error);
        return [];
    }
};

/**
 * 5. MODIFIER UN REVIEW
 */
export const updateReview = async (reviewId, reviewData) => {
    try {
        const response = await reviewApi.put(`/${reviewId}`, reviewData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message);
    }
};

/**
 * 6. SUPPRIMER UN REVIEW
 */
export const deleteReview = async (reviewId) => {
    try {
        const response = await reviewApi.delete(`/${reviewId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message);
    }
};

/**
 * 7. VÉRIFIER SI L'UTILISATEUR PEUT REVIEWER
 */
export const canUserReviewProduct = async (userId, productId) => {
    try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(
            `http://localhost:8086/api/orders/validate-review?userId=${userId}&productId=${productId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 3000
            }
        );
        return response.data?.allowed || false;
    } catch (error) {
        console.error('❌ Erreur validation review:', error);
        return false;
    }
};

/**
 * 8. NOTE MOYENNE D'UN PRODUIT
 */
export const getProductAverageRating = async (productId) => {
    try {
        const reviews = await getReviewsByProduct(productId);

        if (reviews.length === 0) {
            return { average: 0, count: 0 };
        }

        const sum = reviews.reduce((total, review) => total + review.rating, 0);
        const average = (sum / reviews.length).toFixed(1);

        return {
            average: parseFloat(average),
            count: reviews.length,
            distribution: calculateRatingDistribution(reviews)
        };

    } catch (error) {
        return { average: 0, count: 0 };
    }
};

// ==================== FONCTIONS UTILITAIRES ====================

/**
 * CALCULER DISTRIBUTION DES NOTES
 */
const calculateRatingDistribution = (reviews) => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach(review => {
        distribution[review.rating]++;
    });

    // Convertir en pourcentages
    Object.keys(distribution).forEach(key => {
        distribution[key] = Math.round((distribution[key] / reviews.length) * 100);
    });

    return distribution;
};

/**
 * FORMATEUR DE DATE
 */
export const formatReviewDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Aujourd'hui";
    } else if (diffDays === 1) {
        return "Hier";
    } else if (diffDays < 7) {
        return `Il y a ${diffDays} jours`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    } else {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
};

/**
 * VÉRIFIER L'ÉTAT DU SERVICE
 */
export const checkServiceStatus = async () => {
    try {
        console.log('🔍 Vérification statut service reviews...');
        await reviewApi.get('/all');
        console.log('✅ Service reviews disponible');
        return true;
    } catch (error) {
        console.error('❌ Service reviews indisponible:', error);
        return false;
    }
};

// ==================== EXPORT ====================

export default {
    // CRUD Operations
    addReview,
    getAllReviews,
    getReviewsByProduct,
    getUserReviews,
    updateReview,
    deleteReview,

    // Utility Functions
    canUserReviewProduct,
    getProductAverageRating,
    formatReviewDate,

    // Service Status
    checkServiceStatus
};