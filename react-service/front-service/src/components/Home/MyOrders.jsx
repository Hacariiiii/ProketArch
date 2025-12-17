// src/pages/MyOrders.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import catalogueService, {
    formatCurrency,
    formatOrderDate,
    getStatusLabel,
    getStatusColor,
    checkServiceStatus
} from '../../services/catalogueService';

const MyOrders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [serviceStatus, setServiceStatus] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkServiceConnection();
    }, []);

    useEffect(() => {
        if (user?.id && serviceStatus) {
            loadUserData();
        }
    }, [user?.id, serviceStatus]);

    useEffect(() => {
        filterOrders();
    }, [orders, searchTerm, statusFilter]);

    const checkServiceConnection = async () => {
        try {
            const status = await checkServiceStatus();
            setServiceStatus(status);
        } catch (error) {
            console.error('Error checking service:', error);
            setServiceStatus(false);
        }
    };

    const loadUserData = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Récupérer l'historique complet de l'utilisateur
            const historyData = await catalogueService.getUserOrderHistory(user.id);

            // Si l'API retourne un objet avec des sous-propriétés
            let ordersList = [];
            if (Array.isArray(historyData)) {
                ordersList = historyData;
            } else if (historyData && Array.isArray(historyData.orders)) {
                ordersList = historyData.orders;
            } else if (historyData && Array.isArray(historyData.history)) {
                ordersList = historyData.history;
            }

            // Trier par date décroissante
            ordersList.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            setOrders(ordersList);

            console.log('Orders loaded:', ordersList);

        } catch (error) {
            console.error('Error loading user data:', error);
            setError(error.message || 'Erreur lors du chargement des données');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        // Filtre par recherche
        if (searchTerm) {
            filtered = filtered.filter(
                order =>
                    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (order.shippingAddress && order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filtre par statut
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(order => order.orderStatus === statusFilter);
        }

        setFilteredOrders(filtered);
        setCurrentPage(1);
    };

    const handleRefresh = async () => {
        await loadUserData();
    };

    const handleRetry = async () => {
        await checkServiceConnection();
        if (serviceStatus) {
            await loadUserData();
        }
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calcul des statistiques
    const calculateStats = () => {
        if (!orders || orders.length === 0) {
            return {
                totalOrders: 0,
                totalSpent: 0,
                averageOrderValue: 0,
                lastOrderDate: null
            };
        }

        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        const lastOrder = orders[0]; // Déjà trié par date décroissante

        return {
            totalOrders,
            totalSpent,
            averageOrderValue,
            lastOrderDate: lastOrder?.orderDate,
            lastOrderNumber: lastOrder?.orderNumber
        };
    };

    const stats = calculateStats();

    if (!user) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center p-5">
                                <div className="mb-4">
                                    <i className="bi bi-person-circle fs-1 text-muted"></i>
                                </div>
                                <h4 className="card-title mb-3">Connexion Requise</h4>
                                <p className="card-text text-muted mb-4">
                                    Veuillez vous connecter pour accéder à votre historique de commandes.
                                </p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn btn-dark px-4"
                                >
                                    <i className="bi bi-box-arrow-in-right me-2"></i>
                                    Se connecter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mt-5 py-5">
                <div className="text-center">
                    <div className="spinner-border text-dark" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3 text-muted">Chargement de votre historique...</p>
                </div>
            </div>
        );
    }

    if (!serviceStatus) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card border-light shadow-sm">
                            <div className="card-body text-center p-5">
                                <div className="mb-4">
                                    <i className="bi bi-exclamation-circle fs-1 text-warning"></i>
                                </div>
                                <h4 className="card-title mb-3">Service Indisponible</h4>
                                <p className="card-text text-muted mb-4">
                                    Le service d'historique est temporairement indisponible.
                                </p>
                                <button
                                    onClick={handleRetry}
                                    className="btn btn-dark px-4"
                                >
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    Réessayer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid bg-light min-vh-100">
            {/* Header avec navigation */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
                <div className="container">
                    <button
                        className="navbar-toggler border-0"
                        type="button"
                        onClick={() => navigate('/')}
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <div className="navbar-brand mx-auto">
                        <h4 className="mb-0 fw-bold">Mes Commandes</h4>
                    </div>
                    <div>
                        <button
                            onClick={handleRefresh}
                            className="btn btn-link text-dark"
                            title="Actualiser"
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container py-4">
                {/* En-tête utilisateur */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex align-items-center mb-3">
                            <div className="bg-dark text-white rounded-circle p-3 me-3">
                                <i className="bi bi-person fs-4"></i>
                            </div>
                            <div>
                                <h5 className="mb-1">{user.username || 'Utilisateur'}</h5>
                                <p className="text-muted mb-0">{user.email || ''}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="row mb-4">
                    <div className="col-md-3 mb-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary bg-opacity-10 rounded p-2 me-3">
                                        <i className="bi bi-bag-check text-primary"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-1">Commandes</h6>
                                        <h4 className="mb-0">{stats.totalOrders}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 mb-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="bg-success bg-opacity-10 rounded p-2 me-3">
                                        <i className="bi bi-currency-dollar text-success"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-1">Total</h6>
                                        <h4 className="mb-0">{formatCurrency(stats.totalSpent)}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 mb-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="bg-info bg-opacity-10 rounded p-2 me-3">
                                        <i className="bi bi-graph-up text-info"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-1">Moyenne</h6>
                                        <h4 className="mb-0">{formatCurrency(stats.averageOrderValue)}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3 mb-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="bg-warning bg-opacity-10 rounded p-2 me-3">
                                        <i className="bi bi-clock text-warning"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-1">Dernière</h6>
                                        <h6 className="mb-0">
                                            {stats.lastOrderDate ? formatOrderDate(stats.lastOrderDate) : 'Aucune'}
                                        </h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtres */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Rechercher une commande..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <select
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="ALL">Tous les statuts</option>
                                    <option value="PENDING">En attente</option>
                                    <option value="CONFIRMED">Confirmée</option>
                                    <option value="PROCESSING">En traitement</option>
                                    <option value="SHIPPED">Expédiée</option>
                                    <option value="DELIVERED">Livrée</option>
                                    <option value="CANCELLED">Annulée</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('ALL');
                                    }}
                                    disabled={!searchTerm && statusFilter === 'ALL'}
                                >
                                    <i className="bi bi-x-circle me-2"></i>
                                    Effacer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des commandes */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Historique ({filteredOrders.length})</h5>
                            <div className="text-muted">
                                {totalPages > 1 && `${currentPage}/${totalPages}`}
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="mb-4">
                                    <i className="bi bi-receipt display-1 text-muted"></i>
                                </div>
                                <h5 className="text-muted mb-3">
                                    {searchTerm || statusFilter !== 'ALL'
                                        ? 'Aucune commande ne correspond'
                                        : 'Aucune commande'}
                                </h5>
                                <p className="text-muted mb-4">
                                    {searchTerm || statusFilter !== 'ALL'
                                        ? 'Modifiez vos critères de recherche'
                                        : orders.length === 0
                                            ? 'Vous n\'avez pas encore passé de commande'
                                            : 'Toutes les commandes sont filtrées'}
                                </p>
                                {orders.length === 0 && (
                                    <button
                                        onClick={() => navigate('/shop')}
                                        className="btn btn-dark"
                                    >
                                        <i className="bi bi-cart-plus me-2"></i>
                                        Découvrir la boutique
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="list-group list-group-flush">
                                    {currentOrders.map((order) => {
                                        const statusColor = getStatusColor(order.orderStatus);
                                        return (
                                            <div
                                                key={order.id || order.orderNumber}
                                                className="list-group-item border-0"
                                            >
                                                {/* En-tête de commande */}
                                                <div
                                                    className="d-flex justify-content-between align-items-center mb-3 cursor-pointer"
                                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <div className={`bg-${statusColor}-subtle rounded p-2 me-3`}>
                                                            <i className={`bi bi-receipt text-${statusColor}`}></i>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-1 fw-bold">{order.orderNumber}</h6>
                                                            <small className="text-muted">
                                                                {formatOrderDate(order.orderDate)}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <span className={`badge bg-${statusColor}`}>
                                                            {getStatusLabel(order.orderStatus)}
                                                        </span>
                                                        <span className="fw-bold">
                                                            {formatCurrency(order.totalAmount)}
                                                        </span>
                                                        <i className={`bi bi-chevron-${expandedOrder === order.id ? 'up' : 'down'} text-muted`}></i>
                                                    </div>
                                                </div>

                                                {/* Détails de commande (dépliables) */}
                                                {expandedOrder === order.id && (
                                                    <div className="ps-5 border-start border-2 border-light">
                                                        {/* Adresse */}
                                                        <div className="mb-3">
                                                            <h6 className="text-muted mb-2">
                                                                <i className="bi bi-geo-alt me-2"></i>
                                                                Adresse de livraison
                                                            </h6>
                                                            <p className="mb-0">{order.shippingAddress || 'Non spécifiée'}</p>
                                                        </div>

                                                        {/* Articles */}
                                                        {order.items && order.items.length > 0 && (
                                                            <div className="mb-3">
                                                                <h6 className="text-muted mb-2">
                                                                    <i className="bi bi-list-check me-2"></i>
                                                                    Articles ({order.items.length})
                                                                </h6>
                                                                <div className="table-responsive">
                                                                    <table className="table table-sm table-borderless">
                                                                        <thead>
                                                                        <tr className="text-muted">
                                                                            <th>Produit</th>
                                                                            <th className="text-end">Qté</th>
                                                                            <th className="text-end">Prix</th>
                                                                            <th className="text-end">Total</th>
                                                                        </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                        {order.items.map((item, index) => (
                                                                            <tr key={index}>
                                                                                <td>
                                                                                    <div>
                                                                                        <strong>{item.productName || 'Produit'}</strong>
                                                                                        {item.productId && (
                                                                                            <small className="d-block text-muted">
                                                                                                Ref: {item.productId}
                                                                                            </small>
                                                                                        )}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="text-end">{item.quantity || 1}</td>
                                                                                <td className="text-end">{formatCurrency(item.unitPrice || 0)}</td>
                                                                                <td className="text-end fw-bold">{formatCurrency(item.totalPrice || 0)}</td>
                                                                            </tr>
                                                                        ))}
                                                                        </tbody>
                                                                        <tfoot>
                                                                        <tr className="border-top">
                                                                            <td colSpan="3" className="text-end fw-bold">
                                                                                Total commande
                                                                            </td>
                                                                            <td className="text-end fw-bold text-dark">
                                                                                {formatCurrency(order.totalAmount)}
                                                                            </td>
                                                                        </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Informations client */}
                                                        <div className="bg-light rounded p-3">
                                                            <h6 className="text-muted mb-2">
                                                                <i className="bi bi-person-circle me-2"></i>
                                                                Informations client
                                                            </h6>
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <small className="text-muted d-block">Nom</small>
                                                                    <p className="mb-2">{order.userName || user.username}</p>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <small className="text-muted d-block">Email</small>
                                                                    <p className="mb-0">{order.userEmail || user.email}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="card-footer bg-white border-0">
                                        <nav aria-label="Navigation">
                                            <ul className="pagination justify-content-center mb-0">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link border-0"
                                                        onClick={() => paginate(currentPage - 1)}
                                                    >
                                                        <i className="bi bi-chevron-left"></i>
                                                    </button>
                                                </li>

                                                {[...Array(totalPages)].map((_, index) => {
                                                    const pageNumber = index + 1;
                                                    if (pageNumber === currentPage) {
                                                        return (
                                                            <li key={pageNumber} className="page-item active">
                                                                <button className="page-link border-0 bg-dark">
                                                                    {pageNumber}
                                                                </button>
                                                            </li>
                                                        );
                                                    }
                                                    return null;
                                                })}

                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link border-0"
                                                        onClick={() => paginate(currentPage + 1)}
                                                    >
                                                        <i className="bi bi-chevron-right"></i>
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-4 text-center">
                    <button
                        onClick={() => navigate('/shop')}
                        className="btn btn-dark px-4"
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Nouvelle commande
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="container mt-5">
                <div className="text-center text-muted py-3">
                    <p className="mb-0">
                        © {new Date().getFullYear()} VotreEntreprise. Tous droits réservés.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyOrders;