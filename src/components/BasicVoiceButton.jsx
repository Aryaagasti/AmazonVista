import React, { useState } from 'react';
import { useCart } from "../context/CartContext";
import productsData from "../assets/products.json";

export default function BasicVoiceButton() {
  const [isActive, setIsActive] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [simulatedText, setSimulatedText] = useState("");
  const { dispatch } = useCart();
  
  // Popular products for quick add
  const popularProducts = productsData
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);
  
  // Simulate voice recognition
  const simulateVoiceRecognition = () => {
    setIsActive(true);
    setSimulatedText("");
    
    // Randomly select a product
    const randomProduct = popularProducts[Math.floor(Math.random() * popularProducts.length)];
    
    // Create a simulated voice command
    const commands = [
      `Add ${randomProduct.title} to cart`,
      `Buy ${randomProduct.title}`,
      `I want to buy ${randomProduct.title}`,
      `${randomProduct.title}`
    ];
    
    const selectedCommand = commands[Math.floor(Math.random() * commands.length)];
    
    // Simulate typing effect
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i <= selectedCommand.length) {
        setSimulatedText(selectedCommand.substring(0, i));
        i++;
      } else {
        clearInterval(typingInterval);
        
        // After typing finishes, show product
        setTimeout(() => {
          setIsActive(false);
          setSelectedProduct(randomProduct);
          setShowConfirmation(true);
        }, 500);
      }
    }, 50);
  };
  
  // Handle adding product to cart
  const handleAddToCart = () => {
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
        onClick={simulateVoiceRecognition}
        className={`rounded-full p-2 transition-all duration-300 shadow-md ${
          isActive
            ? "bg-amazon_red text-white animate-pulse scale-110 ring-2 ring-red-300"
            : "bg-amazon_teal text-white hover:bg-amazon_teal-dark hover:scale-105"
        }`}
        title="Voice shopping"
      >
        <span className="material-icons">{isActive ? "mic" : "mic_none"}</span>
      </button>
      
      {/* Listening simulation */}
      {isActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4 border-2 border-amazon_red">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="material-icons text-amazon_red text-3xl animate-pulse mr-2">mic</span>
                <span className="text-xl font-bold">Listening...</span>
              </div>
              <button
                onClick={() => setIsActive(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-2 h-5 bg-amazon_red rounded-full animate-bounce"></div>
              <div className="w-2 h-8 bg-amazon_red rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-12 bg-amazon_red rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              <div className="w-2 h-8 bg-amazon_red rounded-full animate-bounce" style={{ animationDelay: "0.6s" }}></div>
              <div className="w-2 h-5 bg-amazon_red rounded-full animate-bounce" style={{ animationDelay: "0.8s" }}></div>
            </div>
            
            {simulatedText && (
              <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">I heard:</p>
                <p className="font-medium">"{simulatedText}"</p>
              </div>
            )}
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
                onClick={handleAddToCart}
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
