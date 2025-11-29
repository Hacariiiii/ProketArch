import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');

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
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    // Handle Update Email
    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setEmailError('');
        setEmailSuccess('');

        if (!email || email.trim() === '') {
            setEmailError('Email is required');
            return;
        }

        if (email === user?.email) {
            setEmailError('New email must be different from current email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Invalid email format');
            return;
        }

        setEmailLoading(true);
        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('http://localhost:8089/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setEmailSuccess('✅ Email updated successfully!');
                setTimeout(() => setEmailSuccess(''), 3000);
            } else {
                setEmailError(data.message || 'Failed to update email');
            }
        } catch (err) {
            setEmailError('Error: ' + err.message);
        } finally {
            setEmailLoading(false);
        }
    };

    // Handle Change Password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (oldPassword === newPassword) {
            setPasswordError('New password must be different from old password');
            return;
        }

        setPasswordLoading(true);
        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('http://localhost:8089/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setPasswordSuccess('✅ Password changed successfully!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setPasswordSuccess(''), 3000);
            } else {
                setPasswordError(data.message || 'Failed to change password');
            }
        } catch (err) {
            setPasswordError('Error: ' + err.message);
        } finally {
            setPasswordLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <div style={styles.pageContainer}>
            {/* HEADER */}
            <div style={styles.header}>
                <h1 style={styles.title}>👤 My Profile</h1>
                <p style={styles.subtitle}>Manage your account settings</p>
            </div>

            {/* MAIN CONTENT */}
            <div style={styles.mainContainer}>
                {/* SIDEBAR */}
                <div style={styles.sidebar}>
                    <div style={styles.profileCard}>
                        <div style={styles.profileAvatar}>
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <h3 style={styles.profileName}>{user?.username}</h3>
                        <p style={styles.profileEmail}>{user?.email}</p>
                        <div style={styles.memberBadge}>
                            👑 Active Member
                        </div>
                    </div>

                    <div style={styles.tabs}>
                        <button
                            style={{
                                ...styles.tabButton,
                                ...(activeTab === 'info' ? styles.tabButtonActive : {})
                            }}
                            onClick={() => setActiveTab('info')}
                        >
                            📋 Account Info
                        </button>
                        <button
                            style={{
                                ...styles.tabButton,
                                ...(activeTab === 'email' ? styles.tabButtonActive : {})
                            }}
                            onClick={() => setActiveTab('email')}
                        >
                            ✉️ Update Email
                        </button>
                        <button
                            style={{
                                ...styles.tabButton,
                                ...(activeTab === 'password' ? styles.tabButtonActive : {})
                            }}
                            onClick={() => setActiveTab('password')}
                        >
                            🔐 Change Password
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div style={styles.content}>
                    {/* TAB 1: Account Info */}
                    {activeTab === 'info' && (
                        <div style={styles.tabContent}>
                            <h2 style={styles.contentTitle}>📋 Account Information</h2>

                            <div style={styles.infoCard}>
                                <div style={styles.infoGroup}>
                                    <label style={styles.infoLabel}>👤 Username</label>
                                    <div style={styles.infoValue}>{user?.username}</div>
                                </div>

                                <div style={styles.divider}></div>

                                <div style={styles.infoGroup}>
                                    <label style={styles.infoLabel}>✉️ Email</label>
                                    <div style={styles.infoValue}>{user?.email}</div>
                                </div>

                                <div style={styles.divider}></div>

                                <div style={styles.infoGroup}>
                                    <label style={styles.infoLabel}>🔐 Account Status</label>
                                    <div style={styles.statusBadge}>✅ Active</div>
                                </div>

                                <div style={styles.divider}></div>

                                <div style={styles.infoGroup}>
                                    <label style={styles.infoLabel}>📅 Member Since</label>
                                    <div style={styles.infoValue}>2025</div>
                                </div>
                            </div>

                            <div style={styles.actionButtons}>
                                <button
                                    style={styles.primaryButton}
                                    onClick={() => setActiveTab('email')}
                                >
                                    ✉️ Update Email
                                </button>
                                <button
                                    style={styles.secondaryButton}
                                    onClick={() => setActiveTab('password')}
                                >
                                    🔐 Change Password
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Update Email */}
                    {activeTab === 'email' && (
                        <div style={styles.tabContent}>
                            <h2 style={styles.contentTitle}>✉️ Update Email Address</h2>

                            {emailSuccess && <div style={styles.successMessage}>{emailSuccess}</div>}
                            {emailError && <div style={styles.errorMessage}>{emailError}</div>}

                            <form onSubmit={handleUpdateEmail} style={styles.form}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Current Email</label>
                                    <input
                                        type="email"
                                        value={user?.email}
                                        disabled
                                        style={styles.inputDisabled}
                                    />
                                </div>

                                <div style={styles.divider}></div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>New Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter new email"
                                        style={styles.input}
                                        required
                                    />
                                    <p style={styles.inputHint}>Make sure this is a valid email address</p>
                                </div>

                                <div style={styles.formActions}>
                                    <button
                                        type="submit"
                                        disabled={emailLoading}
                                        style={{
                                            ...styles.submitButton,
                                            opacity: emailLoading ? 0.6 : 1
                                        }}
                                    >
                                        {emailLoading ? '⏳ Updating...' : '✅ Update Email'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmail(user?.email);
                                            setEmailError('');
                                        }}
                                        style={styles.cancelButton}
                                    >
                                        ❌ Cancel
                                    </button>
                                </div>
                            </form>

                            <div style={styles.infoBox}>
                                <p style={styles.infoBoxTitle}>⚠️ Important</p>
                                <p>A verification email will be sent to your new address.</p>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: Change Password */}
                    {activeTab === 'password' && (
                        <div style={styles.tabContent}>
                            <h2 style={styles.contentTitle}>🔐 Change Password</h2>

                            {passwordSuccess && <div style={styles.successMessage}>{passwordSuccess}</div>}
                            {passwordError && <div style={styles.errorMessage}>{passwordError}</div>}

                            <form onSubmit={handleChangePassword} style={styles.form}>
                                {/* Old Password */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Current Password</label>
                                    <div style={styles.passwordInputWrapper}>
                                        <input
                                            type={showPasswords.old ? 'text' : 'password'}
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            style={styles.input}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('old')}
                                            style={styles.eyeButton}
                                        >
                                            {showPasswords.old ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                </div>

                                <div style={styles.divider}></div>

                                {/* New Password */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>New Password</label>
                                    <div style={styles.passwordInputWrapper}>
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            style={styles.input}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            style={styles.eyeButton}
                                        >
                                            {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                    <p style={styles.inputHint}>Must be at least 6 characters</p>
                                </div>

                                <div style={styles.divider}></div>

                                {/* Confirm Password */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Confirm New Password</label>
                                    <div style={styles.passwordInputWrapper}>
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            style={styles.input}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            style={styles.eyeButton}
                                        >
                                            {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Strength */}
                                {newPassword && (
                                    <div style={styles.passwordStrength}>
                                        <p style={styles.strengthLabel}>Password Strength:</p>
                                        <div style={styles.strengthBar}>
                                            <div
                                                style={{
                                                    ...styles.strengthFill,
                                                    width: newPassword.length >= 8 ? '100%' : newPassword.length >= 6 ? '50%' : '25%',
                                                    backgroundColor: newPassword.length >= 8 ? '#2ecc71' : newPassword.length >= 6 ? '#f39c12' : '#e74c3c'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div style={styles.formActions}>
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        style={{
                                            ...styles.submitButton,
                                            opacity: passwordLoading ? 0.6 : 1
                                        }}
                                    >
                                        {passwordLoading ? '⏳ Changing...' : '✅ Change Password'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOldPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            setPasswordError('');
                                        }}
                                        style={styles.cancelButton}
                                    >
                                        ❌ Cancel
                                    </button>
                                </div>
                            </form>

                            <div style={styles.infoBox}>
                                <p style={styles.infoBoxTitle}>🔐 Security Tips</p>
                                <ul style={styles.tipsList}>
                                    <li>Use a strong password with letters, numbers, and symbols</li>
                                    <li>Don't use the same password as other accounts</li>
                                    <li>Change your password regularly for security</li>
                                </ul>
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
    header: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center',
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '0 0 10px 0',
    },
    subtitle: {
        fontSize: '16px',
        opacity: 0.9,
        margin: 0,
    },
    mainContainer: {
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '30px',
        padding: '30px 20px',
    },
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    profileAvatar: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#667eea',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        fontWeight: 'bold',
        margin: '0 auto 15px',
    },
    profileName: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0 0 5px 0',
    },
    profileEmail: {
        fontSize: '14px',
        color: '#7f8c8d',
        margin: '0 0 15px 0',
    },
    memberBadge: {
        display: 'inline-block',
        backgroundColor: '#2ecc71',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 'bold',
    },
    tabs: {
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    tabButton: {
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
    tabButtonActive: {
        backgroundColor: '#f0f2f5',
        color: '#667eea',
        borderLeftColor: '#667eea',
        fontWeight: 'bold',
    },
    content: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    tabContent: {
        animation: 'fadeIn 0.3s',
    },
    contentTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0 0 30px 0',
    },
    infoCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
    },
    infoGroup: {
        marginBottom: '15px',
    },
    infoLabel: {
        fontSize: '13px',
        color: '#7f8c8d',
        fontWeight: 'bold',
        marginBottom: '5px',
        display: 'block',
    },
    infoValue: {
        fontSize: '16px',
        color: '#2c3e50',
        fontWeight: 'bold',
    },
    statusBadge: {
        display: 'inline-block',
        backgroundColor: '#2ecc71',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 'bold',
    },
    divider: {
        height: '1px',
        backgroundColor: '#e0e0e0',
        margin: '15px 0',
    },
    actionButtons: {
        display: 'flex',
        gap: '15px',
        marginTop: '25px',
    },
    primaryButton: {
        flex: 1,
        padding: '12px 20px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'all 0.3s',
    },
    secondaryButton: {
        flex: 1,
        padding: '12px 20px',
        backgroundColor: '#e0e0e0',
        color: '#2c3e50',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'all 0.3s',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '8px',
        display: 'block',
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '2px solid #e0e0e0',
        borderRadius: '6px',
        fontSize: '14px',
        transition: 'border-color 0.3s',
        boxSizing: 'border-box',
    },
    inputDisabled: {
        width: '100%',
        padding: '12px',
        border: '2px solid #e0e0e0',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: '#f8f9fa',
        color: '#7f8c8d',
        cursor: 'not-allowed',
        boxSizing: 'border-box',
    },
    inputHint: {
        fontSize: '12px',
        color: '#7f8c8d',
        marginTop: '5px',
        margin: 0,
    },
    passwordInputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    eyeButton: {
        position: 'absolute',
        right: '12px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '0',
    },
    passwordStrength: {
        marginTop: '15px',
        marginBottom: '15px',
    },
    strengthLabel: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0 0 8px 0',
    },
    strengthBar: {
        height: '6px',
        backgroundColor: '#e0e0e0',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    strengthFill: {
        height: '100%',
        transition: 'width 0.3s, background-color 0.3s',
    },
    formActions: {
        display: 'flex',
        gap: '15px',
        marginTop: '30px',
    },
    submitButton: {
        flex: 1,
        padding: '12px 20px',
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'all 0.3s',
    },
    cancelButton: {
        flex: 1,
        padding: '12px 20px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'all 0.3s',
    },
    infoBox: {
        backgroundColor: '#e8f4f8',
        border: '2px solid #3498db',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '25px',
    },
    infoBoxTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#3498db',
        margin: '0 0 8px 0',
    },
    tipsList: {
        fontSize: '13px',
        color: '#2c3e50',
        paddingLeft: '20px',
        margin: 0,
    },
    successMessage: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '12px 15px',
        borderRadius: '6px',
        marginBottom: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    errorMessage: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '12px 15px',
        borderRadius: '6px',
        marginBottom: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
    },
};