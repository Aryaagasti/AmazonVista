import React, { useState, useRef, useEffect } from "react";
import { getChatbotResponse } from "../services/localRecommendationService";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { addToCart } from "../utils/cartHelper";
import productsData from "../assets/products.json";

export default function ProductChatbot({ currentProduct = null }) {
  const { darkMode } = useTheme();
  const { dispatch } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load initial welcome message and recommendations when chat is opened
  useEffect(() => {
    if (isOpen) {
      // Focus input
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current.focus();
        }, 100);
      }

      // If no messages yet, add welcome message with recommendations
      if (messages.length === 0) {
        // Add welcome message
        const welcomeMessage = {
          role: "assistant",
          content: currentProduct
            ? `Hi there! I'm your Amazon shopping assistant. I see you're looking at ${currentProduct.title}. How can I help you today?`
            : "Hi there! I'm your Amazon shopping assistant. Here are some products you might like:",
          timestamp: new Date()
        };

        setMessages([welcomeMessage]);

        // Get recommendations
        try {
          // Get response from local recommendation service with "hi" as input
          const response = getChatbotResponse("hi", currentProduct);

          // Add product recommendations if available
          if (response.recommendations && response.recommendations.length > 0) {
            // Add product recommendations as a special message
            setTimeout(() => {
              const recommendationsMessage = {
                role: "recommendations",
                products: response.recommendations,
                timestamp: new Date()
              };

              setMessages(prev => [...prev, recommendationsMessage]);
            }, 500); // Small delay for better UX
          }
        } catch (error) {
          console.error("Error getting initial recommendations:", error);
        }
      }
    }
  }, [isOpen, messages.length, currentProduct]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Get response from local recommendation service
      const response = getChatbotResponse(inputValue, currentProduct);

      // Add assistant message
      const assistantMessage = {
        role: "assistant",
        content: response.text,
        timestamp: new Date(),
        isError: false
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Add product recommendations if available
      if (response.recommendations && response.recommendations.length > 0) {
        // Add product recommendations as a special message
        const recommendationsMessage = {
          role: "recommendations",
          products: response.recommendations,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, recommendationsMessage]);
      }
    } catch (error) {
      console.error("Error getting chatbot response:", error);

      // Add error message
      const errorMessage = {
        role: "assistant",
        content: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // We don't need to find products in text anymore since our local service provides recommendations directly

  // Handle adding a product to cart
  const handleAddToCart = (product) => {
    try {
      console.log("Adding product to cart from chatbot:", product);

      // Create a standardized product object
      const standardizedProduct = {
        id: product.id || Date.now(),
        title: product.name || product.title || "Product",
        price: typeof product.price === 'number' ? product.price :
               (product.priceRange ? parseInt(product.priceRange.split(' ')[0].replace('₹', '')) : 999),
        image: product.imageUrl || product.image || "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg",
        rating: product.rating || 4,
        reviews: product.reviews || 100,
        category: product.category || "general",
        brand: product.brand || "Amazon"
      };

      console.log("Standardized product:", standardizedProduct);

      // Use the direct method from cartHelper
      const success = addToCart(standardizedProduct);

      if (success) {
        // Also try the dispatch method
        dispatch({ type: "ADD", product: standardizedProduct });

        // Add a confirmation message
        const confirmationMessage = {
          role: "assistant",
          content: `I've added "${standardizedProduct.title}" to your cart!`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, confirmationMessage]);
      }
    } catch (error) {
      console.error("Error adding product to cart from chatbot:", error);

      // Add error message
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I couldn't add that product to your cart. Please try again.",
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render message based on role
  const renderMessage = (message, index) => {
    if (message.role === "recommendations") {
      return (
        <div key={index} className="flex flex-col space-y-2 mb-4">
          <div className="text-sm text-gray-500 mb-1">Recommended Products:</div>
          <div className="grid grid-cols-1 gap-2">
            {message.products.map((product, productIndex) => (
              <div
                key={productIndex}
                className={`flex items-center p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} hover:shadow-md transition-all duration-200`}
              >
                <div className="w-12 h-12 flex-shrink-0 mr-2 bg-white rounded">
                  <img
                    src={product.imageUrl || product.image || "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg"}
                    alt={product.name || product.title || "Product"}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name || product.title || "Product"}</p>
                  <p className="text-xs text-amazon_red font-bold">
                    ₹{typeof product.price === 'number' ? product.price : (product.priceRange ? product.priceRange.split(' ')[0].replace('₹', '') : '999')}
                  </p>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="ml-2 bg-amazon_yellow hover:bg-amazon_yellow-hover text-black text-xs font-medium py-1 px-2 rounded"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}
      >
        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 ${
            message.role === "user"
              ? `${darkMode ? 'bg-amazon_teal text-white' : 'bg-amazon_teal-light text-black'}`
              : `${darkMode ? 'bg-gray-800' : 'bg-gray-100'} ${message.isError ? 'border border-red-300' : ''}`
          }`}
        >
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          <div className={`text-xs mt-1 ${message.role === "user" ? "text-gray-200" : "text-gray-500"}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 ${
          darkMode ? 'bg-amazon_teal text-white' : 'bg-amazon_yellow text-black'
        } hover:scale-110`}
        aria-label="Open chat assistant"
      >
        <span className="material-icons">support_agent</span>
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md h-[600px] rounded-lg shadow-xl flex flex-col ${
              darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
            }`}
          >
            {/* Chat header */}
            <div className={`px-4 py-3 flex items-center justify-between border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <span className="material-icons text-amazon_teal mr-2">support_agent</span>
                <h3 className="font-medium">Amazon Shopping Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                aria-label="Close chat"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message, index) => renderMessage(message, index))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className={`rounded-lg px-4 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Chat input */}
            <form onSubmit={handleSendMessage} className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about products..."
                  className={`flex-1 px-4 py-2 rounded-l-lg border ${
                    darkMode
                      ? 'bg-gray-800 text-white border-gray-700 focus:border-amazon_teal'
                      : 'bg-white text-black border-gray-300 focus:border-amazon_yellow'
                  } focus:outline-none`}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-r-lg ${
                    darkMode
                      ? 'bg-amazon_teal text-white'
                      : 'bg-amazon_yellow text-black'
                  } disabled:opacity-50`}
                  disabled={isLoading || !inputValue.trim()}
                >
                  <span className="material-icons">send</span>
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Ask me about products, recommendations, or shopping advice!
              </div>

              {/* Suggested queries */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setInputValue("Show me electronics");
                    setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 100);
                  }}
                  className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} hover:bg-amazon_yellow hover:text-black transition-colors`}
                >
                  Show electronics
                </button>
                <button
                  onClick={() => {
                    setInputValue("Recommend products under 1000");
                    setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 100);
                  }}
                  className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} hover:bg-amazon_yellow hover:text-black transition-colors`}
                >
                  Products under ₹1000
                </button>
                <button
                  onClick={() => {
                    setInputValue("Best mobile phones");
                    setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 100);
                  }}
                  className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} hover:bg-amazon_yellow hover:text-black transition-colors`}
                >
                  Best mobile phones
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
