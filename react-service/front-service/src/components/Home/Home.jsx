// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import catalogueService from '../../services/catalogueService';
import reviewService from '../../services/reviewService';

export default function Home() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(false);

    // Orders/History State
    const [recentOrders, setRecentOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null
    });

    // ALL REVIEWS STATE - NOUVEAU
    const [allReviews, setAllReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);

    // Load data on component mount
    useEffect(() => {
        if (user?.id) {
            loadUserData();
            loadAllReviews(); // NOUVEAU - Charger tous les reviews
        }
    }, [user?.id]);

    // NOUVELLE FONCTION - Charger tous les reviews
    const loadAllReviews = async () => {
        try {
            setReviewsLoading(true);
            console.log('🔍 Chargement de tous les reviews...');

            const reviews = await reviewService.getAllReviews();
            console.log(`✅ ${reviews.length} reviews chargés`);

            setAllReviews(reviews);
        } catch (error) {
            console.error('❌ Erreur chargement reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    // Load user orders and statistics
    const loadUserData = async () => {
        try {
            setOrdersLoading(true);

            // Load order history
            const historyData = await catalogueService.getUserOrderHistory(user.id);

            // Format data
            let ordersList = [];
            if (Array.isArray(historyData)) {
                ordersList = historyData;
            } else if (historyData && Array.isArray(historyData.orders)) {
                ordersList = historyData.orders;
            } else if (historyData && Array.isArray(historyData.history)) {
                ordersList = historyData.history;
            }

            // Sort by date and get recent orders
            ordersList.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            setRecentOrders(ordersList.slice(0, 5)); // Last 5 orders

            // Calculate statistics
            const totalOrders = ordersList.length;
            const totalSpent = ordersList.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
            const lastOrder = ordersList[0];

            setStats({
                totalOrders,
                totalSpent,
                averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
                lastOrderDate: lastOrder?.orderDate,
                lastOrderNumber: lastOrder?.orderNumber
            });

            // Create notifications from recent orders
            createNotificationsFromOrders(ordersList);

        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Create notifications from orders
    const createNotificationsFromOrders = (ordersList) => {
        const orderNotifications = ordersList.map(order => ({
            id: `order-${order.id || order.orderNumber}`,
            type: getOrderNotificationType(order.orderStatus),
            title: getOrderNotificationTitle(order.orderStatus, order.orderNumber),
            message: getOrderNotificationMessage(order),
            time: getTimeAgo(order.orderDate),
            read: false,
            orderId: order.orderNumber,
            orderNumber: order.orderNumber,
            orderDate: order.orderDate,
            totalAmount: order.totalAmount,
            orderStatus: order.orderStatus,
            createdAt: order.orderDate
        }));

        // Add system notifications
        const systemNotifications = [
            {
                id: 'welcome-1',
                type: 'SYSTEM',
                title: 'Bienvenue sur YOURCAR',
                message: 'Profitez de nos meilleures offres sur les voitures',
                time: 'Il y a 1 jour',
                read: true,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        const allNotifications = [...orderNotifications, ...systemNotifications];

        // Sort by date (newest first)
        allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setNotifications(allNotifications);
        setNotificationCount(allNotifications.filter(n => !n.read && n.type !== 'SYSTEM').length);
    };

    // Helper functions for notifications
    const getOrderNotificationType = (status) => {
        const types = {
            'PENDING': 'ORDER_CREATED',
            'CONFIRMED': 'ORDER_CONFIRMED',
            'PROCESSING': 'ORDER_PROCESSING',
            'SHIPPED': 'ORDER_SHIPPED',
            'DELIVERED': 'ORDER_DELIVERED',
            'CANCELLED': 'ORDER_CANCELLED'
        };
        return types[status] || 'ORDER_CREATED';
    };

    const getOrderNotificationTitle = (status, orderNumber) => {
        const titles = {
            'PENDING': 'Commande créée',
            'CONFIRMED': 'Commande confirmée',
            'PROCESSING': 'Commande en traitement',
            'SHIPPED': 'Commande expédiée',
            'DELIVERED': 'Commande livrée',
            'CANCELLED': 'Commande annulée'
        };
        return `${titles[status] || 'Mise à jour commande'} #${orderNumber}`;
    };

    const getOrderNotificationMessage = (order) => {
        const amount = formatCurrency(order.totalAmount);

        const messages = {
            'PENDING': `Votre commande #${order.orderNumber} d'un montant de ${amount} est en attente de confirmation.`,
            'CONFIRMED': `Votre commande #${order.orderNumber} d'un montant de ${amount} a été confirmée.`,
            'PROCESSING': `Votre commande #${order.orderNumber} est en cours de traitement.`,
            'SHIPPED': `Votre commande #${order.orderNumber} a été expédiée. Vous recevrez bientôt votre colis.`,
            'DELIVERED': `Votre commande #${order.orderNumber} a été livrée avec succès. Merci pour votre confiance !`,
            'CANCELLED': `Votre commande #${order.orderNumber} a été annulée.`
        };

        return messages[order.orderStatus] || `Mise à jour sur votre commande #${order.orderNumber}`;
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return "Date inconnue";

        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "À l'instant";
        if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
        if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
        if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;

        return `Le ${formatDate(dateString)}`;
    };

    // Mark notification as read
    const handleMarkAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
        setNotificationCount(prev => Math.max(0, prev - 1));
    };

    // Mark all as read
    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setNotificationCount(0);
    };

    // Navigate to order details
    const handleViewOrder = (orderNumber) => {
        navigate(`/my-orders?order=${orderNumber}`);
        setShowNotifications(false);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "Date inconnue";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    // Get notification icon by type
    const getNotificationIcon = (type) => {
        const icons = {
            'ORDER_CREATED': '📦',
            'ORDER_CONFIRMED': '✅',
            'ORDER_PROCESSING': '⚙️',
            'ORDER_SHIPPED': '🚚',
            'ORDER_DELIVERED': '🎉',
            'ORDER_CANCELLED': '❌',
            'PAYMENT_SUCCESS': '💰',
            'PAYMENT_FAILED': '💸',
            'PROMOTION': '🎁',
            'SYSTEM': '🔔',
            'SECURITY': '🛡️',
            'ACCOUNT': '👤'
        };
        return icons[type] || '🔔';
    };

    // Get notification color by type
    const getNotificationColor = (type) => {
        const colors = {
            'ORDER_CREATED': '#4CAF50',
            'ORDER_CONFIRMED': '#2196F3',
            'ORDER_PROCESSING': '#FF9800',
            'ORDER_SHIPPED': '#9C27B0',
            'ORDER_DELIVERED': '#4CAF50',
            'ORDER_CANCELLED': '#F44336',
            'PAYMENT_SUCCESS': '#4CAF50',
            'PAYMENT_FAILED': '#F44336',
            'PROMOTION': '#FF9800',
            'SYSTEM': '#607D8B',
            'SECURITY': '#673AB7',
            'ACCOUNT': '#2196F3'
        };
        return colors[type] || '#666';
    };

    // NOUVELLE FONCTION - Rendu des étoiles pour reviews
    const renderStars = (rating) => {
        return (
            <div style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} style={styles.star}>
                        {star <= rating ? '⭐' : '☆'}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={styles.logoSection}>
                        <h1 style={styles.logo}>YOURCAR</h1>
                        <p style={styles.tagline}>La simplicité est la forme ultime de l'intelligence</p>
                    </div>

                    <nav style={styles.nav}>
                        <button
                            style={styles.navBtn}
                            onClick={() => navigate('/')}
                        >
                            HOME
                        </button>



                        {/* NOUVEAU BOUTON - Tous les Avis */}


                        <button
                            style={styles.navBtn}
                            onClick={() => navigate('/shop')}
                        >
                            PRODUCTS
                        </button>
                        <button
                            style={styles.navBtn}
                            onClick={() => navigate('/about')}
                        >
                            ABOUT
                        </button>
                        <button
                            style={styles.navBtn}
                            onClick={() => navigate('/location')}
                        >
                            LOCATION
                        </button>
                        <button
                            style={styles.navBtn}
                            onClick={() => navigate('/my-orders')}
                        >
                            Historique
                        </button>
                        <button
                            style={styles.navBtn}
                            onClick={() => navigate('/MyReviews')}
                        >
                            Mes Avis
                        </button>

                        {/* NOUVEAU BOUTON - Tous les Avis */}
                        <button
                            style={{
                                ...styles.navBtn,
                                color: showAllReviews ? '#667eea' : '#666666',
                                fontWeight: showAllReviews ? '600' : '500'
                            }}
                            onClick={() => setShowAllReviews(!showAllReviews)}
                        >
                            📝 Tous les Avis
                        </button>

                        {/* Notification Bell */}
                        <div style={styles.notificationContainer}>
                            <button
                                style={styles.notificationBtn}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                🔔
                                {notificationCount > 0 && (
                                    <span style={styles.notificationBadge}>{notificationCount}</span>
                                )}
                            </button>

                            {showNotifications && (
                                <div style={styles.notificationDropdown}>
                                    <div style={styles.notificationHeader}>
                                        <h4 style={styles.notificationTitle}>Notifications</h4>
                                        <div style={styles.notificationActions}>
                                            <button
                                                style={styles.notificationActionBtn}
                                                onClick={handleMarkAllAsRead}
                                                disabled={notificationCount === 0}
                                            >
                                                Tout lire
                                            </button>
                                        </div>
                                    </div>

                                    <div style={styles.notificationList}>
                                        {notifications.length === 0 ? (
                                            <div style={styles.emptyNotifications}>
                                                <div style={styles.emptyIcon}>🔕</div>
                                                <p style={styles.emptyText}>Aucune notification</p>
                                                <small style={styles.emptySubtext}>
                                                    Vos notifications de commandes apparaîtront ici
                                                </small>
                                            </div>
                                        ) : (
                                            notifications.map(notification => (
                                                <div
                                                    key={notification.id}
                                                    style={{
                                                        ...styles.notificationItem,
                                                        ...(!notification.read && styles.unreadNotification),
                                                        borderLeft: `4px solid ${getNotificationColor(notification.type)}`
                                                    }}
                                                    onClick={() => {
                                                        if (notification.orderId) {
                                                            handleViewOrder(notification.orderId);
                                                        }
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                >
                                                    <div style={{
                                                        ...styles.notificationIcon,
                                                        backgroundColor: `${getNotificationColor(notification.type)}20`
                                                    }}>
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div style={styles.notificationContent}>
                                                        <div style={styles.notificationHeaderRow}>
                                                            <h5 style={styles.notificationItemTitle}>
                                                                {notification.title}
                                                            </h5>
                                                            {!notification.read && (
                                                                <div style={{
                                                                    ...styles.unreadDot,
                                                                    backgroundColor: getNotificationColor(notification.type)
                                                                }}></div>
                                                            )}
                                                        </div>
                                                        <p style={styles.notificationMessage}>
                                                            {notification.message}
                                                        </p>
                                                        <div style={styles.notificationFooter}>
                                                            <small style={styles.notificationTime}>
                                                                {notification.time}
                                                            </small>
                                                            {notification.orderNumber && (
                                                                <small style={styles.orderReference}>
                                                                    Commande #{notification.orderNumber}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {notifications.length > 0 && (
                                        <div style={styles.notificationFooter}>
                                            <button
                                                style={styles.viewAllBtn}
                                                onClick={() => navigate('/my-orders')}
                                            >
                                                Voir toutes les commandes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Profile Button */}
                        <button
                            style={styles.userBtn}
                            onClick={() => navigate('/profile')}
                        >
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </button>
                    </nav>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main style={styles.main}>
                {/* NOUVELLE SECTION - Affichage conditionnel */}
                {showAllReviews ? (
                    // TOUS LES AVIS - NOUVELLE SECTION
                    <div style={styles.allReviewsSection}>
                        <div style={styles.allReviewsHeader}>
                            <h1 style={styles.allReviewsTitle}>
                                📝 Tous les Avis de la Communauté
                            </h1>
                            <p style={styles.allReviewsSubtitle}>
                                Découvrez les avis de tous les utilisateurs sur nos produits
                            </p>
                        </div>

                        {/* Statistiques des reviews */}
                        <div style={styles.reviewStatsGrid}>
                            <div style={styles.reviewStatCard}>
                                <div style={styles.statIcon}>📊</div>
                                <div style={styles.statContent}>
                                    <h3 style={styles.statNumber}>{allReviews.length}</h3>
                                    <p style={styles.statLabel}>Avis totaux</p>
                                </div>
                            </div>

                            <div style={styles.reviewStatCard}>
                                <div style={styles.statIcon}>⭐</div>
                                <div style={styles.statContent}>
                                    <h3 style={styles.statNumber}>
                                        {allReviews.length > 0
                                            ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
                                            : '0.0'}
                                    </h3>
                                    <p style={styles.statLabel}>Note moyenne</p>
                                </div>
                            </div>

                            <div style={styles.reviewStatCard}>
                                <div style={styles.statIcon}>👥</div>
                                <div style={styles.statContent}>
                                    <h3 style={styles.statNumber}>
                                        {new Set(allReviews.map(r => r.userId)).size}
                                    </h3>
                                    <p style={styles.statLabel}>Utilisateurs actifs</p>
                                </div>
                            </div>
                        </div>

                        {/* Liste des reviews */}
                        <div style={styles.allReviewsCard}>
                            {reviewsLoading ? (
                                <div style={styles.loadingContainer}>
                                    <div style={styles.spinner}></div>
                                    <p>Chargement des avis...</p>
                                </div>
                            ) : allReviews.length === 0 ? (
                                <div style={styles.emptyReviews}>
                                    <div style={styles.emptyIcon}>💬</div>
                                    <h3>Aucun avis disponible</h3>
                                    <p>Soyez le premier à donner votre avis sur nos produits !</p>
                                    <button
                                        style={styles.shopBtn}
                                        onClick={() => {
                                            setShowAllReviews(false);
                                            navigate('/shop');
                                        }}
                                    >
                                        Découvrir nos produits
                                    </button>
                                </div>
                            ) : (
                                <div style={styles.reviewsGrid}>
                                    {allReviews.map((review, index) => (
                                        <div key={review.id || index} style={styles.reviewCard}>
                                            {/* Header du review */}
                                            <div style={styles.reviewCardHeader}>
                                                <div style={styles.reviewUserInfo}>
                                                    <div style={styles.reviewUserAvatar}>
                                                        {(review.userName?.charAt(0) || 'U').toUpperCase()}
                                                    </div>
                                                    <div style={styles.reviewUserDetails}>
                                                        <h4 style={styles.reviewUserName}>
                                                            {review.userName || `Utilisateur ${review.userId}`}
                                                        </h4>
                                                        <small style={styles.reviewDate}>
                                                            {reviewService.formatReviewDate(review.createdAt)}
                                                        </small>
                                                    </div>
                                                </div>
                                                {renderStars(review.rating)}
                                            </div>

                                            {/* Nom du produit */}
                                            <div style={styles.reviewProductName}>
                                                <span style={styles.productIcon}>🚗</span>
                                                <strong>
                                                    {review.productName || `Produit #${review.productId}`}
                                                </strong>
                                            </div>

                                            {/* Commentaire */}
                                            <p style={styles.reviewComment}>
                                                {review.comment}
                                            </p>

                                            {/* Footer du review */}
                                            <div style={styles.reviewCardFooter}>
                                                <span style={styles.reviewId}>
                                                    Review #{review.id}
                                                </span>
                                                <span style={styles.reviewProductId}>
                                                    Produit ID: {review.productId}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bouton retour au dashboard */}
                        <div style={styles.backToDashboard}>
                            <button
                                style={styles.backBtn}
                                onClick={() => setShowAllReviews(false)}
                            >
                                ← Retour au Dashboard
                            </button>
                        </div>
                    </div>
                ) : (
                    // DASHBOARD NORMAL (CODE ORIGINAL)
                    <>
                        {/* Welcome Section */}
                        <div style={styles.welcomeSection}>
                            <h1 style={styles.welcomeTitle}>
                                Bienvenue, {user?.username || 'Client'} 👋
                            </h1>
                            <p style={styles.welcomeSubtitle}>
                                Découvrez vos dernières commandes et statistiques
                            </p>
                        </div>

                        {/* Dashboard Stats */}
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>📦</div>
                                <div style={styles.statContent}>
                                    <h3 style={styles.statNumber}>{stats.totalOrders}</h3>
                                    <p style={styles.statLabel}>Commandes totales</p>
                                </div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>💰</div>
                                <div style={styles.statContent}>
                                    <h3 style={styles.statNumber}>{formatCurrency(stats.totalSpent)}</h3>
                                    <p style={styles.statLabel}>Total dépensé</p>
                                </div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>📊</div>
                                <div style={styles.statContent}>
                                    <h3 style={styles.statNumber}>
                                        {formatCurrency(stats.averageOrderValue)}
                                    </h3>
                                    <p style={styles.statLabel}>Moyenne par commande</p>
                                </div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>📅</div>
                                <div style={styles.statContent}>
                                    <h3 style={styles.statNumber}>
                                        {stats.lastOrderDate ? formatDate(stats.lastOrderDate) : 'Aucune'}
                                    </h3>
                                    <p style={styles.statLabel}>Dernière commande</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div style={styles.contentArea}>
                            {/* Left Column: Recent Orders */}
                            <div style={styles.leftColumn}>
                                <div style={styles.sectionCard}>
                                    <div style={styles.sectionHeader}>
                                        <h2 style={styles.sectionTitle}>Dernières commandes</h2>
                                        <button
                                            style={styles.viewAllLink}
                                            onClick={() => navigate('/my-orders')}
                                        >
                                            Voir tout →
                                        </button>
                                    </div>

                                    {ordersLoading ? (
                                        <div style={styles.loadingContainer}>
                                            <div style={styles.spinner}></div>
                                            <p>Chargement des commandes...</p>
                                        </div>
                                    ) : recentOrders.length === 0 ? (
                                        <div style={styles.emptyState}>
                                            <div style={styles.emptyIcon}>📦</div>
                                            <h4>Aucune commande récente</h4>
                                            <p>Commencez vos achats dès maintenant</p>
                                            <button
                                                style={styles.shopBtn}
                                                onClick={() => navigate('/shop')}
                                            >
                                                Découvrir la boutique
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={styles.ordersList}>
                                            {recentOrders.map(order => (
                                                <div key={order.id || order.orderNumber} style={styles.orderCard}>
                                                    <div style={styles.orderHeader}>
                                                        <div style={styles.orderInfo}>
                                                            <div style={styles.orderNumber}>
                                                                <strong>Commande #{order.orderNumber}</strong>
                                                            </div>
                                                            <div style={styles.orderDate}>
                                                                {formatDate(order.orderDate)}
                                                            </div>
                                                        </div>
                                                        <div style={styles.orderStatus}>
                                                            <span style={{
                                                                ...styles.statusBadge,
                                                                backgroundColor:
                                                                    order.orderStatus === 'DELIVERED' ? '#4CAF50' :
                                                                        order.orderStatus === 'PENDING' ? '#FF9800' :
                                                                            order.orderStatus === 'CANCELLED' ? '#F44336' :
                                                                                order.orderStatus === 'SHIPPED' ? '#9C27B0' :
                                                                                    '#2196F3'
                                                            }}>
                                                                {order.orderStatus === 'PENDING' ? 'En attente' :
                                                                    order.orderStatus === 'DELIVERED' ? 'Livrée' :
                                                                        order.orderStatus === 'SHIPPED' ? 'Expédiée' :
                                                                            order.orderStatus === 'CANCELLED' ? 'Annulée' :
                                                                                order.orderStatus === 'CONFIRMED' ? 'Confirmée' :
                                                                                    order.orderStatus === 'PROCESSING' ? 'En traitement' :
                                                                                        order.orderStatus}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div style={styles.orderDetails}>
                                                        <div style={styles.orderAmount}>
                                                            <strong>{formatCurrency(order.totalAmount)}</strong>
                                                        </div>

                                                        {order.shippingAddress && (
                                                            <p style={styles.orderAddress}>
                                                                <small>📍 {order.shippingAddress}</small>
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div style={styles.orderActions}>
                                                        <button
                                                            style={styles.detailsBtn}
                                                            onClick={() => handleViewOrder(order.orderNumber)}
                                                        >
                                                            Voir les détails
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Quick Actions */}
                            <div style={styles.rightColumn}>
                                <div style={styles.sectionCard}>
                                    <h2 style={styles.sectionTitle}>Actions rapides</h2>
                                    <div style={styles.actionsGrid}>
                                        <button
                                            style={styles.quickActionBtn}
                                            onClick={() => navigate('/shop')}
                                        >
                                            <span style={styles.actionIcon}>🛒</span>
                                            <div style={styles.actionContent}>
                                                <strong>Nouvel achat</strong>
                                                <small>Parcourir les produits</small>
                                            </div>
                                        </button>
                                        <button
                                            style={styles.quickActionBtn}
                                            onClick={() => navigate('/profile')}
                                        >
                                            <span style={styles.actionIcon}>👤</span>
                                            <div style={styles.actionContent}>
                                                <strong>Mon profil</strong>
                                                <small>Gérer mon compte</small>
                                            </div>
                                        </button>
                                        <button
                                            style={styles.quickActionBtn}
                                            onClick={() => navigate('/my-orders')}
                                        >
                                            <span style={styles.actionIcon}>📋</span>
                                            <div style={styles.actionContent}>
                                                <strong>Historique</strong>
                                                <small>Voir toutes les commandes</small>
                                            </div>
                                        </button>
                                        <button
                                            style={styles.quickActionBtn}
                                            onClick={() => logout().then(() => navigate('/login'))}
                                        >
                                            <span style={styles.actionIcon}>🚪</span>
                                            <div style={styles.actionContent}>
                                                <strong>Déconnexion</strong>
                                                <small>Quitter la session</small>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Notifications Summary */}
                                {notifications.length > 0 && (
                                    <div style={styles.sectionCard}>
                                        <div style={styles.sectionHeader}>
                                            <h2 style={styles.sectionTitle}>Notifications récentes</h2>
                                            {notificationCount > 0 && (
                                                <span style={styles.notificationCountBadge}>
                                                    {notificationCount} non lue{notificationCount > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>

                                        <div style={styles.notificationsSummary}>
                                            {notifications.slice(0, 3).map(notification => (
                                                <div
                                                    key={notification.id}
                                                    style={{
                                                        ...styles.notificationSummaryItem,
                                                        ...(!notification.read && styles.unreadSummaryItem)
                                                    }}
                                                    onClick={() => {
                                                        if (notification.orderId) {
                                                            handleViewOrder(notification.orderId);
                                                        }
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                >
                                                    <div style={{
                                                        ...styles.summaryIcon,
                                                        backgroundColor: `${getNotificationColor(notification.type)}20`
                                                    }}>
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div style={styles.summaryContent}>
                                                        <h5 style={styles.summaryTitle}>{notification.title}</h5>
                                                        <p style={styles.summaryMessage}>{notification.message}</p>
                                                        <small style={styles.summaryTime}>{notification.time}</small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* FOOTER */}
            <footer style={styles.footer}>
                <p>© 2025 YOURCAR. Tous droits réservés.</p>
            </footer>
        </div>
    );
}

// Styles
const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#F8F9FA',
        fontFamily: "'Segoe UI', Arial, sans-serif"
    },
    header: {
        backgroundColor: '#FFFFFF',
        padding: '15px 40px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
    },
    headerContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logoSection: {
        display: 'flex',
        flexDirection: 'column'
    },
    logo: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#333333',
        margin: '0 0 5px 0',
        letterSpacing: '2px'
    },
    tagline: {
        fontSize: '12px',
        color: '#666666',
        letterSpacing: '1px',
        margin: 0
    },
    nav: {
        display: 'flex',
        gap: '25px',
        alignItems: 'center',
        position: 'relative'
    },
    navBtn: {
        background: 'none',
        border: 'none',
        fontSize: '14px',
        fontWeight: '500',
        color: '#666666',
        cursor: 'pointer',
        padding: '8px 0',
        transition: 'color 0.3s'
    },
    notificationContainer: {
        position: 'relative'
    },
    notificationBtn: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        position: 'relative',
        padding: '8px',
        transition: 'transform 0.3s'
    },
    notificationBadge: {
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        backgroundColor: '#FF4757',
        color: 'white',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        fontSize: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    },
    notificationDropdown: {
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: 'white',
        boxShadow: '0 5px 30px rgba(0,0,0,0.15)',
        borderRadius: '15px',
        width: '450px',
        zIndex: 1000,
        marginTop: '10px',
        overflow: 'hidden'
    },
    notificationHeader: {
        padding: '20px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9ff'
    },
    notificationTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
        color: '#333'
    },
    notificationActions: {
        display: 'flex',
        gap: '10px'
    },
    notificationActionBtn: {
        background: 'none',
        border: 'none',
        color: '#667eea',
        fontSize: '12px',
        cursor: 'pointer',
        padding: '5px 10px',
        borderRadius: '5px',
        transition: 'background 0.3s'
    },
    notificationList: {
        maxHeight: '500px',
        overflowY: 'auto'
    },
    emptyNotifications: {
        padding: '40px 20px',
        textAlign: 'center'
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '15px',
        opacity: 0.5
    },
    emptyText: {
        color: '#666',
        margin: '0 0 10px 0',
        fontSize: '16px'
    },
    emptySubtext: {
        color: '#999',
        fontSize: '14px'
    },
    notificationItem: {
        padding: '15px 20px',
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        transition: 'all 0.3s',
        position: 'relative',
        backgroundColor: 'white'
    },
    unreadNotification: {
        backgroundColor: '#f8f9ff'
    },
    notificationIcon: {
        fontSize: '20px',
        marginRight: '15px',
        marginTop: '2px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    notificationContent: {
        flex: 1
    },
    notificationHeaderRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px'
    },
    notificationItemTitle: {
        margin: 0,
        fontSize: '14px',
        fontWeight: '600',
        color: '#333'
    },
    notificationMessage: {
        margin: '0 0 10px 0',
        fontSize: '13px',
        color: '#666',
        lineHeight: 1.4
    },
    notificationFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    notificationTime: {
        fontSize: '11px',
        color: '#999'
    },
    orderReference: {
        fontSize: '11px',
        color: '#667eea',
        fontWeight: '600'
    },
    unreadDot: {
        width: '8px',
        height: '8px',
        backgroundColor: '#667eea',
        borderRadius: '50%',
        flexShrink: 0,
        marginLeft: '10px'
    },
    viewAllBtn: {
        background: '#667eea',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        width: '100%'
    },
    userBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#333333',
        color: 'white',
        border: 'none',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    main: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '30px 40px'
    },
    welcomeSection: {
        marginBottom: '30px'
    },
    welcomeTitle: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#333',
        margin: '0 0 10px 0'
    },
    welcomeSubtitle: {
        fontSize: '16px',
        color: '#666',
        margin: 0
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        transition: 'transform 0.3s',
        cursor: 'pointer'
    },
    statIcon: {
        fontSize: '32px',
        width: '60px',
        height: '60px',
        backgroundColor: '#f8f9ff',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    statContent: {
        flex: 1
    },
    statNumber: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#333',
        margin: '0 0 5px 0'
    },
    statLabel: {
        fontSize: '14px',
        color: '#666',
        margin: 0
    },
    contentArea: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px'
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
    },
    rightColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
    },
    sectionCard: {
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#333',
        margin: 0
    },
    viewAllLink: {
        background: 'none',
        border: 'none',
        color: '#667eea',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        padding: '5px 10px'
    },
    loadingContainer: {
        padding: '40px 20px',
        textAlign: 'center'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 15px'
    },
    emptyState: {
        padding: '40px 20px',
        textAlign: 'center'
    },
    shopBtn: {
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        marginTop: '15px'
    },
    ordersList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    orderCard: {
        padding: '20px',
        border: '1px solid #f0f0f0',
        borderRadius: '10px',
        transition: 'all 0.3s'
    },
    orderHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px'
    },
    orderInfo: {
        flex: 1
    },
    orderNumber: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '5px'
    },
    orderDate: {
        fontSize: '13px',
        color: '#999',
        margin: 0
    },
    orderStatus: {
        fontSize: '12px'
    },
    statusBadge: {
        padding: '5px 12px',
        borderRadius: '15px',
        color: 'white',
        fontSize: '11px',
        fontWeight: '600'
    },
    orderDetails: {
        marginBottom: '15px'
    },
    orderAmount: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '10px'
    },
    orderAddress: {
        fontSize: '13px',
        color: '#666',
        margin: 0
    },
    orderActions: {
        textAlign: 'right'
    },
    detailsBtn: {
        background: 'none',
        border: '1px solid #667eea',
        color: '#667eea',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        transition: 'all 0.3s'
    },
    actionsGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    quickActionBtn: {
        backgroundColor: '#f8f9ff',
        border: 'none',
        padding: '15px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        transition: 'all 0.3s',
        textAlign: 'left'
    },
    actionIcon: {
        fontSize: '24px',
        width: '40px',
        height: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    actionContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '3px'
    },
    notificationCountBadge: {
        backgroundColor: '#FF4757',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        padding: '4px 8px',
        borderRadius: '12px'
    },
    notificationsSummary: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    notificationSummaryItem: {
        padding: '12px',
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        transition: 'all 0.3s'
    },
    unreadSummaryItem: {
        backgroundColor: '#f8f9ff',
        borderColor: '#667eea'
    },
    summaryIcon: {
        fontSize: '18px',
        marginTop: '2px',
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    summaryContent: {
        flex: 1
    },
    summaryTitle: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#333',
        margin: '0 0 4px 0'
    },
    summaryMessage: {
        fontSize: '12px',
        color: '#666',
        margin: '0 0 4px 0',
        lineHeight: 1.3
    },
    summaryTime: {
        fontSize: '11px',
        color: '#999'
    },
    footer: {
        padding: '30px 40px',
        textAlign: 'center',
        color: '#666666',
        fontSize: '14px',
        borderTop: '1px solid #E0E0E0',
        marginTop: '50px'
    },

    // ========== NOUVEAUX STYLES POUR LA SECTION "TOUS LES AVIS" ==========
    allReviewsSection: {
        width: '100%'
    },
    allReviewsHeader: {
        marginBottom: '30px',
        textAlign: 'center'
    },
    allReviewsTitle: {
        fontSize: '36px',
        fontWeight: '700',
        color: '#333',
        margin: '0 0 10px 0'
    },
    allReviewsSubtitle: {
        fontSize: '16px',
        color: '#666',
        margin: 0
    },
    reviewStatsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
    },
    reviewStatCard: {
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        transition: 'transform 0.3s',
        cursor: 'default'
    },
    allReviewsCard: {
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '30px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
        marginBottom: '30px'
    },
    emptyReviews: {
        padding: '60px 20px',
        textAlign: 'center'
    },
    reviewsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
    },
    reviewCard: {
        backgroundColor: '#f8f9ff',
        border: '2px solid #e8e9f3',
        borderRadius: '12px',
        padding: '20px',
        transition: 'all 0.3s',
        cursor: 'pointer'
    },
    reviewCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e8e9f3'
    },
    reviewUserInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    reviewUserAvatar: {
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        backgroundColor: '#667eea',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        flexShrink: 0
    },
    reviewUserDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '3px'
    },
    reviewUserName: {
        margin: 0,
        fontSize: '15px',
        fontWeight: '600',
        color: '#333'
    },
    reviewDate: {
        fontSize: '12px',
        color: '#999'
    },
    starsContainer: {
        display: 'flex',
        gap: '3px',
        alignItems: 'center'
    },
    star: {
        fontSize: '16px',
        color: '#FFD700'
    },
    reviewProductName: {
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        color: '#333'
    },
    productIcon: {
        fontSize: '20px'
    },
    reviewComment: {
        fontSize: '14px',
        lineHeight: 1.6,
        color: '#555',
        margin: '0 0 15px 0',
        minHeight: '60px'
    },
    reviewCardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #e8e9f3'
    },
    reviewId: {
        fontSize: '11px',
        color: '#999',
        fontWeight: '500'
    },
    reviewProductId: {
        fontSize: '11px',
        color: '#667eea',
        fontWeight: '600'
    },
    backToDashboard: {
        textAlign: 'center',
        marginTop: '20px'
    },
    backBtn: {
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        padding: '12px 30px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s'
    }
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    button:hover {
        opacity: 0.8;
    }
    
    .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    
    .order-card:hover {
        border-color: #667eea;
        box-shadow: 0 3px 15px rgba(102, 126, 234, 0.1);
    }
    
    .quick-action-btn:hover {
        background-color: #667eea !important;
        color: white !important;
        transform: translateY(-2px);
    }
    
    .notification-summary-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    }
    
    .notification-item:hover {
        background-color: #f8f9ff !important;
    }
`;
document.head.appendChild(styleSheet);