import React, { useState, useMemo } from 'react';
import { menuData } from '../menuData';
import '../assets/styles/POS.css';

const formatPrice = (price) => `₱${price.toFixed(2)}`;

const ProductModal = ({ product, onClose, onAddToCart }) => {
  const availableSizes = Object.keys(product.prices);
  
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]);
  const [selectedSugar, setSelectedSugar] = useState(menuData.options.sugar[1]);
  const [selectedIce, setSelectedIce] = useState(menuData.options.ice[0]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const finalPrice = useMemo(() => {
    const basePrice = product.prices[selectedSize];
    const addonsPrice = selectedAddons.reduce((total, addon) => total + addon.price, 0);
    return (basePrice + addonsPrice) * quantity;
  }, [selectedSize, selectedAddons, quantity, product.prices]);

  const handleAddonToggle = (addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const handleSubmit = () => {
    const customizedProduct = {
      id: product.id,
      name: product.name,
      // ✅ --- (NEW) Add the categoryName from the product prop ---
      categoryName: product.categoryName || 'Uncategorized',
      size: selectedSize,
      sugar: selectedSugar,
      ice: selectedIce,
      addons: selectedAddons,
      quantity: quantity,
      basePrice: product.prices[selectedSize],
      finalPrice: finalPrice,
    };
    onAddToCart(customizedProduct);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product.name}</h2>
          <button className="modal-close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {availableSizes.length > 1 && (
            <div className="modal-group">
              <h3 className="modal-group-title">Size</h3>
              <div className="modal-options-grid">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    className={`modal-option-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    <span>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                    <span>{formatPrice(product.prices[size])}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="modal-group">
            <h3 className="modal-group-title">Sugar Level</h3>
            <div className="modal-options-grid columns-2">
              {menuData.options.sugar.map((sugar) => (
                <button
                  key={sugar}
                  className={`modal-option-btn ${selectedSugar === sugar ? 'active' : ''}`}
                  onClick={() => setSelectedSugar(sugar)}
                >
                  {sugar}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-group">
            <h3 className="modal-group-title">Ice Level</h3>
            <div className="modal-options-grid columns-3">
              {menuData.options.ice.map((ice) => (
                <button
                  key={ice}
                  className={`modal-option-btn ${selectedIce === ice ? 'active' : ''}`}
                  onClick={() => setSelectedIce(ice)}
                >
                  {ice}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-group">
            <h3 className="modal-group-title">Add-ons</h3>
            <div className="modal-options-grid columns-2">
              {menuData.addons.map((addon) => (
                <button
                  key={addon.id}
                  className={`modal-option-btn ${selectedAddons.find(a => a.id === addon.id) ? 'active' : ''}`}
                  onClick={() => handleAddonToggle(addon)}
                >
                  <span>{addon.name}</span>
                  <span>+ {formatPrice(addon.price)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="modal-quantity">
             {/* Quantity controls can be added here */}
          </div>
          <button className="modal-add-to-cart-btn" onClick={handleSubmit}>
            <span>Add {quantity} to Cart</span>
            <span>{formatPrice(finalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;