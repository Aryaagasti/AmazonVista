import React, { useState } from 'react';
import { useCart } from "../context/CartContext";
import productsData from "../assets/products.json";

export default function SimpleVoiceCommands() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { dispatch } = useCart();
  
  // Popular products for quick add
  const popularProducts = productsData
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
  
  // Handle adding product to cart
  const handleAddToCart = (product) => {
    // Show confirmation first
    setSelectedProduct(product);
    setShowConfirmation(true);
    setShowDropdown(false);
  };
  
  // Confirm adding to cart
  const confirmAddToCart = () => {
    if (!selectedProduct) return;
    
    try {
      // Add to cart using dispatch
      dispatch({ 
        type: "ADD", 
        product: {
          ...selectedProduct,
          qty: 1
        } 
      });
      
      // Show success message
      alert(`Added "${selectedProduct.title}" to your cart!`);
      
      // Reset state
      setShowConfirmation(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("There was an error adding the product to your cart.");
    }
  };
  
  // Cancel confirmation
  const cancelConfirmation = () => {
    setShowConfirmation(false);
    setSelectedProduct(null);
  };
  
  return (
    <div className="relative">
      {/* Voice button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="rounded-full p-2 bg-amazon_teal text-white hover:bg-amazon_teal-dark transition-colors shadow-md"
        title="Voice shopping"
      >
        <span className="material-icons">mic</span>
      </button>
      
      {/* Dropdown menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-bold text-gray-700 flex items-center">
              <span className="material-icons text-amazon_teal mr-2">record_voice_over</span>
              Quick Voice Commands
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Click a product to add it to your cart
            </p>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {popularProducts.map(product => (
              <div 
                key={product.id}
                className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 flex items-center"
                onClick={() => handleAddToCart(product)}
              >
                <div className="w-10 h-10 flex-shrink-0 mr-2">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.title}</p>
                  <p className="text-xs text-amazon_red font-bold">₹{product.price}</p>
                </div>
                <span className="material-icons text-amazon_teal text-sm">add_shopping_cart</span>
              </div>
            ))}
          </div>
          
          <div className="p-2 text-center text-xs text-gray-500 border-t border-gray-200">
            Top rated products for quick add
          </div>
        </div>
      )}
      
      {/* Confirmation modal */}
      {showConfirmation && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-3 flex items-center">
              <span className="material-icons text-amazon_teal mr-2">add_shopping_cart</span>
              Add to Cart
            </h3>
            
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 flex-shrink-0 mr-3 bg-white border border-gray-200 rounded p-1">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg";
                  }}
                />
              </div>
              <div>
                <p className="font-medium">{selectedProduct.title}</p>
                <p className="text-amazon_red font-bold">₹{selectedProduct.price}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
                onClick={cancelConfirmation}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 bg-amazon_yellow hover:bg-amazon_yellow-hover rounded text-black font-medium"
                onClick={confirmAddToCart}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
