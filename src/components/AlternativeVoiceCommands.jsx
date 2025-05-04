import React, { useState } from 'react';
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { addToCart } from "../utils/cartHelper";
import productsData from "../assets/products.json";

export default function AlternativeVoiceCommands() {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode } = useTheme();
  const { dispatch } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Get unique categories
  const categories = [...new Set(productsData.map(p => p.category))].filter(Boolean);
  
  // Get products for selected category
  const categoryProducts = selectedCategory 
    ? productsData.filter(p => p.category === selectedCategory).slice(0, 6)
    : [];
    
  // Handle adding product to cart
  const handleAddToCart = (product) => {
    try {
      console.log("Adding product to cart:", product);
      
      // Create a standardized product object
      const standardizedProduct = {
        id: product.id || Date.now(),
        title: product.title || "Product",
        price: product.price || 999,
        image: product.image || "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg",
        rating: product.rating || 4,
        reviews: product.reviews || 100,
        category: product.category || "general",
        brand: product.brand || "Amazon",
        qty: 1
      };
      
      // Use the direct method from cartHelper
      const success = addToCart(standardizedProduct);
      
      if (success) {
        // Also try the dispatch method
        dispatch({ type: "ADD", product: standardizedProduct });
        
        // Show success message
        alert(`Added "${standardizedProduct.title}" to your cart!`);
        
        // Close the panel
        setIsOpen(false);
        setSelectedCategory(null);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Sorry, I couldn't add that product to your cart. Please try again.");
    }
  };
  
  // Handle adding popular product to cart
  const handleAddPopularProduct = () => {
    // Get the highest rated product
    const popularProduct = [...productsData].sort((a, b) => b.rating - a.rating)[0];
    handleAddToCart(popularProduct);
  };
  
  // Toggle the panel
  const togglePanel = () => {
    setIsOpen(!isOpen);
    setSelectedCategory(null);
    setSelectedProduct(null);
  };
  
  return (
    <div className="relative">
      {/* Voice command button */}
      <button
        onClick={togglePanel}
        className={`rounded-full p-2 transition-all duration-300 shadow-md ${
          isOpen
            ? "bg-amazon_red text-white scale-110 ring-2 ring-red-300"
            : "bg-amazon_teal text-white hover:bg-amazon_teal-dark hover:scale-105"
        }`}
        title="Quick voice-like commands"
        style={{ minWidth: '40px', minHeight: '40px' }}
      >
        <span className="material-icons">{isOpen ? "close" : "record_voice_over"}</span>
      </button>
      
      {/* Command panel */}
      {isOpen && (
        <div 
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50`}
          onClick={() => setIsOpen(false)}
        >
          <div 
            className={`relative mx-4 w-full max-w-md rounded-lg p-5 shadow-xl ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <span className="material-icons mr-2 text-amazon_teal">record_voice_over</span>
                Voice-Like Commands
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            
            {!selectedCategory && !selectedProduct && (
              <>
                <p className="mb-4 text-sm">
                  Select a command or browse by category:
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={handleAddPopularProduct}
                    className="flex items-center justify-center bg-amazon_yellow text-black font-medium py-3 px-4 rounded-lg hover:bg-amazon_yellow-hover transition-colors"
                  >
                    <span className="material-icons mr-2">add_shopping_cart</span>
                    Add Popular Product
                  </button>
                  
                  <button
                    onClick={() => {
                      const randomIndex = Math.floor(Math.random() * productsData.length);
                      handleAddToCart(productsData[randomIndex]);
                    }}
                    className="flex items-center justify-center bg-amazon_teal text-white font-medium py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    <span className="material-icons mr-2">shuffle</span>
                    Add Random Product
                  </button>
                </div>
                
                <div className="mb-2 font-medium">Browse by category:</div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`text-left p-3 rounded-lg transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-medium capitalize">{category}</div>
                      <div className="text-xs text-gray-500">
                        {productsData.filter(p => p.category === category).length} products
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
            
            {selectedCategory && !selectedProduct && (
              <>
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="mr-2 text-amazon_teal"
                  >
                    <span className="material-icons">arrow_back</span>
                  </button>
                  <h3 className="text-lg font-medium capitalize">{selectedCategory}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {categoryProducts.map(product => (
                    <div
                      key={product.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="w-full h-24 mb-2 bg-white rounded flex items-center justify-center p-2">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg";
                          }}
                        />
                      </div>
                      <div className="text-sm font-medium line-clamp-2">{product.title}</div>
                      <div className="text-amazon_red font-bold mt-1">₹{product.price}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {selectedProduct && (
              <>
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="mr-2 text-amazon_teal"
                  >
                    <span className="material-icons">arrow_back</span>
                  </button>
                  <h3 className="text-lg font-medium">Product Details</h3>
                </div>
                
                <div className="flex mb-4">
                  <div className="w-1/3 bg-white rounded p-2 mr-4">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.title}
                      className="w-full h-auto object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{selectedProduct.title}</h4>
                    <div className="text-amazon_red font-bold text-lg mb-1">₹{selectedProduct.price}</div>
                    <div className="flex items-center text-sm mb-2">
                      <span className="material-icons text-amazon_yellow text-sm mr-1">star</span>
                      <span>{selectedProduct.rating} ({selectedProduct.reviews} reviews)</span>
                    </div>
                    <div className="text-sm capitalize">
                      <span className="font-medium">Category:</span> {selectedProduct.category}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Brand:</span> {selectedProduct.brand}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="w-full bg-amazon_yellow hover:bg-amazon_yellow-hover text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
                >
                  <span className="material-icons mr-2">add_shopping_cart</span>
                  Add to Cart
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
