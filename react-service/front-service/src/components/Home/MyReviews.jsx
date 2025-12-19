// src/pages/MyReviews.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import catalogueService from '../../services/catalogueService';

const MyReviews = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // États
    const [deliveredProducts, setDeliveredProducts] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [serviceStatus, setServiceStatus] = useState(true);

    useEffect(() => {
        if (user?.id) {
            checkService();
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id && serviceStatus) {
            loadData();
        }
    }, [user?.id, serviceStatus]);

    const checkService = async () => {
        const status = await reviewService.checkServiceStatus();
        setServiceStatus(status);
    };

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.all([loadDeliveredProducts(), loadMyReviews()]);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    // Charger produits livrés
    const loadDeliveredProducts = async () => {
        try {
            const historyData = await catalogueService.getUserOrderHistory(user.id);

            let ordersList = [];
            if (Array.isArray(historyData)) {
                ordersList = historyData;
            } else if (historyData?.orders) {
                ordersList = historyData.orders;
            } else if (historyData?.history) {
                ordersList = historyData.history;
            }

            // Filtrer SEULEMENT les commandes DELIVERED
            const deliveredOrders = ordersList.filter(order =>
                order.orderStatus === 'DELIVERED'
            );

            // Extraire les produits
            const products = [];
            deliveredOrders.forEach(order => {
                if (order.items) {
                    order.items.forEach(item => {
                        products.push({
                            productId: item.productId,
                            productName: item.productName || `Produit ${item.productId}`,
                            orderId: order.orderNumber,
                            orderDate: order.orderDate,
                            price: item.unitPrice || 0,
                            quantity: item.quantity || 1
                        });
                    });
                }
            });

            setDeliveredProducts(products);

        } catch (error) {
            console.error('Erreur produits livrés:', error);
        }
    };

    // Charger mes reviews
    const loadMyReviews = async () => {
        try {
            // Récupérer TOUS les reviews puis filtrer
            const allReviews = await reviewService.getAllReviews();
            const myReviewsList = allReviews.filter(review => review.userId === user.id);
            setMyReviews(myReviewsList);
        } catch (error) {
            console.error('Erreur chargement reviews:', error);
        }
    };

    // Vérifier si un produit est déjà noté
    const productHasReview = (productId) => {
        return myReviews.some(review => review.productId === productId);
    };

    // Ouvrir formulaire
    const openReviewForm = (product) => {
        setSelectedProduct(product);
        setReviewForm({ rating: 5, comment: '' });
    };

    // Soumettre review
    const submitReview = async () => {
        if (!selectedProduct || !reviewForm.comment.trim()) {
            setMessage('Écrivez un commentaire');
            return;
        }

        try {
            setSubmitting(true);
            setMessage('');

            const reviewData = {
                userId: user.id,
                productId: selectedProduct.productId,
                rating: reviewForm.rating,
                comment: reviewForm.comment.trim()
            };

            await reviewService.addReview(reviewData);

            setMessage('✅ Avis publié avec succès!');

            // Recharger les données
            await loadMyReviews();

            // Fermer formulaire après délai
            setTimeout(() => {
                setSelectedProduct(null);
                setReviewForm({ rating: 5, comment: '' });
                setMessage('');
            }, 2000);

        } catch (error) {
            setMessage(`❌ ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Annuler
    const cancelReview = () => {
        setSelectedProduct(null);
        setReviewForm({ rating: 5, comment: '' });
    };

    // Formater date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    // Rendu étoiles
    const renderStars = (rating, interactive = false) => {
        return (
            <div className="d-flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="btn btn-link p-0"
                        onClick={() => interactive && setReviewForm({...reviewForm, rating: star})}
                        style={{ cursor: interactive ? 'pointer' : 'default' }}
                    >
                        <i className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'} text-warning`}></i>
                    </button>
                ))}
            </div>
        );
    };

    if (!user) {
        return (
            <div className="container mt-5">
                <div className="card">
                    <div className="card-body text-center">
                        <h4>Connectez-vous</h4>
                        <button onClick={() => navigate('/login')} className="btn btn-dark">
                            Se connecter
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!serviceStatus) {
        return (
            <div className="container mt-5">
                <div className="card">
                    <div className="card-body text-center">
                        <h4>Service Indisponible</h4>
                        <p>Le service d'avis est temporairement indisponible</p>
                        <button onClick={checkService} className="btn btn-warning">
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Mes Avis Produits</h4>
                <button onClick={() => navigate('/')} className="btn btn-outline-secondary">
                    ← Retour
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} mb-3`}>
                    {message}
                </div>
            )}

            {/* Statistiques */}
            <div className="row mb-4">
                <div className="col-md-4 mb-3">
                    <div className="card text-center p-3">
                        <div className="fs-3 fw-bold text-primary">{deliveredProducts.length}</div>
                        <div className="text-muted">Produits Livrés</div>
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="card text-center p-3">
                        <div className="fs-3 fw-bold text-success">{myReviews.length}</div>
                        <div className="text-muted">Avis Donnés</div>
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="card text-center p-3">
                        <div className="fs-3 fw-bold text-warning">
                            {deliveredProducts.length - myReviews.length}
                        </div>
                        <div className="text-muted">À Noter</div>
                    </div>
                </div>
            </div>

            {/* Formulaire Review */}
            {selectedProduct && (
                <div className="card mb-4 border-primary">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Donner votre avis</h5>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <h6>{selectedProduct.productName}</h6>
                            <small className="text-muted">
                                Commande #{selectedProduct.orderId}
                            </small>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Note</label>
                            <div className="mb-2">
                                {renderStars(reviewForm.rating, true)}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Commentaire *</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Votre avis sur ce produit..."
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                required
                            />
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={cancelReview}
                                disabled={submitting}
                            >
                                Annuler
                            </button>
                            <button
                                className="btn btn-primary flex-grow-1"
                                onClick={submitReview}
                                disabled={submitting || !reviewForm.comment.trim()}
                            >
                                {submitting ? 'Envoi...' : 'Publier l\'avis'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Liste Produits Livrés */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Mes Produits Livrés ({deliveredProducts.length})</h5>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border"></div>
                            <p>Chargement...</p>
                        </div>
                    ) : deliveredProducts.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">Aucun produit livré</p>
                        </div>
                    ) : (
                        <div className="list-group">
                            {deliveredProducts.map((product, index) => {
                                const hasReview = productHasReview(product.productId);
                                const myReview = myReviews.find(r => r.productId === product.productId);

                                return (
                                    <div key={index} className="list-group-item">
                                        <div className="row align-items-center">
                                            <div className="col">
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <h6 className="fw-bold mb-1">{product.productName}</h6>
                                                        <small className="text-muted d-block">
                                                            Commande #{product.orderId} • {formatDate(product.orderDate)}
                                                        </small>
                                                        <small className="text-muted">
                                                            {catalogueService.formatCurrency(product.price)} × {product.quantity}
                                                        </small>
                                                    </div>
                                                    <div>
                                                        {hasReview ? (
                                                            <div className="text-end">
                                                                <div className="mb-1">
                                                                    {renderStars(myReview.rating)}
                                                                </div>
                                                                <small className="text-muted">
                                                                    {reviewService.formatReviewDate(myReview.createdAt)}
                                                                </small>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => openReviewForm(product)}
                                                            >
                                                                <i className="bi bi-chat-left-text me-1"></i>
                                                                Noter
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyReviews;