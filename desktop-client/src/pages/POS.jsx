import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
  // ✅ --- (NEW) Get the category name from the found category ---
  const activeCategoryName = foundCategory ? foundCategory.name : 'Uncategorized';

  // ✅ --- (MODIFIED) This now accepts the category name ---
  const handleProductClick = (product, categoryName) => {
    // ✅ --- (MODIFIED) We add the categoryName to the product object ---
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

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    if (isPlacingOrder) return;

    setIsPlacingOrder(true);

    try {
      const newOrder = {
        items: cart, 
        totalPrice: cartTotal,
        createdAt: serverTimestamp(),
        status: 'Pending', 
      };

      await addDoc(collection(db, 'orders'), newOrder);

      alert(`Order Placed Successfully! Total: ${formatPrice(cartTotal)}`);
      setCart([]);
    } catch (error) {
      console.error("Error placing order: ", error);
      alert("Failed to place the order. Please check your connection and try again.");
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
                // ✅ --- (MODIFIED) Pass the category name when a product is clicked ---
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
                {/* ✅ --- (NEW) Show the category in the cart --- */}
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