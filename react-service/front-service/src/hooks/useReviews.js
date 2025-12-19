// src/hooks/useReviews.js
import { useState, useEffect, useCallback } from 'react';
import reviewService from '../services/reviewService';
import catalogueService from '../services/catalogueService';

export const useReviews = (userId) => {
    const [reviews, setReviews] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        reviewed: 0,
        pending: 0,
        averageRating: 0
    });

    // Charger toutes les données
    const loadData = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);

            // 1. Charger les produits achetés
            const purchasedProducts = await catalogueService.getUserDeliveredProducts(userId);
            setProducts(purchasedProducts);

            // 2. Charger les reviews de l'utilisateur
            const userReviews = await reviewService.getUserReviews(userId);
            setReviews(userReviews);

            // 3. Calculer les statistiques
            const reviewedProducts = purchasedProducts.filter(product =>
                userReviews.some(review => review.productId === product.productId)
            );

            const averageRating = userReviews.length > 0
                ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)
                : 0;

            setStats({
                totalProducts: purchasedProducts.length,
                reviewed: reviewedProducts.length,
                pending: purchasedProducts.length - reviewedProducts.length,
                averageRating: parseFloat(averageRating)
            });

        } catch (err) {
            console.error('Erreur chargement données reviews:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Ajouter un review
    const addReview = async (productId, reviewData) => {
        try {
            const newReview = await reviewService.addReview({
                userId,
                productId,
                ...reviewData
            });

            // Mettre à jour la liste des reviews
            setReviews(prev => [...prev, newReview]);

            // Recharger les données
            await loadData();

            return { success: true, review: newReview };

        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Mettre à jour un review
    const updateReview = async (reviewId, reviewData) => {
        try {
            const updatedReview = await reviewService.updateReview(reviewId, reviewData);

            // Mettre à jour la liste
            setReviews(prev => prev.map(r =>
                r.id === reviewId ? updatedReview : r
            ));

            return { success: true, review: updatedReview };

        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Supprimer un review
    const deleteReview = async (reviewId) => {
        try {
            await reviewService.deleteReview(reviewId);

            // Retirer de la liste
            setReviews(prev => prev.filter(r => r.id !== reviewId));

            // Recharger les données
            await loadData();

            return { success: true };

        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Vérifier si un produit peut être reviewé
    const checkCanReview = async (productId) => {
        try {
            return await reviewService.canUserReviewProduct(userId, productId);
        } catch (err) {
            console.error('Erreur vérification permission:', err);
            return false;
        }
    };

    // Obtenir les reviews d'un produit spécifique
    const getProductReviews = async (productId) => {
        try {
            return await reviewService.getReviewsByProduct(productId);
        } catch (err) {
            console.error('Erreur récupération reviews produit:', err);
            return [];
        }
    };

    // Obtenir la note moyenne d'un produit
    const getProductRating = async (productId) => {
        try {
            return await reviewService.getProductAverageRating(productId);
        } catch (err) {
            console.error('Erreur récupération note produit:', err);
            return { average: 0, count: 0 };
        }
    };

    // Recharger les données
    const refresh = () => {
        loadData();
    };

    // Charger les données au démarrage
    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        // Données
        reviews,
        products,
        loading,
        error,
        stats,

        // Actions
        addReview,
        updateReview,
        deleteReview,
        checkCanReview,
        getProductReviews,
        getProductRating,
        refresh,

        // Méthodes utilitaires
        productHasReview: (productId) => {
            return reviews.some(review => review.productId === productId);
        },

        getProductReview: (productId) => {
            return reviews.find(review => review.productId === productId);
        },

        getProductsWithoutReview: () => {
            return products.filter(product =>
                !reviews.some(review => review.productId === product.productId)
            );
        },

        getProductsWithReview: () => {
            return products.filter(product =>
                reviews.some(review => review.productId === product.productId)
            );
        }
    };
};

export default useReviews;