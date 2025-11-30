import React, { useState, useEffect } from 'react';
import { getCartItems, createOrder } from '../../services/orderService';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [shippingAddress, setShippingAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch products from API
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setError(null);
            console.log('🔄 Fetching products...');

            const response = await getCartItems();
            console.log('✅ Response received:', response);
            console.log('📦 Response data:', response.data);

            if (!response.data || response.data.length === 0) {
                console.warn('⚠️ No products found in response');
                setError('No products available');
                return;
            }

            const productsWithDetails = response.data.map(item => {
                console.log('Processing item:', item);
                return {
                    ...item,
                    description: item.description || 'Premium product',
                    image: item.image || '📦'
                };
            });

            console.log('✅ Products loaded:', productsWithDetails);
            setProducts(productsWithDetails);
        } catch (err) {
            console.error('❌ Error fetching products:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(`Error loading products: ${err.message}`);
        }
    };

    const addToCart = (product) => {
        console.log('➕ Adding to cart:', product);
        const existing = cart.find(item => item.productId === product.productId);
        if (existing) {
            setCart(cart.map(item =>
                item.productId === product.productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
            console.log('Updated quantity for existing item');
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
            console.log('Added new item to cart');
        }
    };

    const removeFromCart = (productId) => {
        console.log('🗑️ Removing from cart:', productId);
        setCart(cart.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        console.log('🔄 Updating quantity:', productId, quantity);
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(cart.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            ));
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const handleCreateOrder = async () => {
        console.log('🛒 Creating order...');
        console.log('Cart:', cart);
        console.log('Shipping address:', shippingAddress);

        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }
        if (!shippingAddress.trim()) {
            alert('Enter shipping address');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                shippingAddress,
                items: cart.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            console.log('📤 Sending order data:', orderData);
            const response = await createOrder(orderData);
            console.log('✅ Order created:', response.data);

            alert(`✅ Order created: ${response.data.orderNumber}`);
            setCart([]);
            setShippingAddress('');
        } catch (err) {
            console.error('❌ Error creating order:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            alert('Error: ' + (err.response?.data?.error || err.message));
        }
        setLoading(false);
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.header}>
                <h1 style={styles.title}>🛍️ Shopping Cart</h1>
                <p style={styles.subtitle}>Browse products and checkout</p>
            </div>

            <div style={styles.mainContainer}>
                {/* DEBUG INFO */}
                <div style={styles.debugBox}>
                    <h3 style={styles.debugTitle}>🔍 Debug Info</h3>
                    <div style={styles.debugContent}>
                        <p><strong>Products Count:</strong> {products.length}</p>
                        <p><strong>Cart Count:</strong> {cart.length}</p>
                        <p><strong>Error:</strong> {error || 'None'}</p>
                        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                    </div>
                    {products.length > 0 && (
                        <details style={styles.debugDetails}>
                            <summary style={styles.debugSummary}>View Products Data</summary>
                            <pre style={styles.debugPre}>
                                {JSON.stringify(products, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>

                {/* ERROR DISPLAY */}
                {error && (
                    <div style={styles.errorBox}>
                        <p style={styles.errorText}>⚠️ {error}</p>
                        <button onClick={fetchProducts} style={styles.retryBtn}>
                            🔄 Retry
                        </button>
                    </div>
                )}

                {/* PRODUCTS */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>📦 Available Products</h2>
                    {products.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '15px' }}>
                                {error ? 'Failed to load products' : 'Loading products...'}
                            </p>
                            <button onClick={fetchProducts} style={styles.retryBtn}>
                                🔄 Reload Products
                            </button>
                        </div>
                    ) : (
                        <div style={styles.productsGrid}>
                            {products.map(product => (
                                <div key={product.productId} style={styles.productCard}>
                                    <div style={styles.productImage}>{product.image}</div>
                                    <h3 style={styles.productName}>{product.productName}</h3>
                                    <p style={styles.productDescription}>{product.description}</p>
                                    <div style={styles.productFooter}>
                                        <span style={styles.price}>${product.price.toFixed(2)}</span>
                                        <button
                                            onClick={() => addToCart(product)}
                                            style={styles.addBtn}
                                        >
                                            ➕ Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CART */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>🛒 Your Cart ({cart.length})</h2>

                    {cart.length === 0 ? (
                        <div style={styles.emptyCart}>
                            <p style={styles.emptyText}>Your cart is empty</p>
                            <p style={styles.emptySubtext}>Add products to get started!</p>
                        </div>
                    ) : (
                        <div>
                            <div style={styles.cartItems}>
                                {cart.map(item => (
                                    <div key={item.productId} style={styles.cartItem}>
                                        <div style={styles.itemImage}>{item.image}</div>

                                        <div style={styles.itemDetails}>
                                            <h4 style={styles.itemName}>{item.productName}</h4>
                                            <p style={styles.itemPrice}>${item.price.toFixed(2)}</p>
                                        </div>

                                        <div style={styles.quantityControl}>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                style={styles.quantityBtn}
                                            >
                                                ➖
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                                style={styles.quantityInput}
                                            />
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                style={styles.quantityBtn}
                                            >
                                                ➕
                                            </button>
                                        </div>

                                        <div style={styles.itemTotal}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            style={styles.removeBtn}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div style={styles.checkout}>
                                <div style={styles.addressBox}>
                                    <label style={styles.label}>📍 Shipping Address</label>
                                    <input
                                        type="text"
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Enter your shipping address"
                                        style={styles.addressInput}
                                    />
                                </div>

                                <div style={styles.summary}>
                                    <div style={styles.summaryRow}>
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div style={styles.summaryRow}>
                                        <span>Tax (10%)</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <div style={styles.summaryTotal}>
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div style={styles.buttons}>
                                    <button onClick={() => setCart([])} style={styles.clearBtn}>
                                        Clear Cart
                                    </button>
                                    <button
                                        onClick={handleCreateOrder}
                                        disabled={loading}
                                        style={{...styles.checkoutBtn, opacity: loading ? 0.6 : 1}}
                                    >
                                        ✅ {loading ? 'Processing...' : 'Checkout'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageContainer: {
        backgroundColor: '#f5f7fa',
        minHeight: '100vh',
        paddingTop: '20px',
        paddingBottom: '40px'
    },
    header: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center',
        marginBottom: '30px'
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '0 0 10px 0'
    },
    subtitle: {
        fontSize: '16px',
        opacity: 0.9,
        margin: 0
    },
    mainContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
    },
    debugBox: {
        backgroundColor: '#fff3cd',
        border: '2px solid #ffc107',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
    },
    debugTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#856404',
        margin: '0 0 15px 0'
    },
    debugContent: {
        fontSize: '14px',
        color: '#856404'
    },
    debugDetails: {
        marginTop: '15px'
    },
    debugSummary: {
        cursor: 'pointer',
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: '10px'
    },
    debugPre: {
        backgroundColor: '#fff',
        padding: '10px',
        borderRadius: '4px',
        overflow: 'auto',
        fontSize: '12px',
        maxHeight: '300px'
    },
    errorBox: {
        backgroundColor: '#f8d7da',
        border: '2px solid #f5c6cb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    errorText: {
        color: '#721c24',
        fontSize: '16px',
        margin: '0 0 15px 0'
    },
    retryBtn: {
        backgroundColor: '#ffc107',
        color: '#856404',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 20px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    section: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0 0 20px 0'
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px 20px'
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px'
    },
    productCard: {
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        padding: '15px',
        textAlign: 'center'
    },
    productImage: {
        fontSize: '60px',
        marginBottom: '10px'
    },
    productName: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '10px 0 5px 0'
    },
    productDescription: {
        fontSize: '12px',
        color: '#7f8c8d',
        margin: '0 0 15px 0'
    },
    productFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    price: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#667eea'
    },
    addBtn: {
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    emptyCart: {
        textAlign: 'center',
        padding: '60px 20px'
    },
    emptyText: {
        fontSize: '20px',
        color: '#7f8c8d',
        margin: '0 0 10px 0'
    },
    emptySubtext: {
        fontSize: '14px',
        color: '#95a5a6',
        margin: 0
    },
    cartItems: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        marginBottom: '25px'
    },
    cartItem: {
        display: 'grid',
        gridTemplateColumns: '60px 1fr 150px 100px 50px',
        gap: '15px',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '4px solid #667eea'
    },
    itemImage: {
        fontSize: '40px',
        textAlign: 'center'
    },
    itemDetails: {
        display: 'flex',
        flexDirection: 'column'
    },
    itemName: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0 0 5px 0'
    },
    itemPrice: {
        fontSize: '12px',
        color: '#7f8c8d',
        margin: 0
    },
    quantityControl: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    quantityBtn: {
        backgroundColor: '#e0e0e0',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 8px',
        cursor: 'pointer'
    },
    quantityInput: {
        width: '50px',
        padding: '5px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        textAlign: 'center'
    },
    itemTotal: {
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#667eea'
    },
    removeBtn: {
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '8px',
        cursor: 'pointer'
    },
    checkout: {
        borderTop: '2px solid #e0e0e0',
        paddingTop: '25px'
    },
    addressBox: {
        marginBottom: '20px'
    },
    label: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#2c3e50',
        display: 'block',
        marginBottom: '8px'
    },
    addressInput: {
        width: '100%',
        padding: '12px',
        border: '2px solid #e0e0e0',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    summary: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '6px',
        marginBottom: '20px'
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        fontSize: '14px'
    },
    summaryTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '2px solid #e0e0e0',
        fontSize: '16px',
        fontWeight: 'bold'
    },
    buttons: {
        display: 'flex',
        gap: '15px'
    },
    clearBtn: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    checkoutBtn: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
    }
};