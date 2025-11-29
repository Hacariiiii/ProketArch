import { useState, useEffect } from 'react';
import { getUserInfo } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await getUserInfo();
                setUserInfo(response.data.data);
            } catch (err) {
                console.error('Failed to fetch user info:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            {/* HEADER BANNER */}
            <div style={styles.headerBanner}>
                <div style={styles.headerContent}>
                    <div style={styles.greetingSection}>
                        <h1 style={styles.greeting}>
                            👋 Welcome Back, <span style={styles.userName}>{user?.username}</span>!
                        </h1>
                        <p style={styles.subGreeting}>
                            Good to see you again. Here's what's happening with your account today.
                        </p>
                    </div>
                    <div style={styles.headerStats}>
                        <div style={styles.headerStat}>
                            <span style={styles.headerStatLabel}>Status</span>
                            <span style={styles.headerStatValue}>🟢 Active</span>
                        </div>
                        <div style={styles.headerStat}>
                            <span style={styles.headerStatLabel}>Member Since</span>
                            <span style={styles.headerStatValue}>2025</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={styles.mainContainer}>
                {/* SIDEBAR */}
                <div style={styles.sidebar}>
                    <div style={styles.profileBox}>
                        <div style={styles.profileAvatar}>{user?.username?.charAt(0).toUpperCase()}</div>
                        <h3 style={styles.profileName}>{user?.username}</h3>
                        <p style={styles.profileEmail}>{user?.email}</p>
                        <div style={styles.roleBadge}>👑 {userInfo?.roles?.[0] || 'USER'}</div>
                        <button
                            style={styles.editProfileBtn}
                            onClick={() => navigate('/Profile')}
                        >
                            ✏️ Edit Profile
                        </button>
                    </div>

                    <div style={styles.sidebarMenu}>
                        <button
                            style={{
                                ...styles.menuItem,
                                ...(activeTab === 'dashboard' ? styles.menuItemActive : {})
                            }}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            📊 Dashboard
                        </button>
                        <button
                            style={{
                                ...styles.menuItem,
                                ...(activeTab === 'activity' ? styles.menuItemActive : {})
                            }}
                            onClick={() => setActiveTab('activity')}
                        >
                            📈 Activity
                        </button>
                        <button
                            style={{
                                ...styles.menuItem,
                                ...(activeTab === 'achievements' ? styles.menuItemActive : {})
                            }}
                            onClick={() => setActiveTab('achievements')}
                        >
                            🏆 Achievements
                        </button>
                        <button
                            style={{
                                ...styles.menuItem,
                                ...(activeTab === 'settings' ? styles.menuItemActive : {})
                            }}
                            onClick={() => setActiveTab('settings')}
                        >
                            ⚙️ Settings
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div style={styles.contentArea}>
                    {activeTab === 'dashboard' && (
                        <>
                            {/* STATS GRID */}
                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>📊 Your Statistics</h2>
                                <div style={styles.statsGrid}>
                                    <div style={styles.statCard}>
                                        <div style={styles.statCardHeader}>
                                            <span style={styles.statCardIcon}>⭐</span>
                                            <span style={styles.statCardLabel}>Points</span>
                                        </div>
                                        <div style={styles.statCardValue}>2,450</div>
                                        <div style={styles.statCardChange}>+120 this month</div>
                                    </div>

                                    <div style={styles.statCard}>
                                        <div style={styles.statCardHeader}>
                                            <span style={styles.statCardIcon}>🏆</span>
                                            <span style={styles.statCardLabel}>Achievements</span>
                                        </div>
                                        <div style={styles.statCardValue}>12</div>
                                        <div style={styles.statCardChange}>Unlocked</div>
                                    </div>

                                    <div style={styles.statCard}>
                                        <div style={styles.statCardHeader}>
                                            <span style={styles.statCardIcon}>🔥</span>
                                            <span style={styles.statCardLabel}>Streak</span>
                                        </div>
                                        <div style={styles.statCardValue}>7</div>
                                        <div style={styles.statCardChange}>Days active</div>
                                    </div>

                                    <div style={styles.statCard}>
                                        <div style={styles.statCardHeader}>
                                            <span style={styles.statCardIcon}>👥</span>
                                            <span style={styles.statCardLabel}>Followers</span>
                                        </div>
                                        <div style={styles.statCardValue}>243</div>
                                        <div style={styles.statCardChange}>+18 new</div>
                                    </div>
                                </div>
                            </div>

                            {/* PROFILE INFO CARD */}
                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>👤 Account Information</h2>
                                <div style={styles.infoCard}>
                                    <div style={styles.infoRow}>
                                        <span style={styles.infoLabel}>📍 User ID</span>
                                        <span style={styles.infoValue}>{userInfo?.id}</span>
                                    </div>
                                    <div style={styles.divider}></div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.infoLabel}>👤 Username</span>
                                        <span style={styles.infoValue}>{userInfo?.username}</span>
                                    </div>
                                    <div style={styles.divider}></div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.infoLabel}>✉️ Email</span>
                                        <span style={styles.infoValue}>{userInfo?.email}</span>
                                    </div>
                                    <div style={styles.divider}></div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.infoLabel}>🔐 Role</span>
                                        <span style={styles.infoValueRole}>{userInfo?.roles?.join(', ')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* QUICK ACTIONS */}
                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
                                <div style={styles.actionGrid}>
                                    <button style={styles.actionButton}>
                                        <span style={styles.actionIcon}>📝</span>
                                        <span style={styles.actionText}>Create Post</span>
                                    </button>
                                    <button style={styles.actionButton}>
                                        <span style={styles.actionIcon}>🔔</span>
                                        <span style={styles.actionText}>View Notifications</span>
                                    </button>
                                    <button style={styles.actionButton}>
                                        <span style={styles.actionIcon}>💬</span>
                                        <span style={styles.actionText}>Messages</span>
                                    </button>
                                    <button style={styles.actionButton}>
                                        <span style={styles.actionIcon}>📊</span>
                                        <span style={styles.actionText}>Analytics</span>
                                    </button>
                                    <button style={styles.actionButton}>
                                        <span style={styles.actionIcon}>🎯</span>
                                        <span style={styles.actionText}>Goals</span>
                                    </button>
                                    <button style={styles.actionButton}>
                                        <span style={styles.actionIcon}>🎁</span>
                                        <span style={styles.actionText}>Rewards</span>
                                    </button>
                                </div>
                            </div>

                            {/* RECENT ACTIVITY */}
                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>📜 Recent Activity</h2>
                                <div style={styles.activityList}>
                                    <div style={styles.activityItem}>
                                        <div style={styles.activityIcon}>✅</div>
                                        <div style={styles.activityContent}>
                                            <p style={styles.activityTitle}>Profile Completed</p>
                                            <p style={styles.activityTime}>2 hours ago</p>
                                        </div>
                                    </div>
                                    <div style={styles.activityItem}>
                                        <div style={styles.activityIcon}>🏆</div>
                                        <div style={styles.activityContent}>
                                            <p style={styles.activityTitle}>New Achievement Unlocked</p>
                                            <p style={styles.activityTime}>Yesterday</p>
                                        </div>
                                    </div>
                                    <div style={styles.activityItem}>
                                        <div style={styles.activityIcon}>👥</div>
                                        <div style={styles.activityContent}>
                                            <p style={styles.activityTitle}>New Follower</p>
                                            <p style={styles.activityTime}>3 days ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'activity' && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>📈 Your Activity</h2>
                            <div style={styles.emptyState}>
                                <p>📊 Activity tracking coming soon!</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>🏆 Achievements</h2>
                            <div style={styles.achievementGrid}>
                                <div style={styles.achievementCard}>
                                    <span style={styles.achievementIcon}>🌟</span>
                                    <span style={styles.achievementName}>First Step</span>
                                </div>
                                <div style={styles.achievementCard}>
                                    <span style={styles.achievementIcon}>⭐</span>
                                    <span style={styles.achievementName}>Rising Star</span>
                                </div>
                                <div style={styles.achievementCard}>
                                    <span style={styles.achievementIcon}>👑</span>
                                    <span style={styles.achievementName}>Champion</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>⚙️ Settings</h2>
                            <div style={styles.settingsList}>
                                <div style={styles.settingItem}>
                                    <span>🔔 Notifications</span>
                                    <input type="checkbox" defaultChecked />
                                </div>
                                <div style={styles.settingItem}>
                                    <span>🌙 Dark Mode</span>
                                    <input type="checkbox" />
                                </div>
                                <div style={styles.settingItem}>
                                    <span>🔒 Privacy</span>
                                    <input type="checkbox" defaultChecked />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SPACING FOR BOTTOM BAR */}
            <div style={{ height: '100px' }}></div>
        </div>
    );
}

