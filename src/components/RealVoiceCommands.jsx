import React, { useState, useEffect, useRef } from 'react';
import { useCart } from "../context/CartContext";
import productsData from "../assets/products.json";

export default function RealVoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { dispatch } = useCart();
  
  const recognitionRef = useRef(null);
  
  // Start listening
  const startListening = () => {
    // Reset states
    setTranscript("");
    setError(null);
    setSelectedProduct(null);
    
    try {
      // Check if speech recognition is supported
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setError("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
        return;
      }
      
      // Create a new recognition instance
      const recognition = new SpeechRecognition();
      
      // Configure recognition
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      // Set up event handlers
      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        console.log("Voice command detected:", speechResult);
        
        // Process the command
        processCommand(speechResult);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        
        if (event.error === 'no-speech') {
          setError("No speech was detected. Please try again and speak clearly.");
        } else if (event.error === 'aborted') {
          // This is normal when stopping
        } else if (event.error === 'network') {
          setError("Network error occurred. Please check your internet connection.");
        } else if (event.error === 'not-allowed') {
          setError("Microphone access was denied. Please allow microphone access to use voice commands.");
        } else {
          setError("An error occurred with voice recognition. Please try again.");
        }
        
        setIsListening(false);
      };
      
      recognition.onend = () => {
        console.log("Recognition ended");
        setIsListening(false);
      };
      
      // Store the recognition instance
      recognitionRef.current = recognition;
      
      // Start recognition
      recognition.start();
      setIsListening(true);
      
    } catch (error) {
      console.error("Error starting recognition:", error);
      setError("Failed to start voice recognition. Please try again.");
      setIsListening(false);
    }
  };
  
  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }
    
    setIsListening(false);
  };
  
  // Process voice command
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
      // If no match, show error
      setError(`Sorry, I couldn't find any products matching "${productName}". Please try again with a different product.`);
    }
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
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error cleaning up speech recognition:", e);
        }
      }
    };
  }, []);
  
  return (
    <div className="relative">
      {/* Voice button */}
      <button
        onClick={() => isListening ? stopListening() : startListening()}
        className={`rounded-full p-2 transition-all duration-300 shadow-md ${
          isListening
            ? "bg-amazon_red text-white animate-pulse scale-110 ring-2 ring-red-300"
            : "bg-amazon_teal text-white hover:bg-amazon_teal-dark hover:scale-105"
        }`}
        title={isListening ? "Stop listening" : "Start voice command"}
      >
        <span className="material-icons">{isListening ? "mic" : "mic_none"}</span>
      </button>
      
      {/* Listening indicator */}
      {isListening && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4 border-2 border-amazon_red">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="material-icons text-amazon_red text-3xl animate-pulse mr-2">mic</span>
                <span className="text-xl font-bold">Listening...</span>
              </div>
              <button
                onClick={stopListening}
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
            
            <p className="text-center text-sm mb-2">
              Say what you want to add to your cart...
            </p>
            
            <div className="text-xs text-center text-gray-500">
              Try "Add iPhone to cart" or "Buy headphones"
            </div>
            
            {transcript && (
              <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">I heard:</p>
                <p className="font-medium">"{transcript}"</p>
              </div>
            )}
            
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="text-sm font-medium">{error}</p>
                <button 
                  className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
                  onClick={() => {
                    setError(null);
                    startListening();
                  }}
                >
                  Try Again
                </button>
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
