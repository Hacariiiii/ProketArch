import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { removeTokens } from '../utils/tokenManager';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        removeTokens();
        logout();
        navigate('/login');
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>
                    🚀 MyApp
                </Link>

                <div style={styles.menu}>
                    {isAuthenticated ? (
                        <>
                            <span style={styles.welcome}>Welcome, {user?.username}</span>
                            <button onClick={handleLogout} style={styles.logoutBtn}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.link}>Login</Link>
                            <Link to="/register" style={styles.link}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        backgroundColor: '#333',
        padding: '10px 0',
        color: 'white'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px'
    },
    logo: {
        fontSize: '24px',
        fontWeight: 'bold',
        textDecoration: 'none',
        color: 'white'
    },
    menu: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
    },
    welcome: {
        fontSize: '14px'
    },
    link: {
        color: 'white',
        textDecoration: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        backgroundColor: '#555',
        transition: 'background-color 0.3s'
    },
    logoutBtn: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};
