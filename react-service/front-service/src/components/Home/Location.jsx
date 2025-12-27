import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Location() {
    const navigate = useNavigate();

    // États pour les boutons hover (optionnel)
    const [hoveredBtn, setHoveredBtn] = useState(null);

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#FFFFFF',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            color: '#1a1a1a'
        },

        // HEADER
        header: {
            backgroundColor: '#FFFFFF',
            padding: '20px 40px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 4px 0',
            letterSpacing: '1px'
        },
        tagline: {
            fontSize: '11px',
            color: '#666',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            margin: 0
        },
        nav: {
            display: 'flex',
            gap: '30px',
            alignItems: 'center'
        },
        navBtn: {
            background: 'none',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            color: '#666',
            cursor: 'pointer',
            padding: '8px 0',
            position: 'relative',
            transition: 'color 0.3s'
        },
        navBtnActive: {
            background: 'none',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1a1a1a',
            cursor: 'pointer',
            padding: '8px 0',
            position: 'relative',
            borderBottom: '2px solid #667eea'
        },

        // HERO SECTION
        heroSection: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '80px 40px 60px 40px',
            textAlign: 'center'
        },
        heroContent: {
            maxWidth: '800px',
            margin: '0 auto'
        },
        heroTitle: {
            fontSize: '48px',
            fontWeight: '800',
            margin: '0 0 15px 0',
            letterSpacing: '-0.5px'
        },
        heroSubtitle: {
            fontSize: '18px',
            fontWeight: '500',
            opacity: 0.9,
            margin: 0,
            letterSpacing: '1px'
        },

        // MAIN CONTENT
        main: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '60px 20px'
        },
        contentGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '50px',
            alignItems: 'start',
            '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr'
            }
        },

        // MAP SECTION
        mapSection: {
            marginBottom: '40px'
        },
        sectionTitle: {
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 30px 0',
            color: '#1a1a1a',
            lineHeight: 1.2
        },
        mapContainer: {
            backgroundColor: '#f8f9fa',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid #eaeaea'
        },
        mapBackground: {
            height: '400px',
            backgroundColor: '#e8f4f8',
            position: 'relative',
            padding: '20px'
        },
        streetHorizontal: {
            position: 'absolute',
            top: '50%',
            left: '0',
            width: '100%',
            height: '8px',
            backgroundColor: '#4a90e2',
            transform: 'translateY(-50%)'
        },
        streetVertical: {
            position: 'absolute',
            left: '50%',
            top: '0',
            height: '100%',
            width: '8px',
            backgroundColor: '#4a90e2',
            transform: 'translateX(-50%)'
        },
        landmark: {
            position: 'absolute',
            top: '30%',
            left: '20%',
            backgroundColor: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontSize: '12px',
            fontWeight: '600'
        },
        landmark2: {
            position: 'absolute',
            top: '20%',
            right: '30%',
            backgroundColor: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontSize: '12px',
            fontWeight: '600'
        },
        landmark3: {
            position: 'absolute',
            bottom: '30%',
            right: '20%',
            backgroundColor: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontSize: '12px',
            fontWeight: '600'
        },
        locationMarker: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
        },
        markerPin: {
            fontSize: '48px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
            animation: 'pulse 2s infinite'
        },
        markerLabel: {
            backgroundColor: '#667eea',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '700',
            marginTop: '8px',
            display: 'inline-block'
        },
        mapLegend: {
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            padding: '20px',
            backgroundColor: 'white',
            borderTop: '1px solid #eaeaea'
        },
        legendItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#666'
        },
        legendColor: {
            width: '20px',
            height: '8px',
            backgroundColor: '#4a90e2',
            borderRadius: '2px'
        },
        legendIcon: {
            fontSize: '16px'
        },

        // INFO SECTION
        infoSection: {
            marginBottom: '40px'
        },
        infoCard: {
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
            marginBottom: '30px',
            border: '1px solid #f0f0f0'
        },
        infoItem: {
            display: 'flex',
            gap: '20px',
            alignItems: 'flex-start',
            marginBottom: '20px'
        },
        infoIcon: {
            fontSize: '28px',
            minWidth: '40px',
            textAlign: 'center'
        },
        infoTitle: {
            fontSize: '18px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            color: '#1a1a1a'
        },
        infoText: {
            fontSize: '15px',
            lineHeight: 1.6,
            color: '#666',
            margin: 0
        },
        divider: {
            height: '1px',
            backgroundColor: '#f0f0f0',
            margin: '25px 0'
        },
        phoneLink: {
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            '&:hover': {
                textDecoration: 'underline'
            }
        },
        emailLink: {
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            '&:hover': {
                textDecoration: 'underline'
            }
        },

        // DIRECTIONS
        directionsCard: {
            backgroundColor: '#f0f7ff',
            borderRadius: '16px',
            padding: '25px',
            borderLeft: '4px solid #667eea'
        },
        directionsTitle: {
            fontSize: '20px',
            fontWeight: '700',
            margin: '0 0 15px 0',
            color: '#1a1a1a'
        },
        directionsList: {
            margin: 0,
            paddingLeft: '20px',
            fontSize: '15px',
            lineHeight: 1.7,
            color: '#666'
        },
        directionsListItem: {
            marginBottom: '10px',
            position: 'relative',
            paddingLeft: '5px'
        },

        // FOOTER
        footer: {
            backgroundColor: '#1a1a1a',
            color: 'white',
            padding: '60px 40px 30px 40px',
            marginTop: '60px'
        },
        footerContent: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '50px',
            marginBottom: '50px'
        },
        footerSection: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        footerLogo: {
            fontSize: '24px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
        },
        footerTitle: {
            fontSize: '16px',
            fontWeight: '700',
            margin: '0 0 15px 0',
            color: 'white'
        },
        footerText: {
            fontSize: '14px',
            color: '#aaa',
            margin: '0 0 10px 0',
            lineHeight: 1.6
        },
        footerLink: {
            background: 'none',
            border: 'none',
            color: '#aaa',
            fontSize: '14px',
            textAlign: 'left',
            cursor: 'pointer',
            padding: '8px 0',
            transition: 'color 0.3s',
            '&:hover': {
                color: '#667eea'
            }
        },
        footerBottom: {
            maxWidth: '1200px',
            margin: '0 auto',
            paddingTop: '30px',
            borderTop: '1px solid #333',
            textAlign: 'center'
        },
        footerBottomText: {
            fontSize: '13px',
            color: '#777',
            margin: 0
        }
    };

    // Fonctions pour simuler les actions
    const handleCall = () => {
        alert('Appel vers +212 612 20 61 15...');
        // En vrai projet: window.location.href = 'tel:+212612206115';
    };

    const handleEmail = () => {
        alert('Ouverture du client mail...');
        // En vrai projet: window.location.href = 'mailto:mouadsalah1234@gmail.com';
    };

    return (
        <div style={styles.container}>
            {/* STYLE GLOBAL */}
            <style>
                {`
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.1); }
                    100% { transform: translate(-50%, -50%) scale(1); }
                }
                
                button:hover {
                    opacity: 0.8;
                }
                
                a:hover {
                    text-decoration: underline;
                }
                
                @media (max-width: 768px) {
                    .content-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .hero-title {
                        font-size: 36px !important;
                    }
                    .hero-subtitle {
                        font-size: 16px !important;
                    }
                }
                `}
            </style>

            {/* HEADER */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={styles.logoSection}>
                        <h1 style={styles.logo}>YOURShop</h1>
                        <p style={styles.tagline}>Excellence Redefined</p>
                    </div>


                </div>
            </header>

            {/* HERO SECTION */}
            <section style={styles.heroSection}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>📍 Our Location</h1>
                    <p style={styles.heroSubtitle}>Find us easily in the heart of the city</p>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <main style={styles.main}>
                <div style={styles.contentGrid}>
                    {/* MAP SECTION */}
                    <div style={styles.mapSection}>
                        <h2 style={styles.sectionTitle}>Find Us Here</h2>

                        <div style={styles.mapContainer}>
                            <div style={styles.mapBackground}>
                                <div style={styles.streetHorizontal}></div>
                                <div style={styles.streetVertical}></div>

                                <div style={styles.landmark}><span>🏪</span>Market</div>
                                <div style={styles.landmark2}><span>🏨</span>Hotel</div>
                                <div style={styles.landmark3}><span>⛲</span>Park</div>

                                <div style={styles.locationMarker}>
                                    <div style={styles.markerPin}>📍</div>
                                    <div style={styles.markerLabel}>YOURShop</div>
                                </div>
                            </div>

                            <div style={styles.mapLegend}>
                                <div style={styles.legendItem}>
                                    <div style={styles.legendColor}></div>
                                    <span>Main roads</span>
                                </div>
                                <div style={styles.legendItem}>
                                    <span style={styles.legendIcon}>📍</span>
                                    <span>Our location</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INFO SECTION */}
                    <div style={styles.infoSection}>
                        <h2 style={styles.sectionTitle}>Contact Information</h2>

                        <div style={styles.infoCard}>
                            <div style={styles.infoItem}>
                                <div style={styles.infoIcon}>🏢</div>
                                <div>
                                    <h3 style={styles.infoTitle}>Our Address</h3>
                                    <p style={styles.infoText}>
                                        123 Business Avenue, Downtown<br/>
                                        Casablanca 20250<br/>
                                        Morocco
                                    </p>
                                </div>
                            </div>

                            <div style={styles.divider}></div>

                            <div style={styles.infoItem}>
                                <div style={styles.infoIcon}>📞</div>
                                <div>
                                    <h3 style={styles.infoTitle}>Phone Number</h3>
                                    <p style={styles.infoText}>
                                        <span
                                            onClick={handleCall}
                                            style={styles.phoneLink}
                                            role="button"
                                            tabIndex={0}
                                            onKeyPress={(e) => e.key === 'Enter' && handleCall()}
                                        >
                                            +212 612 20 61 15
                                        </span><br/>
                                        Available: Mon-Fri 9AM-6PM
                                    </p>
                                </div>
                            </div>

                            <div style={styles.divider}></div>

                            <div style={styles.infoItem}>
                                <div style={styles.infoIcon}>✉️</div>
                                <div>
                                    <h3 style={styles.infoTitle}>Email Address</h3>
                                    <p style={styles.infoText}>
                                        <span
                                            onClick={handleEmail}
                                            style={styles.emailLink}
                                            role="button"
                                            tabIndex={0}
                                            onKeyPress={(e) => e.key === 'Enter' && handleEmail()}
                                        >
                                            mouadheba1234@gmail.com
                                        </span><br/>
                                        Response within 24 hours
                                    </p>
                                </div>
                            </div>

                            <div style={styles.divider}></div>

                            <div style={styles.infoItem}>
                                <div style={styles.infoIcon}>🕒</div>
                                <div>
                                    <h3 style={styles.infoTitle}>Business Hours</h3>
                                    <p style={styles.infoText}>
                                        <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM<br/>
                                        <strong>Saturday:</strong> 10:00 AM - 4:00 PM<br/>
                                        <strong>Sunday:</strong> Closed
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={styles.directionsCard}>
                            <h3 style={styles.directionsTitle}>🚗 How to Get Here</h3>
                            <ul style={styles.directionsList}>
                                {[
                                    'From city center: Take Avenue Hassan II towards downtown',
                                    'Public transport: Bus lines 12, 45, 78 stop nearby',
                                    'Parking available in the building basement',
                                    'Look for the "YOURShop" sign on the building facade'
                                ].map((item, index) => (
                                    <li key={index} style={styles.directionsListItem}>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <div style={styles.footerSection}>
                        <h3 style={styles.footerLogo}>YOURShop</h3>
                        <p style={styles.footerText}>
                            Visit us today and experience excellence in person.
                        </p>
                    </div>

                    <div style={styles.footerSection}>
                        <h4 style={styles.footerTitle}>Quick Links</h4>
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
                            onClick={() => navigate('/about')}
                        >
                            About
                        </button>
                        <button
                            style={styles.footerLink}
                            onClick={() => navigate('/location')}
                        >
                            Location
                        </button>
                    </div>

                    <div style={styles.footerSection}>
                        <h4 style={styles.footerTitle}>Contact</h4>
                        <p style={styles.footerText}>📍 Casablanca, Morocco</p>
                        <p style={styles.footerText}>📞 +212 612 20 61 15</p>
                        <p style={styles.footerText}>✉️ mouadheba1234@gmail.com</p>
                    </div>
                </div>

                <div style={styles.footerBottom}>
                    <p style={styles.footerBottomText}>
                        © 2025 YOURShop. All rights reserved. | Premium Experience
                    </p>
                </div>
            </footer>
        </div>
    );
}