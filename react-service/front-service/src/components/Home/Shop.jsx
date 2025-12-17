import React, { useState, useEffect } from 'react';
import { getCartItems, createOrder, testOrderService } from '../../services/orderService';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [shippingAddress, setShippingAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serviceStatus, setServiceStatus] = useState('🔍 Vérification connexion...');
    const [activeTab, setActiveTab] = useState('products');
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [addressDetails, setAddressDetails] = useState('');
    const BASE_IMAGE_URL = "http://localhost:8086/images";

    // Initialize
    useEffect(() => {
        const init = async () => {
            await testConnection();
            await fetchProducts();
        };
        init();
    }, []);

    const testConnection = async () => {
        try {
            const response = await testOrderService();
            setServiceStatus(`✅ Connecté au service commandes (port 8086)`);
            console.log('✅ Test connexion:', response.data);
        } catch (err) {
            setServiceStatus(`❌ Service indisponible: ${err.message}`);
            console.error('❌ Test connexion:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            setError(null);
            setLoading(true);
            console.log('🔄 Chargement produits...');

            const response = await getCartItems();
            console.log('📦 Réponse brute:', response.data);

            let productsArray = [];

            // Multiple structure detection
            if (Array.isArray(response.data)) {
                productsArray = response.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                productsArray = response.data.data;
            } else if (Array.isArray(response.data?.content)) {
                productsArray = response.data.content;
            } else if (Array.isArray(response.data?.products)) {
                productsArray = response.data.products;
            } else if (response.data && typeof response.data === 'object') {
                for (const key in response.data) {
                    if (Array.isArray(response.data[key])) {
                        productsArray = response.data[key];
                        break;
                    }
                }
            }

            if (productsArray.length > 0) {
                const normalized = productsArray.map((item, index) => ({
                    productId: item.productId || item.id || item.productID || index + 1,
                    productName: item.productName || item.name || item.libelle || `Produit ${index + 1}`,
                    price: parseFloat(item.price || item.prix || item.unitPrice || 0),
                    description: item.description || item.desc || 'Description non disponible',
                    image: item.image || ['💻', '🖱️', '⌨️', '🖥️', '📱'][index % 5],
                    category: item.category || 'Général',
                    stock: item.stock || 10
                }));

                setProducts(normalized);
                console.log(`✅ ${normalized.length} produits chargés`);
            } else {
                setError('Aucun produit disponible');
                // Demo products
                setProducts([
                    { productId: 1, productName: 'Laptop Gaming', price: 1299.99, description: 'RTX 4080, 32GB RAM', image: '💻', category: 'Électronique', stock: 5 },
                    { productId: 2, productName: 'Souris Sans Fil', price: 49.99, description: 'RGB, 16000 DPI', image: '🖱️', category: 'Périphériques', stock: 20 },
                    { productId: 3, productName: 'Clavier Mécanique', price: 89.99, description: 'Switches Blue', image: '⌨️', category: 'Périphériques', stock: 15 },
                    { productId: 4, productName: 'Écran 4K 27"', price: 299.99, description: '144Hz, HDR', image: '🖥️', category: 'Électronique', stock: 8 },
                    { productId: 5, productName: 'Casque Gaming', price: 129.99, description: '7.1 Surround', image: '🎧', category: 'Audio', stock: 12 },
                    { productId: 6, productName: 'Webcam 4K', price: 79.99, description: 'Micro intégré', image: '📷', category: 'Vidéo', stock: 25 }
                ]);
            }
        } catch (err) {
            console.error('❌ Erreur:', err);
            setError(`Erreur: ${err.message}`);
            // Demo data on error
            setProducts([
                { productId: 1, productName: 'Laptop Gaming', price: 1299.99, description: 'RTX 4080, 32GB RAM', image: '💻', category: 'Électronique', stock: 5 },
                { productId: 2, productName: 'Souris Sans Fil', price: 49.99, description: 'RGB, 16000 DPI', image: '🖱️', category: 'Périphériques', stock: 20 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Filter products by search
    const filteredProducts = products.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Cart functions
    const addToCart = (product) => {
        const existing = cart.find(item => item.productId === product.productId);
        if (existing) {
            setCart(cart.map(item =>
                item.productId === product.productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(cart.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            ));
        }
    };

    const clearCart = () => {
        if (window.confirm('Vider tout le panier?')) {
            setCart([]);
        }
    };

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    // Create order
    const handleCreateOrder = async () => {
        if (cart.length === 0) {
            alert('🛒 Panier vide!');
            return;
        }

        // SUPPRIME shippingAddress et utilise seulement selectedCity/addressDetails
        if (!selectedCity) {
            alert('📍 Sélectionnez votre ville');
            return;
        }
        if (!addressDetails.trim()) {
            alert('📍 Entrez votre adresse détaillée');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                shippingAddress: `${addressDetails}, ${selectedCity}`, // ← Utilise selectedCity
                city: selectedCity,
                addressDetails: addressDetails,
                items: cart.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: total.toFixed(2)
            };

            console.log('📤 Envoi commande:', orderData);
            const response = await createOrder(orderData);
            console.log('✅ Commande créée:', response.data);

            // Show success
            setOrderSuccess({
                orderNumber: response.data?.orderNumber || `CMD-${Date.now()}`,
                total: total.toFixed(2),
                itemsCount: cart.length
            });

            // Reset: SUPPRIME shippingAddress
            setCart([]);
            setSelectedCity('');
            setAddressDetails('');

        } catch (err) {
            console.error('❌ Erreur commande:', err);
            alert(`Erreur: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Styles
    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },

        header: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1.5rem 2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        },

        headerContent: {
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
        },

        title: {
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '0.5rem',
            background: 'linear-gradient(45deg, #fff, #e0e0e0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },

        subtitle: {
            fontSize: '1.1rem',
            opacity: 0.9,
            marginBottom: '1rem'
        },

        statusBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '50px',
            fontSize: '0.9rem',
            marginTop: '1rem'
        },

        nav: {
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '1.5rem',
            flexWrap: 'wrap'
        },

        navBtn: {
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },

        navBtnActive: {
            background: 'white',
            color: '#667eea',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        },

        main: {
            maxWidth: '1200px',
            margin: '2rem auto',
            padding: '0 1rem'
        },

        // Search Bar
        searchBar: {
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem'
        },

        searchInput: {
            flex: 1,
            padding: '0.75rem 1.5rem',
            border: '2px solid #e0e0e0',
            borderRadius: '50px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border 0.3s'
        },

        // Debug Panel
        debugPanel: {
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
        },

        debugGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            margin: '1.5rem 0'
        },

        debugCard: {
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '12px',
            borderLeft: '4px solid #667eea'
        },

        btnTest: {
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '1rem',
            transition: 'background 0.3s'
        },

        // Alerts
        errorAlert: {
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            animation: 'slideIn 0.3s'
        },

        successAlert: {
            background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '2rem',
            animation: 'slideIn 0.5s'
        },

        // Products Grid
        productsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem'
        },

        productCard: {
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            border: '1px solid #e0e0e0'
        },

        productImage: {
            height: '180px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            color: 'white'
        },

        productInfo: {
            padding: '1.5rem'
        },

        productTitle: {
            margin: '0 0 0.5rem 0',
            color: '#2c3e50',
            fontSize: '1.2rem',
            lineHeight: 1.4
        },

        productDesc: {
            color: '#7f8c8d',
            fontSize: '0.9rem',
            margin: '0 0 1rem 0',
            lineHeight: 1.5
        },

        productFooter: {
            padding: '1rem 1.5rem',
            background: '#f8f9fa',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },

        price: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#2c3e50'
        },

        btnAddCart: {
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s'
        },

        // Cart
        cartItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '1.5rem',
            background: '#f8f9fa',
            borderRadius: '12px',
            marginBottom: '1rem',
            gap: '1.5rem',
            borderLeft: '4px solid #667eea'
        },

        quantityControl: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },

        qtyBtn: {
            background: 'white',
            border: '1px solid #ddd',
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },

        summary: {
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem'
        },

        summaryRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            fontSize: '1rem'
        },

        summaryTotal: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '2px solid #e0e0e0',
            fontSize: '1.25rem',
            fontWeight: 'bold'
        },

        // Buttons
        btnPrimary: {
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'transform 0.3s'
        },

        btnDanger: {
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
        },

        btnSuccess: {
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
        },

        // Loading
        loadingContainer: {
            textAlign: 'center',
            padding: '3rem',
            color: '#7f8c8d'
        },

        spinner: {
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
        },

        // Footer
        footer: {
            marginTop: '3rem',
            padding: '1.5rem',
            textAlign: 'center',
            color: '#7f8c8d',
            fontSize: '0.9rem',
            borderTop: '1px solid #e0e0e0'
        },

        // Animations
        '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
        },

        '@keyframes slideIn': {
            from: { transform: 'translateY(-20px)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 }
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>🛍️ Boutique en Ligne</h1>
                    <p style={styles.subtitle}>Découvrez nos produits exclusifs</p>
                    <div style={styles.statusBadge}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            marginRight: '8px',
                            background: serviceStatus.includes('✅') ? '#2ecc71' : '#e74c3c',
                            boxShadow: serviceStatus.includes('✅') ? '0 0 10px #2ecc71' : '0 0 10px #e74c3c'
                        }}></span>
                        {serviceStatus}
                    </div>
                </div>

                {/* Navigation */}
                <div style={styles.nav}>
                    <button
                        style={{
                            ...styles.navBtn,
                            ...(activeTab === 'products' ? styles.navBtnActive : {})
                        }}
                        onClick={() => setActiveTab('products')}
                    >
                        📦 Produits ({products.length})
                    </button>
                    <button
                        style={{
                            ...styles.navBtn,
                            ...(activeTab === 'cart' ? styles.navBtnActive : {})
                        }}
                        onClick={() => setActiveTab('cart')}
                    >
                        🛒 Panier ({cart.length})
                        {cart.length > 0 && ` - $${total.toFixed(2)}`}
                    </button>
                    <button
                        style={{
                            ...styles.navBtn,
                            ...(activeTab === 'debug' ? styles.navBtnActive : {})
                        }}
                        onClick={() => setActiveTab('debug')}
                    >
                        🔧 Debug
                    </button>
                </div>
            </header>

            <main style={styles.main}>
                {/* Debug Panel */}
                {activeTab === 'debug' && (
                    <div style={styles.debugPanel}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>🔧 Panneau Debug</h3>
                        <div style={styles.debugGrid}>
                            <div style={styles.debugCard}>
                                <h4 style={{ marginTop: 0 }}>Connexion</h4>
                                <p>Port Order Service: 8086</p>
                                <p>Statut: {serviceStatus}</p>
                                <button
                                    onClick={testConnection}
                                    style={styles.btnTest}
                                >
                                    🔄 Tester
                                </button>
                            </div>
                            <div style={styles.debugCard}>
                                <h4 style={{ marginTop: 0 }}>Données</h4>
                                <p>Produits: {products.length}</p>
                                <p>Panier: {cart.length} articles</p>
                                <button
                                    onClick={fetchProducts}
                                    style={styles.btnTest}
                                >
                                    📦 Recharger
                                </button>
                            </div>
                            <div style={styles.debugCard}>
                                <h4 style={{ marginTop: 0 }}>API</h4>
                                <p>Endpoint: /api/orders/cart-items</p>
                                <p>Total: ${total.toFixed(2)}</p>
                                <button
                                    onClick={() => console.log('Cart:', cart)}
                                    style={styles.btnTest}
                                >
                                    📋 Log Panier
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Bar (Products tab only) */}
                {activeTab === 'products' && (
                    <div style={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="🔍 Rechercher un produit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                        <button
                            onClick={fetchProducts}
                            style={{
                                ...styles.btnPrimary,
                                padding: '0.75rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            disabled={loading}
                        >
                            {loading ? '⏳' : '🔄'} Actualiser
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div style={styles.errorAlert}>
                        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0 }}>{error}</p>
                            <small>Service Order: port 8086</small>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Order Success */}
                {orderSuccess && (
                    <div style={styles.successAlert}>
                        <div style={{ fontSize: '3rem' }}>✅</div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Commande Confirmée!</h3>
                            <p style={{ margin: '0.25rem 0' }}><strong>N°:</strong> {orderSuccess.orderNumber}</p>
                            <p style={{ margin: '0.25rem 0' }}><strong>Articles:</strong> {orderSuccess.itemsCount}</p>
                            <p style={{ margin: '0.25rem 0' }}><strong>Total:</strong> ${orderSuccess.total}</p>
                            <small>Email de confirmation envoyé</small>
                        </div>
                        <button
                            onClick={() => setOrderSuccess(null)}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '1.2rem'
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2rem',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <h2 style={{ margin: 0, color: '#2c3e50' }}>
                                📦 Catalogue ({filteredProducts.length} produits)
                            </h2>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                                    {searchTerm && `Résultats pour: "${searchTerm}"`}
                                </span>
                            </div>
                        </div>

                        {loading && products.length === 0 ? (
                            <div style={styles.loadingContainer}>
                                <div style={styles.spinner}></div>
                                <p>Chargement des produits...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem',
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📭</div>
                                <h3 style={{ color: '#2c3e50' }}>Aucun produit trouvé</h3>
                                <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
                                    {searchTerm ? 'Aucun résultat pour votre recherche' : 'Le catalogue est vide'}
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        fetchProducts();
                                    }}
                                    style={styles.btnPrimary}
                                >
                                    {searchTerm ? '↻ Tout afficher' : '🔄 Recharger'}
                                </button>
                            </div>
                        ) : (
                            <div style={styles.productsGrid}>
                                {filteredProducts.map(product => (
                                    <div key={product.productId} style={styles.productCard}>




                                        <div style={styles.productImage}>
                                            <img
                                                src={`${BASE_IMAGE_URL}/${product.image}`}
                                                alt={product.productName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>

                                        <div style={styles.productInfo}>
                                            <h3 style={styles.productTitle}>{product.productName}</h3>
                                            <p style={styles.productDesc}>{product.description}</p>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: '0.8rem',
                                                color: '#95a5a6'
                                            }}>
                                                <span>{product.category}</span>
                                                <span>Stock: {product.stock}</span>
                                            </div>
                                        </div>

                                        <div style={styles.productFooter}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={styles.price}>${product.price.toFixed(2)}</span>
                                                {product.price > 100 && (
                                                    <small style={{ color: '#2ecc71', fontSize: '0.8rem' }}>
                                                        🚚 Livraison gratuite
                                                    </small>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => addToCart(product)}
                                                style={{
                                                    ...styles.btnAddCart,
                                                    opacity: product.stock <= 0 ? 0.6 : 1,
                                                    cursor: product.stock <= 0 ? 'not-allowed' : 'pointer'
                                                }}
                                                disabled={product.stock <= 0}
                                            >
                                                {product.stock > 0 ? '🛒 Ajouter' : 'Rupture'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Cart Tab */}
                {activeTab === 'cart' && (
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2rem',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <h2 style={{ margin: 0, color: '#2c3e50' }}>
                                🛒 Votre Panier ({cart.length} articles)
                            </h2>
                            {cart.length > 0 && (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={clearCart}
                                        style={styles.btnDanger}
                                    >
                                        🗑️ Vider
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('products')}
                                        style={{
                                            background: '#3498db',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        ← Ajouter plus
                                    </button>
                                </div>
                            )}
                        </div>

                        {cart.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem',
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🛒</div>
                                <h3 style={{ color: '#2c3e50' }}>Panier vide</h3>
                                <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
                                    Ajoutez des produits pour commencer vos achats
                                </p>
                                <button
                                    onClick={() => setActiveTab('products')}
                                    style={styles.btnPrimary}
                                >
                                    👈 Voir les produits
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Cart Items */}
                                <div style={{ marginBottom: '2rem' }}>
                                    {cart.map(item => (
                                        <div key={item.productId} style={styles.cartItem}>
                                            <div style={{
                                                fontSize: '2.5rem',
                                                background: 'white',
                                                width: '80px',
                                                height: '80px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                            }}>
                                                {item.image}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
                                                    {item.productName}
                                                </h4>
                                                <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                                                    {item.description}
                                                </p>
                                                <p style={{ margin: 0, color: '#2c3e50', fontWeight: '600' }}>
                                                    ${item.price.toFixed(2)} × {item.quantity} =
                                                    <span style={{ color: '#667eea', marginLeft: '0.5rem' }}>
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                                                <div style={styles.quantityControl}>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                        style={styles.qtyBtn}
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                                        style={{
                                                            width: '60px',
                                                            height: '36px',
                                                            textAlign: 'center',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '6px',
                                                            fontSize: '1rem'
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                        style={styles.qtyBtn}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.productId)}
                                                    style={{
                                                        background: '#e74c3c',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary */}
                                <div style={styles.summary}>
                                    <h3 style={{ marginTop: 0, color: '#2c3e50' }}>📋 Récapitulatif</h3>

                                    {/* REMPLACE LE TEXTAREA PAR CE CODE: */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{
                                            display: 'block',
                                            fontWeight: '600',
                                            marginBottom: '8px',
                                            color: '#2c3e50'
                                        }}>
                                            📍 Ville de livraison
                                        </label>

                                        <select
                                            value={selectedCity}
                                            onChange={(e) => setSelectedCity(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                backgroundColor: 'white',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="">-- Choisir ville --</option>
                                            <option value="casablanca">Casablanca</option>
                                            <option value="rabat">Rabat</option>
                                            <option value="fes">Fès</option>
                                            <option value="marrakech">Marrakech</option>
                                            <option value="tanger">Tanger</option>
                                            <option value="agadir">Agadir</option>
                                            <option value="meknes">Meknès</option>
                                            <option value="oujda">Oujda</option>
                                            <option value="kenitra">Kénitra</option>
                                            <option value="tetouan">Tétouan</option>
                                            <option value="safi">Safi</option>
                                            <option value="eljadida">El Jadida</option>
                                            <option value="nador">Nador</option>
                                            <option value="settat">Settat</option>
                                            <option value="berrechid">Berrechid</option>
                                            <option value="khouribga">Khouribga</option>
                                            <option value="benimellal">Béni Mellal</option>
                                            <option value="essaouira">Essaouira</option>
                                            <option value="larache">Larache</option>
                                            <option value="guelmim">Guelmim</option>
                                            <option value="dakhla">Dakhla</option>
                                            <option value="laayoune">Laâyoune</option>
                                            <option value="autre">Autre ville</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontWeight: '600',
                                            marginBottom: '8px',
                                            color: '#2c3e50'
                                        }}>
                                            📍 Adresse détaillée
                                        </label>

                                        <textarea
                                            value={addressDetails}
                                            onChange={(e) => setAddressDetails(e.target.value)}
                                            placeholder={selectedCity ? `Votre adresse à ${selectedCity}...` : "Sélectionnez ville d'abord"}
                                            rows="3"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box'
                                            }}
                                            disabled={!selectedCity}
                                        />
                                    </div>

                                    <div style={styles.summaryRow}>
                                        <span>Sous-total</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div style={styles.summaryRow}>
                                        <span>Taxes (10%)</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <div style={styles.summaryRow}>
                                        <span>Livraison</span>
                                        <span>{shipping === 0 ? 'GRATUIT' : `$${shipping.toFixed(2)}`}</span>
                                    </div>
                                    <div style={styles.summaryTotal}>
                                        <span>Total</span>
                                        <span style={{ color: '#667eea', fontSize: '1.5rem' }}>
                                            ${total.toFixed(2)}
                                        </span>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        marginTop: '2rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        <button
                                            onClick={() => setActiveTab('products')}
                                            style={{
                                                ...styles.btnPrimary,
                                                background: '#95a5a6',
                                                flex: 1
                                            }}
                                        >
                                            ← Continuer mes achats
                                        </button>
                                        <button
                                            onClick={handleCreateOrder}
                                            disabled={loading || !selectedCity || !addressDetails.trim()}
                                            style={{
                                                ...styles.btnSuccess,
                                                flex: 2,
                                                opacity: (!selectedCity || !addressDetails.trim() || loading) ? 0.6 : 1,
                                                cursor: (!selectedCity || !addressDetails.trim() || loading) ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            {loading ? (
                                                <>
            <span style={{
                border: '2px solid #fff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                animation: 'spin 1s linear infinite'
            }}></span>
                                                    Traitement...
                                                </>
                                            ) : (
                                                '✅ Commander maintenant'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={styles.footer}>
                <p>🛡️ Paiement sécurisé • 🚚 Livraison rapide • 📞 Support 24/7</p>
                <p>
                    Service Commandes: port 8086 •
                    Panier: {cart.length} articles •
                    Total: ${total.toFixed(2)} •
                    {new Date().toLocaleDateString('fr-FR')}
                </p>
            </footer>

            {/* Add CSS animations */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideIn {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                input:focus, textarea:focus {
                    border-color: #667eea !important;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
                }
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                button:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
}