import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [notificationCount, setNotificationCount] = useState(3);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const mockNotifications = [
            { id: 1, title: "Welcome!", message: "Welcome to YOURCAR platform", time: "Now", read: false },
            { id: 2, title: "Special Offer", message: "Get 20% off on your first purchase", time: "2 hours ago", read: false },
            { id: 3, title: "Update", message: "Profile successfully created", time: "1 day ago", read: true },
        ];
        setNotifications(mockNotifications);
        setNotificationCount(mockNotifications.filter(n => !n.read).length);
    }, []);

    const handleMarkAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
        setNotificationCount(prev => Math.max(0, prev - 1));
    };

    const features = [
        {
            icon: '🚀',
            title: 'Performance Maximale',
            description: 'Expérience ultra-fluide avec technologie de pointe',
            color: '#667eea'
        },
        {
            icon: '🔒',
            title: 'Sécurité Totale',
            description: 'Protection avancée de vos données',
            color: '#764ba2'
        },
        {
            icon: '💎',
            title: 'Design Premium',
            description: 'Interface élégante et intuitive',
            color: '#f093fb'
        }
    ];

    return (
        <div style={styles.container}>
            {/* Floating Gradient Background */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(102, 126, 234, 0.1) 0%, transparent 50%)`,
                zIndex: 0,
                transition: 'background 0.3s ease'
            }} />

            {/* HEADER - Identique au Profile */}
            <header style={{
                ...styles.header,
                backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.05)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : 'none'
            }}>
                <div style={styles.headerContent}>
                    <div style={styles.logoSection}>
                        <h1 style={styles.logo}>YOURCAR</h1>
                        <p style={styles.tagline}>La simplicité est la forme ultime de l'intelligence</p>
                    </div>

                    <nav style={styles.nav}>
                        <button style={styles.navBtnActive}>HOME</button>
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
                                        <button
                                            style={styles.clearBtn}
                                            onClick={() => {
                                                setNotifications(notifications.map(n => ({ ...n, read: true })));
                                                setNotificationCount(0);
                                            }}
                                        >
                                            Tout marquer comme lu
                                        </button>
                                    </div>
                                    <div style={styles.notificationList}>
                                        {notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                style={{
                                                    ...styles.notificationItem,
                                                    ...(!notification.read && styles.unreadNotification)
                                                }}
                                                onClick={() => handleMarkAsRead(notification.id)}
                                            >
                                                <div style={styles.notificationIcon}>📢</div>
                                                <div style={styles.notificationContent}>
                                                    <h5 style={styles.notificationItemTitle}>{notification.title}</h5>
                                                    <p style={styles.notificationMessage}>{notification.message}</p>
                                                    <small style={styles.notificationTime}>{notification.time}</small>
                                                </div>
                                                {!notification.read && (
                                                    <div style={styles.unreadDot}></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
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

            {/* HERO SECTION */}
            <section style={styles.heroSection}>
                <div style={styles.heroContent}>
                    <div style={styles.heroBadge}>
                        <div style={styles.badgeDot}></div>
                        PREMIUM EXPERIENCE
                    </div>

                    <h2 style={styles.heroSubtitle}>Welcome to</h2>
                    <h1 style={styles.heroTitle}>
                        Your<span style={styles.heroTitleAccent}>Car</span>
                    </h1>

                    <p style={styles.heroDescription}>
                        Experience automotive excellence redefined. Premium service,
                        exceptional quality, and unparalleled attention to detail.
                    </p>

                    <div style={styles.heroActions}>
                        <button
                            style={styles.heroPrimaryBtn}
                            onClick={() => navigate('/shop')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <span style={styles.btnIcon}>🚀</span>
                            Explore Collection
                        </button>
                        <button
                            style={styles.heroSecondaryBtn}
                            onClick={() => navigate('/my-orders')}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <span style={styles.btnIcon}>📋</span>
                            View Orders
                        </button>
                    </div>
                </div>
            </section>

            {/* USER WELCOME SECTION */}
            <section style={styles.userSection}>
                <div style={styles.userCard}>
                    <div style={styles.userAvatar}>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={styles.userInfo}>
                        <h3 style={styles.userGreeting}>Welcome back,</h3>
                        <h2 style={styles.userName}>{user?.username}</h2>
                        <p style={styles.userEmail}>{user?.email}</p>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section style={styles.featuresSection}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
                    <p style={styles.sectionSubtitle}>
                        Premium features for an exceptional experience
                    </p>
                </div>

                <div style={styles.featuresGrid}>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            style={styles.featureCard}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                            }}
                        >
                            <div style={{
                                ...styles.featureIcon,
                                backgroundColor: `${feature.color}15`
                            }}>
                                <span style={{ fontSize: '32px' }}>{feature.icon}</span>
                            </div>
                            <h3 style={styles.featureTitle}>{feature.title}</h3>
                            <p style={styles.featureDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* QUICK ACTIONS SECTION */}
            <section style={styles.actionsSection}>
                <div style={styles.actionsGrid}>
                    <button
                        style={styles.actionBtn}
                        onClick={() => navigate('/shop')}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        🛍️ Shop Now
                    </button>
                    <button
                        style={styles.actionBtn}
                        onClick={() => navigate('/my-orders')}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        📋 View Orders
                    </button>
                    <button
                        style={styles.actionBtn}
                        onClick={() => navigate('/profile')}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        ⚙️ Settings
                    </button>
                </div>
            </section>

            {/* FOOTER - Identique au Profile */}
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <div style={styles.footerLogo}>
                        <h3 style={styles.footerLogoText}>YOURCAR</h3>
                        <p style={styles.footerTagline}>Redefining automotive excellence</p>
                    </div>

                    <div style={styles.footerLinks}>
                        <button
                            style={styles.footerLink}
                            onClick={() => navigate('/home')}
                        >
                            Home
                        </button>
                        <button
                            style={styles.footerLink}
                            onClick={() => navigate('/shop')}
                        >
                            Shop
                        </button>
                        <button
                            style={styles.footerLink}
                            onClick={() => navigate('/profile')}
                        >
                            Profile
                        </button>
                        <button
                            style={styles.footerLink}
                            onClick={() => navigate('/my-orders')}
                        >
                            Orders
                        </button>
                    </div>

                    <div style={styles.footerCopyright}>
                        <p>© 2025 YOURCAR. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .notification-dropdown-enter {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                
                .notification-dropdown-enter-active {
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 200ms, transform 200ms;
                }
                
                .notification-dropdown-exit {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .notification-dropdown-exit-active {
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: opacity 200ms, transform 200ms;
                }
            `}</style>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden'
    },

    // Header - Identique au Profile
    header: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 40px',
        zIndex: 1000,
        transition: 'all 0.3s ease'
    },
    headerContent: {
        maxWidth: '1200px',
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
    navBtnActive: {
        background: 'none',
        border: 'none',
        fontSize: '14px',
        fontWeight: '600',
        color: '#333333',
        cursor: 'pointer',
        padding: '8px 0'
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
        padding: '8px'
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
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
        borderRadius: '10px',
        width: '350px',
        zIndex: 1000,
        marginTop: '10px'
    },
    notificationHeader: {
        padding: '15px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    notificationTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '600'
    },
    clearBtn: {
        background: 'none',
        border: 'none',
        color: '#667eea',
        fontSize: '12px',
        cursor: 'pointer'
    },
    notificationList: {
        maxHeight: '300px',
        overflowY: 'auto'
    },
    notificationItem: {
        padding: '15px',
        borderBottom: '1px solid #eee',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        transition: 'background 0.3s',
        position: 'relative'
    },
    unreadNotification: {
        backgroundColor: '#f8f9ff'
    },
    notificationIcon: {
        fontSize: '18px',
        marginRight: '10px',
        marginTop: '2px'
    },
    notificationContent: {
        flex: 1
    },
    notificationItemTitle: {
        margin: '0 0 5px 0',
        fontSize: '14px',
        fontWeight: '600'
    },
    notificationMessage: {
        margin: '0 0 5px 0',
        fontSize: '13px',
        color: '#666'
    },
    notificationTime: {
        fontSize: '11px',
        color: '#999'
    },
    unreadDot: {
        width: '8px',
        height: '8px',
        backgroundColor: '#667eea',
        borderRadius: '50%',
        marginLeft: '10px'
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

    // Hero Section
    heroSection: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 40px 80px 40px',
        position: 'relative'
    },
    heroContent: {
        textAlign: 'center',
        maxWidth: '800px',
        position: 'relative',
        zIndex: 2
    },
    heroBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        color: '#667eea',
        padding: '8px 16px',
        borderRadius: '50px',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '30px',
        letterSpacing: '0.5px'
    },
    badgeDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#4ade80',
        animation: 'pulse 2s infinite'
    },
    heroSubtitle: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#667eea',
        letterSpacing: '2px',
        margin: '0 0 16px 0',
        textTransform: 'uppercase'
    },
    heroTitle: {
        fontSize: '64px',
        fontWeight: '800',
        margin: '0 0 24px 0',
        letterSpacing: '-2px',
        color: '#1a1a1a',
        lineHeight: 1.1
    },
    heroTitleAccent: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    },
    heroDescription: {
        fontSize: '18px',
        color: '#666',
        lineHeight: 1.6,
        margin: '0 auto 48px auto',
        maxWidth: '600px',
        fontWeight: '400'
    },
    heroActions: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
    },
    btnIcon: {
        marginRight: '8px',
        fontSize: '18px'
    },
    heroPrimaryBtn: {
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        padding: '16px 32px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
    },
    heroSecondaryBtn: {
        backgroundColor: 'transparent',
        color: '#667eea',
        border: '2px solid #667eea',
        padding: '16px 32px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center'
    },

    // User Section
    userSection: {
        padding: '40px 40px',
        backgroundColor: '#f8f9fa'
    },
    userCard: {
        maxWidth: '400px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        animation: 'fadeInUp 0.6s ease'
    },
    userAvatar: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: '700',
        flexShrink: 0
    },
    userInfo: {
        flex: 1
    },
    userGreeting: {
        fontSize: '14px',
        color: '#666',
        fontWeight: '500',
        margin: '0 0 4px 0',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    userName: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1a1a1a',
        margin: '0 0 4px 0'
    },
    userEmail: {
        fontSize: '14px',
        color: '#888',
        margin: 0
    },

    // Features Section
    featuresSection: {
        padding: '80px 40px',
        backgroundColor: 'white'
    },
    sectionHeader: {
        textAlign: 'center',
        marginBottom: '60px'
    },
    sectionTitle: {
        fontSize: '36px',
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: '16px'
    },
    sectionSubtitle: {
        fontSize: '18px',
        color: '#666',
        lineHeight: 1.6,
        maxWidth: '600px',
        margin: '0 auto'
    },
    featuresGrid: {
        maxWidth: '900px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px'
    },
    featureCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        animation: 'fadeInUp 0.6s ease'
    },
    featureIcon: {
        width: '60px',
        height: '60px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px auto',
        transition: 'transform 0.3s ease'
    },
    featureTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1a1a1a',
        margin: '0 0 12px 0'
    },
    featureDescription: {
        fontSize: '14px',
        color: '#666',
        lineHeight: 1.6,
        margin: 0
    },

    // Actions Section
    actionsSection: {
        padding: '60px 40px',
        backgroundColor: '#f8f9fa'
    },
    actionsGrid: {
        maxWidth: '400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    actionBtn: {
        backgroundColor: 'white',
        border: 'none',
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.05)'
    },

    // Footer - Identique au Profile
    footer: {
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '60px 40px 40px 40px'
    },
    footerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px'
    },
    footerLogo: {
        textAlign: 'center'
    },
    footerLogoText: {
        fontSize: '20px',
        fontWeight: '800',
        margin: '0 0 8px 0',
        color: 'white'
    },
    footerTagline: {
        fontSize: '14px',
        color: '#888',
        fontWeight: '400',
        letterSpacing: '0.5px'
    },
    footerLinks: {
        display: 'flex',
        gap: '24px'
    },
    footerLink: {
        background: 'none',
        border: 'none',
        color: '#ccc',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        padding: '8px 16px',
        borderRadius: '6px',
        transition: 'all 0.2s ease'
    },
    footerCopyright: {
        textAlign: 'center',
        paddingTop: '32px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        width: '100%'
    }
};