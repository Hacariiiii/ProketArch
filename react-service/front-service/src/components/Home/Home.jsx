import { useState, useEffect } from 'react';
import { getUserInfo } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';

export default function Home() {
    const { user } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

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
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    return (
        <div style={styles.container}>
            <h1>Welcome, {user?.username}! 🎉</h1>

            {userInfo && (
                <div style={styles.card}>
                    <h2>Your Profile</h2>
                    <p><strong>ID:</strong> {userInfo.id}</p>
                    <p><strong>Username:</strong> {userInfo.username}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Roles:</strong> {userInfo.roles?.join(', ')}</p>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '600px',
        margin: '50px auto',
        padding: '20px'
    },
    card: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginTop: '20px'
    }
};
