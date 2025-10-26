import React, { useState } from 'react';
// ❌ We no longer need firebase client here for placing orders
// import { db } from '../firebase'; 
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { menuData } from '../menuData';
import ProductModal from '../components/ProductModal';
import '../assets/styles/POS.css';

// Helper function to format prices
const formatPrice = (price) => `₱${price.toFixed(2)}`;

const POS = () => {
  const [activeCategory, setActiveCategory] = useState(menuData.categories[0].id);
  const [cart, setCart] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const foundCategory = menuData.categories.find(
    (cat) => cat.id === activeCategory
  );
  
  const activeProducts = foundCategory ? foundCategory.products : [];
  const activeCategoryName = foundCategory ? foundCategory.name : 'Uncategorized';

  const handleProductClick = (product, categoryName) => {
    setSelectedProduct({ ...product, categoryName: categoryName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (customizedProduct) => {
    const cartId = `${customizedProduct.id}-${new Date().getTime()}`;
    setCart([...cart, { ...customizedProduct, cartId }]);
    handleCloseModal();
  };

  const handleRemoveFromCart = (cartId) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
  };

  const cartTotal = cart.reduce((total, item) => total + item.finalPrice, 0);

  // --- ✅ (MODIFIED) This function now calls the Electron backend ---
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    if (isPlacingOrder) return;

    setIsPlacingOrder(true);

    try {
      // Call the Electron main process to handle the order and transaction
      const result = await window.electron.placeOrder({
        cart: cart,
        cartTotal: cartTotal
      });

      if (result.success) {
        alert(`Order Placed Successfully! Total: ${formatPrice(cartTotal)}`);
        setCart([]);
      } else {
        // Show the specific error from the backend (e.g., "Not enough stock")
        console.error("Failed to place order:", result.error);
        alert(`Order Failed: ${result.error}`);
      }

    } catch (error) {
      // This catches errors in the IPC call itself
      console.error("Error communicating with main process: ", error);
      alert("Failed to place the order. An application error occurred.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="pos-container">
      {isModalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
        />
      )}

      <div className="pos-main">
        <nav className="pos-categories">
          <ul>
            {menuData.categories.map((category) => (
              <li key={category.id}>
                <button
                  className={activeCategory === category.id ? 'active' : ''}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section className="pos-products">
          <div className="product-grid">
            {activeProducts.map((product) => (
              <button
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product, activeCategoryName)}
              >
                <span className="product-card-name">{product.name}</span>
                <span className="product-card-price">
                  {product.prices.medium && !product.prices.large
                    ? formatPrice(product.prices.medium)
                    : `${formatPrice(product.prices.medium || 0)} - ${formatPrice(product.prices.large || 0)}`}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <aside className="pos-cart">
        <h2 className="cart-title">Current Order</h2>
        
        <div className="cart-items">
          {cart.length === 0 && (
            <p className="cart-empty-message">Your cart is empty.</p>
          )}

          {cart.map((item) => (
            <div key={item.cartId} className="cart-item">
              <div className="cart-item-details">
                <span className="cart-item-name">
                  {item.quantity}x {item.name} ({item.size})
                </span>
                <span className="cart-item-category">
                  {item.categoryName}
                </span>
                <span className="cart-item-mods">
                  {item.sugar}, {item.ice}
                </span>
                {item.addons.length > 0 && (
                  <span className="cart-item-addons">
                    + {item.addons.map(a => a.name).join(', ')}
                  </span>
                )}
              </div>
              <div className="cart-item-actions">
                <span className="cart-item-price">{formatPrice(item.finalPrice)}</span>
                <button 
                  className="cart-item-remove"
                  onClick={() => handleRemoveFromCart(item.cartId)}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-total">
            <span>Total</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <button 
            className="cart-pay-button" 
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || isPlacingOrder}
          >
            {isPlacingOrder ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default POS;