const styles = {
    pageContainer: {
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
        paddingTop: '0',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '20px',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        fontSize: '16px',
        color: '#666',
    },
    headerBanner: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '40px 20px',
        marginBottom: '30px',
    },
    headerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '30px',
    },
    greetingSection: {
        flex: 1,
    },
    greeting: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '0 0 10px 0',
    },
    userName: {
        color: '#ffd700',
    },
    subGreeting: {
        fontSize: '16px',
        opacity: 0.9,
        margin: 0,
    },
    headerStats: {
        display: 'flex',
        gap: '30px',
    },
    headerStat: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    headerStatLabel: {
        fontSize: '12px',
        opacity: 0.8,
    },
    headerStatValue: {
        fontSize: '18px',
        fontWeight: 'bold',
    },
    mainContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '30px',
        padding: '0 20px 50px 20px',
    },
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    profileBox: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    profileAvatar: {
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
        margin: '0 auto 15px',
    },
    profileName: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0 0 5px 0',
    },
    profileEmail: {
        fontSize: '13px',
        color: '#7f8c8d',
        margin: '0 0 15px 0',
    },
    roleBadge: {
        display: 'inline-block',
        backgroundColor: '#2ecc71',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        marginBottom: '15px',
    },
    editProfileBtn: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
    },
    sidebarMenu: {
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    menuItem: {
        width: '100%',
        padding: '15px',
        border: 'none',
        backgroundColor: 'white',
        color: '#2c3e50',
        cursor: 'pointer',
        fontSize: '14px',
        textAlign: 'left',
        transition: 'all 0.3s',
        borderLeft: '4px solid transparent',
    },
    menuItemActive: {
        backgroundColor: '#f0f2f5',
        color: '#667eea',
        borderLeftColor: '#667eea',
        fontWeight: 'bold',
    },
    contentArea: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0 0 20px 0',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
    },
    statCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '15px',
        border: '2px solid #e0e0e0',
    },
    statCardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px',
    },
    statCardIcon: {
        fontSize: '24px',
    },
    statCardLabel: {
        fontSize: '13px',
        color: '#7f8c8d',
        fontWeight: 'bold',
    },
    statCardValue: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: '5px',
    },
    statCardChange: {
        fontSize: '12px',
        color: '#2ecc71',
    },
    infoCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '20px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
    },
    infoLabel: {
        fontSize: '14px',
        color: '#7f8c8d',
        fontWeight: 'bold',
    },
    infoValue: {
        fontSize: '14px',
        color: '#2c3e50',
        fontWeight: 'bold',
    },
    infoValueRole: {
        fontSize: '14px',
        color: '#2ecc71',
        fontWeight: 'bold',
    },
    divider: {
        height: '1px',
        backgroundColor: '#e0e0e0',
    },
    actionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
    },
    actionButton: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    actionIcon: {
        fontSize: '28px',
    },
    actionText: {
        textAlign: 'center',
    },
    activityList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    activityItem: {
        display: 'flex',
        gap: '15px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '4px solid #667eea',
    },
    activityIcon: {
        fontSize: '24px',
        minWidth: '24px',
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0 0 5px 0',
    },
    activityTime: {
        fontSize: '12px',
        color: '#7f8c8d',
        margin: 0,
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px 20px',
        color: '#7f8c8d',
    },
    achievementGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
    },
    achievementCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center',
    },
    achievementIcon: {
        fontSize: '32px',
    },
    achievementName: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    settingsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    settingItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
    },
};
