import React, { useState } from 'react';
import { useCart } from "../context/CartContext";
import productsData from "../assets/products.json";
import { addToCart } from "../utils/cartHelper";

export default function SimulatedVoiceCommands() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { dispatch } = useCart();
  
  // Common voice commands
  const VOICE_COMMANDS = [
    "Add iPhone to cart",
    "Add headphones",
    "Buy Samsung TV",
    "Add laptop to cart",
    "Buy smartwatch",
    "Add camera"
  ];
  
  // Simulate voice recognition
  const simulateVoiceRecognition = (command) => {
    // Start "listening" animation
    setIsOpen(true);
    setIsListening(true);
    setTranscript("");
    
    // Simulate typing effect for the command
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i <= command.length) {
        setTranscript(command.substring(0, i));
        i++;
      } else {
        clearInterval(typingInterval);
        
        // After typing finishes, process the command
        setTimeout(() => {
          setIsListening(false);
          processCommand(command);
        }, 500);
      }
    }, 50);
  };
  
  // Process the command
  const processCommand = (command) => {
    const commandLower = command.toLowerCase();
    
    // Extract product name from command
    let productName = "";
    
    if (commandLower.includes("add") || commandLower.includes("buy")) {
      productName = commandLower
        .replace("add", "")
        .replace("buy", "")
        .replace("to cart", "")
        .trim();
    } else {
      productName = commandLower;
    }
    
    // Find matching product
    const matchingProducts = productsData.filter(product => 
      product.title.toLowerCase().includes(productName) ||
      product.category.toLowerCase().includes(productName) ||
      product.brand.toLowerCase().includes(productName)
    );
    
    if (matchingProducts.length > 0) {
      // Sort by rating to get the best match
      const bestMatch = [...matchingProducts].sort((a, b) => b.rating - a.rating)[0];
      setSelectedProduct(bestMatch);
      setShowConfirmation(true);
    } else {
      // If no match, get a random popular product
      const popularProducts = [...productsData].sort((a, b) => b.rating - a.rating).slice(0, 5);
      const randomProduct = popularProducts[Math.floor(Math.random() * popularProducts.length)];
      setSelectedProduct(randomProduct);
      setShowConfirmation(true);
    }
  };
  
  // Handle adding product to cart
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    try {
      // Create a standardized product object
      const standardizedProduct = {
        id: selectedProduct.id,
        title: selectedProduct.title,
        price: selectedProduct.price,
        image: selectedProduct.image,
        rating: selectedProduct.rating,
        reviews: selectedProduct.reviews,
        category: selectedProduct.category,
        brand: selectedProduct.brand,
        qty: 1
      };
      
      // Add to cart
      const success = addToCart(standardizedProduct);
      
      if (success) {
        // Also update context
        dispatch({ type: "ADD", product: standardizedProduct });
        
        // Show success message
        alert(`Added "${standardizedProduct.title}" to your cart!`);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("There was an error adding the product. Please try again.");
    } finally {
      // Reset state
      setShowConfirmation(false);
      setSelectedProduct(null);
      setIsOpen(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedProduct(null);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      {/* Voice button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`rounded-full p-2 transition-all duration-300 shadow-md ${
          isListening
            ? "bg-amazon_red text-white animate-pulse scale-110 ring-2 ring-red-300"
            : "bg-amazon_teal text-white hover:bg-amazon_teal-dark hover:scale-105"
        }`}
        title="Voice shopping"
        style={{ minWidth: '40px', minHeight: '40px' }}
      >
        <span className="material-icons">{isListening ? "mic" : "mic_none"}</span>
      </button>
      
      {/* Voice command panel */}
      {isOpen && !isListening && !showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-xl font-bold mb-4 flex items-center">
              <span className="material-icons text-amazon_teal mr-2">record_voice_over</span>
              Voice Shopping
            </div>
            
            <p className="mb-4">
              Click on any voice command below to simulate speaking:
            </p>
            
            <div className="grid grid-cols-1 gap-2 mb-4">
              {VOICE_COMMANDS.map((command, index) => (
                <button
                  key={index}
                  className="bg-gray-100 hover:bg-gray-200 text-left p-3 rounded-lg flex items-center"
                  onClick={() => simulateVoiceRecognition(command)}
                >
                  <span className="material-icons text-amazon_teal mr-2">mic</span>
                  {command}
                </button>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Listening simulation */}
      {isListening && (
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl rounded-lg p-5 z-[9999] w-[90%] max-w-md border-2 border-amazon_red">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="material-icons text-amazon_red text-3xl animate-pulse mr-2">mic</span>
              <span className="text-xl font-bold">Listening...</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-2 h-5 bg-amazon_red rounded-full animate-bounce"></div>
            <div className="w-2 h-8 bg-amazon_red rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-12 bg-amazon_red rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            <div className="w-2 h-8 bg-amazon_red rounded-full animate-bounce" style={{ animationDelay: "0.6s" }}></div>
            <div className="w-2 h-5 bg-amazon_red rounded-full animate-bounce" style={{ animationDelay: "0.8s" }}></div>
          </div>
          
          {transcript ? (
            <div className="mt-2 text-lg font-medium text-center p-3 bg-amazon_yellow-light rounded-lg border border-amazon_yellow">
              <div className="text-sm text-gray-600 mb-1">I heard:</div>
              "{transcript}"
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm italic">
              Waiting for you to speak...
            </div>
          )}
        </div>
      )}
      
      {/* Confirmation dialog */}
      {showConfirmation && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-amazon_yellow">
            <div className="text-xl font-bold mb-3 flex items-center">
              <span className="material-icons text-amazon_teal mr-2">add_shopping_cart</span>
              Confirm Voice Command
            </div>
            
            <div className="mb-4 text-lg">
              <p>Add <span className="font-medium text-amazon_teal">{selectedProduct.title}</span> to your cart?</p>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-5 border border-gray-200">
              <div className="w-20 h-20 flex-shrink-0 mr-4 bg-white p-2 rounded border border-gray-200">
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
                <div className="text-base font-medium">{selectedProduct.title}</div>
                <div className="text-amazon_red font-bold text-lg">₹{selectedProduct.price}</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="sm:flex-1 bg-amazon_yellow hover:bg-amazon_yellow-hover text-black py-3 px-4 rounded-lg font-bold flex items-center justify-center"
                onClick={handleAddToCart}
              >
                <span className="material-icons mr-2">check_circle</span>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
