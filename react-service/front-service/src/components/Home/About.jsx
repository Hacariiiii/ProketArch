import { useNavigate } from 'react-router-dom';

export default function About() {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
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
                    <h1 style={styles.heroTitle}>About YOURShop</h1>
                    <p style={styles.heroSubtitle}>Where Innovation Meets Excellence</p>
                    <p style={styles.heroDescription}>
                        We're redefining the premium experience with cutting-edge technology
                        and unparalleled service quality.
                    </p>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <main style={styles.main}>
                {/* STORY SECTION */}
                <section style={styles.section}>
                    <div style={styles.sectionContent}>
                        <div style={styles.textContent}>
                            <h2 style={styles.sectionTitle}>Our Story</h2>
                            <p style={styles.sectionText}>
                                Founded in 2025, YourShop emerged from a simple vision: to create
                                a platform that seamlessly blends luxury with technology. What started
                                as a small startup has grown into a leading name in premium services.
                            </p>
                            <p style={styles.sectionText}>
                                Today, we serve thousands of satisfied customers worldwide,
                                constantly pushing the boundaries of what's possible in our industry.
                            </p>
                        </div>
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <span style={styles.statNumber}>10K+</span>
                                <span style={styles.statLabel}>Happy Customers</span>
                            </div>
                            <div style={styles.statCard}>
                                <span style={styles.statNumber}>50+</span>
                                <span style={styles.statLabel}>Premium Products</span>
                            </div>
                            <div style={styles.statCard}>
                                <span style={styles.statNumber}>24/7</span>
                                <span style={styles.statLabel}>Support</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* VALUES SECTION */}
                <section style={styles.valuesSection}>
                    <h2 style={styles.sectionTitleCenter}>Our Core Values</h2>
                    <div style={styles.valuesGrid}>
                        <div style={styles.valueCard}>
                            <div style={styles.valueIcon}>💎</div>
                            <h3 style={styles.valueTitle}>Excellence</h3>
                            <p style={styles.valueText}>
                                We never compromise on quality. Every product and service
                                meets the highest standards of excellence.
                            </p>
                        </div>
                        <div style={styles.valueCard}>
                            <div style={styles.valueIcon}>🚀</div>
                            <h3 style={styles.valueTitle}>Innovation</h3>
                            <p style={styles.valueText}>
                                Constantly evolving with technology to bring you the most
                                advanced solutions available.
                            </p>
                        </div>
                        <div style={styles.valueCard}>
                            <div style={styles.valueIcon}>🤝</div>
                            <h3 style={styles.valueTitle}>Integrity</h3>
                            <p style={styles.valueText}>
                                Honesty and transparency are at the core of everything we do.
                                We build trust through reliable service.
                            </p>
                        </div>
                        <div style={styles.valueCard}>
                            <div style={styles.valueIcon}>❤️</div>
                            <h3 style={styles.valueTitle}>Customer First</h3>
                            <p style={styles.valueText}>
                                Your satisfaction is our priority. We listen, adapt, and
                                deliver exactly what you need.
                            </p>
                        </div>
                    </div>
                </section>

                {/* TEAM SECTION */}
                <section style={styles.teamSection}>
                    <h2 style={styles.sectionTitleCenter}>Meet Our Leadership</h2>
                    <div style={styles.teamGrid}>
                        <div style={styles.teamCard}>
                            <div style={styles.teamAvatar}>👨‍💼</div>
                            <h3 style={styles.teamName}>Alex Morgan</h3>
                            <p style={styles.teamRole}>CEO & Founder</p>
                            <p style={styles.teamBio}>
                                Visionary leader with 15+ years in tech innovation.
                            </p>
                        </div>
                        <div style={styles.teamCard}>
                            <div style={styles.teamAvatar}>👩‍💻</div>
                            <h3 style={styles.teamName}>Sarah Chen</h3>
                            <p style={styles.teamRole}>CTO</p>
                            <p style={styles.teamBio}>
                                Tech expert specializing in AI and machine learning.
                            </p>
                        </div>
                        <div style={styles.teamCard}>
                            <div style={styles.teamAvatar}>👨‍💼</div>
                            <h3 style={styles.teamName}>David Kim</h3>
                            <p style={styles.teamRole}>Head of Operations</p>
                            <p style={styles.teamBio}>
                                Ensures seamless delivery and customer satisfaction.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA SECTION */}
                <section style={styles.ctaSection}>
                    <div style={styles.ctaContent}>
                        <h2 style={styles.ctaTitle}>Ready to Experience Excellence?</h2>
                        <p style={styles.ctaText}>
                            Join thousands of satisfied customers who trust YourShop for
                            premium products and services.
                        </p>
                        <div style={styles.ctaButtons}>
                            <button
                                style={styles.ctaBtnPrimary}
                                onClick={() => navigate('/shop')}
                            >
                                Explore Products
                            </button>
                            <button
                                style={styles.ctaBtnSecondary}
                                onClick={() => navigate('/home')}
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <div style={styles.footerSection}>
                        <h3 style={styles.footerLogo}>YOURShop</h3>
                        <p style={styles.footerText}>
                            Redefining premium experiences through innovation and excellence.
                        </p>
                    </div>

                    <div style={styles.footerSection}>
                        <h4 style={styles.footerTitle}>Quick Links</h4>
                        <button style={styles.footerLink} onClick={() => navigate('/home')}>Home</button>
                        <button style={styles.footerLink} onClick={() => navigate('/shop')}>Products</button>
                        <button style={styles.footerLink} onClick={() => navigate('/about')}>About</button>
                        <button style={styles.footerLink} onClick={() => navigate('/location')}>Location</button>
                    </div>

                    <div style={styles.footerSection}>
                        <h4 style={styles.footerTitle}>Contact Us</h4>
                        <p style={styles.footerText}>📍 Casablanca, Morocco</p>
                        <p style={styles.footerText}>📞 +212 612206115</p>
                        <p style={styles.footerText}>✉️ cSHop123@yourSHop.com</p>
                    </div>
                </div>

                <div style={styles.footerBottom}>
                    <p style={styles.footerBottomText}>© 2025 YOURShop. All rights reserved. | Premium Experience Redefined</p>
                </div>
            </footer>
        </div>
    );
}

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
        position: 'relative'
    },

    // HERO SECTION
    heroSection: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '120px 40px 80px 40px',
        textAlign: 'center'
    },
    heroContent: {
        maxWidth: '800px',
        margin: '0 auto'
    },
    heroTitle: {
        fontSize: '56px',
        fontWeight: '800',
        margin: '0 0 20px 0',
        letterSpacing: '-0.5px'
    },
    heroSubtitle: {
        fontSize: '20px',
        fontWeight: '500',
        opacity: 0.9,
        margin: '0 0 30px 0',
        letterSpacing: '1px'
    },
    heroDescription: {
        fontSize: '18px',
        lineHeight: 1.6,
        opacity: 0.85,
        margin: '0 auto',
        maxWidth: '600px'
    },

    // MAIN CONTENT
    main: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
    },

    // STORY SECTION
    section: {
        padding: '80px 0'
    },
    sectionContent: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'center'
    },
    textContent: {
        paddingRight: '40px'
    },
    sectionTitle: {
        fontSize: '36px',
        fontWeight: '700',
        margin: '0 0 25px 0',
        color: '#1a1a1a',
        lineHeight: 1.2
    },
    sectionText: {
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#666',
        margin: '0 0 20px 0'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
    },
    statCard: {
        backgroundColor: '#f8f9fa',
        padding: '30px 20px',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #eaeaea',
        transition: 'transform 0.3s, box-shadow 0.3s'
    },
    statNumber: {
        display: 'block',
        fontSize: '32px',
        fontWeight: '800',
        color: '#667eea',
        marginBottom: '8px'
    },
    statLabel: {
        fontSize: '14px',
        color: '#666',
        fontWeight: '500'
    },

    // VALUES SECTION
    valuesSection: {
        padding: '80px 0',
        backgroundColor: '#f8f9fa',
        borderRadius: '20px',
        margin: '40px 0'
    },
    sectionTitleCenter: {
        fontSize: '36px',
        fontWeight: '700',
        margin: '0 0 60px 0',
        color: '#1a1a1a',
        textAlign: 'center'
    },
    valuesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px',
        maxWidth: '1000px',
        margin: '0 auto'
    },
    valueCard: {
        backgroundColor: 'white',
        padding: '40px 30px',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s'
    },
    valueIcon: {
        fontSize: '48px',
        marginBottom: '25px'
    },
    valueTitle: {
        fontSize: '20px',
        fontWeight: '700',
        margin: '0 0 15px 0',
        color: '#1a1a1a'
    },
    valueText: {
        fontSize: '14px',
        lineHeight: 1.6,
        color: '#666',
        margin: 0
    },

    // TEAM SECTION
    teamSection: {
        padding: '80px 0'
    },
    teamGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '40px',
        maxWidth: '900px',
        margin: '0 auto'
    },
    teamCard: {
        backgroundColor: 'white',
        padding: '40px 30px',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
        border: '1px solid #f0f0f0'
    },
    teamAvatar: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '36px',
        margin: '0 auto 25px auto'
    },
    teamName: {
        fontSize: '20px',
        fontWeight: '700',
        margin: '0 0 8px 0',
        color: '#1a1a1a'
    },
    teamRole: {
        fontSize: '14px',
        color: '#667eea',
        fontWeight: '600',
        margin: '0 0 15px 0'
    },
    teamBio: {
        fontSize: '14px',
        lineHeight: 1.6,
        color: '#666',
        margin: 0
    },

    // CTA SECTION
    ctaSection: {
        padding: '80px 40px',
        backgroundColor: '#1a1a1a',
        color: 'white',
        borderRadius: '20px',
        margin: '40px 0 80px 0',
        textAlign: 'center'
    },
    ctaContent: {
        maxWidth: '600px',
        margin: '0 auto'
    },
    ctaTitle: {
        fontSize: '36px',
        fontWeight: '700',
        margin: '0 0 20px 0',
        lineHeight: 1.2
    },
    ctaText: {
        fontSize: '18px',
        lineHeight: 1.6,
        opacity: 0.85,
        margin: '0 0 40px 0'
    },
    ctaButtons: {
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap'
    },
    ctaBtnPrimary: {
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        padding: '16px 36px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'transform 0.3s, background-color 0.3s'
    },
    ctaBtnSecondary: {
        backgroundColor: 'transparent',
        color: 'white',
        border: '2px solid rgba(255,255,255,0.3)',
        padding: '16px 36px',
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s'
    },

    // FOOTER
    footer: {
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '60px 40px 30px 40px'
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
        transition: 'color 0.3s'
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