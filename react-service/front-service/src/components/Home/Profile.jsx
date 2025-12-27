// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Tab: Update Email
    const [email, setEmail] = useState(user?.email || '');
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState('');
    const [emailError, setEmailError] = useState('');

    // Tab: Change Password
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Notifications
    const [notificationCount, setNotificationCount] = useState(3);

    // Charger les notifications (mock data)
    useEffect(() => {
        const mockNotifications = [
            { id: 1, title: "Nouvelle commande", message: "Votre commande #CMD-2024-001 a été confirmée", time: "Il y a 2 heures", read: false },
            { id: 2, title: "Promotion", message: "Réduction de 20% sur tous les produits ce week-end", time: "Il y a 1 jour", read: false },
            { id: 3, title: "Mise à jour", message: "Votre profil a été mis à jour avec succès", time: "Il y a 3 jours", read: true },
        ];
        setNotifications(mockNotifications);
        setNotificationCount(mockNotifications.filter(n => !n.read).length);
    }, []);

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setEmailError('');
        setEmailSuccess('');

        if (!email || email.trim() === '') {
            setEmailError('Email est requis');
            return;
        }

        if (email === user?.email) {
            setEmailError('Le nouvel email doit être différent de l\'email actuel');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Format d\'email invalide');
            return;
        }

        setEmailLoading(true);
        try {
            // Simulation d'appel API
            await new Promise(resolve => setTimeout(resolve, 1500));
            setEmailSuccess('✅ Email mis à jour avec succès !');
            setTimeout(() => setEmailSuccess(''), 3000);
        } catch (err) {
            setEmailError('Erreur: ' + err.message);
        } finally {
            setEmailLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError('Tous les champs sont requis');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Les mots de passe ne correspondent pas');
            return;
        }

        if (oldPassword === newPassword) {
            setPasswordError('Le nouveau mot de passe doit être différent de l\'ancien');
            return;
        }

        setPasswordLoading(true);
        try {
            // Simulation d'appel API
            await new Promise(resolve => setTimeout(resolve, 1500));
            setPasswordSuccess('✅ Mot de passe changé avec succès !');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSuccess(''), 3000);
        } catch (err) {
            setPasswordError('Erreur: ' + err.message);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleMarkAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
        setNotificationCount(prev => Math.max(0, prev - 1));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={styles.logoSection}>
                        <h1 style={styles.logo}>YOURSHop</h1>
                        <p style={styles.tagline}>La simplicité est la forme ultime de l'intelligence</p>
                    </div>

                    <nav style={styles.nav}>
                        <button
                            style={styles.navBtn}
                            onClick={() => navigate('/home')}
                        >
                            HOME
                        </button>
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

            <div style={styles.mainContent}>
                {/* Profile Sidebar */}
                <aside style={styles.sidebar}>
                    <div style={styles.profileCard}>
                        <div style={styles.avatarContainer}>
                            <div style={styles.avatar}>
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <h2 style={styles.profileName}>{user?.username}</h2>
                        <p style={styles.profileEmail}>{user?.email}</p>
                        <div style={styles.profileStatus}>
                            <span style={styles.statusDot}></span>
                            En ligne
                        </div>
                    </div>

                    <nav style={styles.sidebarNav}>
                        <button
                            style={{
                                ...styles.sidebarBtn,
                                ...(activeTab === 'info' && styles.sidebarBtnActive)
                            }}
                            onClick={() => setActiveTab('info')}
                        >
                            <span style={styles.sidebarIcon}>👤</span>
                            Informations
                        </button>
                        <button
                            style={{
                                ...styles.sidebarBtn,
                                ...(activeTab === 'email' && styles.sidebarBtnActive)
                            }}
                            onClick={() => setActiveTab('email')}
                        >
                            <span style={styles.sidebarIcon}>✉️</span>
                            Modifier Email
                        </button>
                        <button
                            style={{
                                ...styles.sidebarBtn,
                                ...(activeTab === 'password' && styles.sidebarBtnActive)
                            }}
                            onClick={() => setActiveTab('password')}
                        >
                            <span style={styles.sidebarIcon}>🔒</span>
                            Mot de passe
                        </button>
                        <button
                            style={{
                                ...styles.sidebarBtn,
                                ...(activeTab === 'security' && styles.sidebarBtnActive)
                            }}
                            onClick={() => setActiveTab('security')}
                        >
                            <span style={styles.sidebarIcon}>🛡️</span>
                            Sécurité
                        </button>
                        <button
                            style={styles.logoutBtn}
                            onClick={handleLogout}
                        >
                            <span style={styles.sidebarIcon}>🚪</span>
                            Déconnexion
                        </button>
                    </nav>
                </aside>

                {/* Profile Content */}
                <main style={styles.content}>
                    {/* Tab 1: Informations */}
                    {activeTab === 'info' && (
                        <div style={styles.tabContent}>
                            <h2 style={styles.tabTitle}>Informations du compte</h2>

                            <div style={styles.infoGrid}>
                                <div style={styles.infoCard}>
                                    <div style={styles.infoIcon}>👤</div>
                                    <div style={styles.infoContent}>
                                        <h4 style={styles.infoLabel}>Nom d'utilisateur</h4>
                                        <p style={styles.infoValue}>{user?.username}</p>
                                    </div>
                                </div>

                                <div style={styles.infoCard}>
                                    <div style={styles.infoIcon}>✉️</div>
                                    <div style={styles.infoContent}>
                                        <h4 style={styles.infoLabel}>Email</h4>
                                        <p style={styles.infoValue}>{user?.email}</p>
                                    </div>
                                </div>

                                <div style={styles.infoCard}>
                                    <div style={styles.infoIcon}>🆔</div>
                                    <div style={styles.infoContent}>
                                        <h4 style={styles.infoLabel}>ID Utilisateur</h4>
                                        <p style={styles.infoValue}>{user?.id || 'N/A'}</p>
                                    </div>
                                </div>

                                <div style={styles.infoCard}>
                                    <div style={styles.infoIcon}>📅</div>
                                    <div style={styles.infoContent}>
                                        <h4 style={styles.infoLabel}>Membre depuis</h4>
                                        <p style={styles.infoValue}>2025</p>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.quickActions}>
                                <button
                                    style={styles.actionBtn}
                                    onClick={() => setActiveTab('email')}
                                >
                                    ✏️ Modifier Email
                                </button>
                                <button
                                    style={styles.actionBtn}
                                    onClick={() => setActiveTab('password')}
                                >
                                    🔐 Changer Mot de passe
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Update Email */}
                    {activeTab === 'email' && (
                        <div style={styles.tabContent}>
                            <h2 style={styles.tabTitle}>Modifier l'adresse email</h2>

                            {emailSuccess && (
                                <div style={styles.successAlert}>{emailSuccess}</div>
                            )}

                            {emailError && (
                                <div style={styles.errorAlert}>{emailError}</div>
                            )}

                            <form onSubmit={handleUpdateEmail} style={styles.form}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Email actuel</label>
                                    <div style={styles.currentValue}>{user?.email}</div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Nouvel email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Entrez le nouvel email"
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formActions}>
                                    <button
                                        type="submit"
                                        disabled={emailLoading}
                                        style={styles.saveBtn}
                                    >
                                        {emailLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmail(user?.email);
                                            setEmailError('');
                                            setActiveTab('info');
                                        }}
                                        style={styles.cancelBtn}
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tab 3: Change Password */}
                    {activeTab === 'password' && (
                        <div style={styles.tabContent}>
                            <h2 style={styles.tabTitle}>Changer le mot de passe</h2>

                            {passwordSuccess && (
                                <div style={styles.successAlert}>{passwordSuccess}</div>
                            )}

                            {passwordError && (
                                <div style={styles.errorAlert}>{passwordError}</div>
                            )}

                            <form onSubmit={handleChangePassword} style={styles.form}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Mot de passe actuel</label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Entrez votre mot de passe actuel"
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Entrez le nouveau mot de passe"
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirmez le nouveau mot de passe"
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formActions}>
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        style={styles.saveBtn}
                                    >
                                        {passwordLoading ? 'Changement...' : 'Changer le mot de passe'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOldPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            setPasswordError('');
                                            setActiveTab('info');
                                        }}
                                        style={styles.cancelBtn}
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tab 4: Security */}
                    {activeTab === 'security' && (
                        <div style={styles.tabContent}>
                            <h2 style={styles.tabTitle}>Paramètres de sécurité</h2>

                            <div style={styles.securityGrid}>
                                <div style={styles.securityCard}>
                                    <div style={styles.securityIcon}>🔐</div>
                                    <h4 style={styles.securityTitle}>Authentification à deux facteurs</h4>
                                    <p style={styles.securityDesc}>
                                        Ajoutez une couche de sécurité supplémentaire à votre compte
                                    </p>
                                    <button style={styles.securityBtn}>Activer</button>
                                </div>

                                <div style={styles.securityCard}>
                                    <div style={styles.securityIcon}>📱</div>
                                    <h4 style={styles.securityTitle}>Appareils connectés</h4>
                                    <p style={styles.securityDesc}>
                                        Gérez les appareils qui ont accès à votre compte
                                    </p>
                                    <button style={styles.securityBtn}>Vérifier</button>
                                </div>

                                <div style={styles.securityCard}>
                                    <div style={styles.securityIcon}>📧</div>
                                    <h4 style={styles.securityTitle}>Notifications de sécurité</h4>
                                    <p style={styles.securityDesc}>
                                        Recevez des alertes pour les activités suspectes
                                    </p>
                                    <button style={styles.securityBtn}>Configurer</button>
                                </div>

                                <div style={styles.securityCard}>
                                    <div style={styles.securityIcon}>🗑️</div>
                                    <h4 style={styles.securityTitle}>Suppression du compte</h4>
                                    <p style={styles.securityDesc}>
                                        Supprimez définitivement votre compte et vos données
                                    </p>
                                    <button style={styles.deleteBtn}>Supprimer le compte</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* FOOTER */}
            <footer style={styles.footer}>
                <p>© 2025 YOURShop. Tous droits réservés.</p>
            </footer>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        fontFamily: "'Segoe UI', Arial, sans-serif"
    },
    header: {
        backgroundColor: '#FFFFFF',
        padding: '20px 40px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
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
    mainContent: {
        display: 'flex',
        maxWidth: '1200px',
        margin: '40px auto',
        gap: '30px',
        padding: '0 40px'
    },
    sidebar: {
        width: '250px',
        flexShrink: 0
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '25px',
        textAlign: 'center',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
        marginBottom: '20px'
    },
    avatarContainer: {
        marginBottom: '15px'
    },
    avatar: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#667eea',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '0 auto'
    },
    profileName: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#333333',
        margin: '0 0 5px 0'
    },
    profileEmail: {
        fontSize: '14px',
        color: '#666666',
        margin: '0 0 10px 0'
    },
    profileStatus: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#666666',
        gap: '8px'
    },
    statusDot: {
        width: '8px',
        height: '8px',
        backgroundColor: '#4CAF50',
        borderRadius: '50%'
    },
    sidebarNav: {
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '20px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
    },
    sidebarBtn: {
        width: '100%',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        padding: '12px 15px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#666666',
        cursor: 'pointer',
        borderRadius: '8px',
        marginBottom: '5px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.3s'
    },
    sidebarBtnActive: {
        backgroundColor: '#667eea',
        color: 'white'
    },
    sidebarIcon: {
        fontSize: '18px'
    },
    logoutBtn: {
        width: '100%',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        padding: '12px 15px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#FF4757',
        cursor: 'pointer',
        borderRadius: '8px',
        marginTop: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'background 0.3s'
    },
    content: {
        flex: 1
    },
    tabContent: {
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '30px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
    },
    tabTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#333333',
        margin: '0 0 25px 0'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    infoCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    infoIcon: {
        fontSize: '24px'
    },
    infoContent: {
        flex: 1
    },
    infoLabel: {
        fontSize: '12px',
        color: '#666666',
        margin: '0 0 5px 0'
    },
    infoValue: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#333333',
        margin: 0
    },
    quickActions: {
        display: 'flex',
        gap: '15px'
    },
    actionBtn: {
        backgroundColor: '#f0f2f5',
        border: 'none',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#333333',
        cursor: 'pointer',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'background 0.3s'
    },
    successAlert: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px'
    },
    errorAlert: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px'
    },
    form: {
        maxWidth: '500px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    formLabel: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#333333',
        marginBottom: '8px'
    },
    currentValue: {
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '16px',
        color: '#666666'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '16px',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border 0.3s'
    },
    formActions: {
        display: 'flex',
        gap: '15px',
        marginTop: '25px'
    },
    saveBtn: {
        flex: 1,
        padding: '14px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.3s'
    },
    cancelBtn: {
        flex: 1,
        padding: '14px',
        backgroundColor: '#f0f2f5',
        color: '#333333',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.3s'
    },
    securityGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
    },
    securityCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        padding: '25px',
        textAlign: 'center'
    },
    securityIcon: {
        fontSize: '32px',
        marginBottom: '15px'
    },
    securityTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#333333',
        margin: '0 0 10px 0'
    },
    securityDesc: {
        fontSize: '14px',
        color: '#666666',
        margin: '0 0 20px 0',
        lineHeight: 1.5
    },
    securityBtn: {
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    deleteBtn: {
        backgroundColor: '#FF4757',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    footer: {
        padding: '30px 40px',
        textAlign: 'center',
        color: '#666666',
        fontSize: '14px',
        borderTop: '1px solid #E0E0E0',
        marginTop: '50px'
    }
};