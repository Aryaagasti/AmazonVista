import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import productsData from '../assets/products.json';

export default function BudgetAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [budget, setBudget] = useState(() => {
    const savedBudget = localStorage.getItem('amazonCloneBudget');
    return savedBudget ? parseFloat(savedBudget) : 45000; // Default budget of 45000
  });
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'suggestions'
  const { cart, dispatch } = useCart();

  // Calculate total cart value
  const cartTotal = cart.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Calculate remaining budget
  const remainingBudget = budget - cartTotal;

  // Calculate percentage of budget used
  const budgetUsedPercentage = Math.min((cartTotal / budget) * 100, 100);

  // Save budget to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('amazonCloneBudget', budget.toString());
  }, [budget]);

  // Handle budget update
  const handleBudgetUpdate = () => {
    if (tempBudget > 0) {
      setBudget(tempBudget);
      setEditingBudget(false);
    }
  };

  // Get budget status color
  const getBudgetStatusColor = () => {
    if (budgetUsedPercentage < 50) return 'bg-green-500';
    if (budgetUsedPercentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get recommendations based on remaining budget
  const getRecommendations = () => {
    if (remainingBudget <= 0) {
      return "You've reached your budget limit. Consider removing some items.";
    }

    if (remainingBudget < 1000) {
      return "You're close to your budget limit. Shop carefully!";
    }

    if (remainingBudget < 5000) {
      return "You have a good amount left in your budget. Shop wisely!";
    }

    return "You have plenty of budget left. Happy shopping!";
  };

  // Get product recommendations based on remaining budget
  const getProductRecommendations = () => {
    // Filter products that are under the remaining budget
    const affordableProducts = productsData.filter(product => product.price <= remainingBudget);

    // Sort by rating (highest first)
    const sortedProducts = [...affordableProducts].sort((a, b) => b.rating - a.rating);

    // Return top products (limit to 12 for better scrolling)
    return sortedProducts.slice(0, 12);
  };

  // Handle adding product to cart
  const handleAddToCart = (product) => {
    dispatch({
      type: "ADD",
      product: {
        ...product,
        qty: 1
      }
    });

    // Show confirmation
    alert(`Added "${product.title}" to your cart!`);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Budget Assistant Button */}
      <button
        className="bg-amazon_yellow text-black p-3 rounded-full shadow-lg hover:bg-amazon_yellow-hover transition-all duration-300 flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        title="Budget Assistant"
      >
        <span className="material-icons">
          {isOpen ? 'close' : 'savings'}
        </span>
      </button>

      {/* Budget Assistant Panel */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 bg-white rounded-lg shadow-xl border border-gray-200 w-96 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="bg-amazon_yellow text-black p-3">
            <h3 className="font-bold text-lg flex items-center">
              <span className="material-icons mr-2">savings</span>
              Budget Assistant
            </h3>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'summary'
                ? 'border-b-2 border-amazon_yellow text-amazon_blue'
                : 'text-gray-500 hover:text-amazon_blue'}`}
              onClick={() => setActiveTab('summary')}
            >
              <span className="flex items-center justify-center">
                <span className="material-icons text-sm mr-1">account_balance_wallet</span>
                Budget Summary
              </span>
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'suggestions'
                ? 'border-b-2 border-amazon_yellow text-amazon_blue'
                : 'text-gray-500 hover:text-amazon_blue'}`}
              onClick={() => setActiveTab('suggestions')}
            >
              <span className="flex items-center justify-center">
                <span className="material-icons text-sm mr-1">shopping_bag</span>
                Product Suggestions
              </span>
            </button>
          </div>

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="p-4">
              {/* Budget Setting */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Your Budget:</span>
                  {editingBudget ? (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">₹</span>
                      <input
                        type="number"
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                        value={tempBudget}
                        onChange={(e) => setTempBudget(parseFloat(e.target.value) || 0)}
                        min="1"
                      />
                      <button
                        className="ml-2 text-amazon_blue hover:text-amazon_orange"
                        onClick={handleBudgetUpdate}
                      >
                        <span className="material-icons text-sm">check</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="font-bold">₹{budget.toLocaleString()}</span>
                      <button
                        className="ml-2 text-gray-500 hover:text-amazon_orange"
                        onClick={() => {
                          setTempBudget(budget);
                          setEditingBudget(true);
                        }}
                      >
                        <span className="material-icons text-sm">edit</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Budget Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Budget Used:</span>
                  <span className="text-sm">{budgetUsedPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${getBudgetStatusColor()}`}
                    style={{ width: `${budgetUsedPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Cart Summary */}
              <div className="mb-4 bg-gray-50 p-3 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Cart Total:</span>
                  <span className="font-bold">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Remaining:</span>
                  <span className={`font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{remainingBudget.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-800">
                <div className="flex">
                  <span className="material-icons text-yellow-600 mr-2">lightbulb</span>
                  <p>{getRecommendations()}</p>
                </div>
              </div>

              {/* View Suggestions Button */}
              <button
                className="w-full mt-4 bg-amazon_yellow hover:bg-amazon_yellow-hover text-black font-medium py-2 rounded flex items-center justify-center"
                onClick={() => setActiveTab('suggestions')}
              >
                <span className="material-icons mr-2">shopping_bag</span>
                View Products Within Your Budget
              </button>
            </div>
          )}

          {/* Product Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="flex flex-col h-full max-h-[calc(80vh-100px)]">
              <div className="p-4 border-b">
                <h4 className="font-medium text-base mb-1 flex items-center">
                  <span className="material-icons text-amazon_blue mr-1">shopping_bag</span>
                  Products Under ₹{remainingBudget.toLocaleString()}
                </h4>
                <p className="text-xs text-gray-500">
                  Showing products that fit within your remaining budget
                </p>
              </div>

              {remainingBudget <= 0 ? (
                <div className="p-4">
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700 mb-4">
                    <p>You've reached your budget limit. Consider removing some items from your cart or increasing your budget.</p>
                  </div>

                  <button
                    className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded flex items-center justify-center"
                    onClick={() => setActiveTab('summary')}
                  >
                    <span className="material-icons mr-2">arrow_back</span>
                    Back to Budget Summary
                  </button>
                </div>
              ) : (
                <>
                  {/* Scrollable product grid */}
                  <div className="flex-1 overflow-y-auto p-4 pb-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {getProductRecommendations().map(product => (
                        <div
                          key={product.id}
                          className="border border-gray-200 rounded p-3 hover:shadow-md transition-all duration-200 bg-white"
                        >
                          <div className="h-28 flex items-center justify-center bg-white mb-2">
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
                          <div className="text-sm font-medium line-clamp-2 mb-2">{product.title}</div>
                          <div className="flex justify-between items-center">
                            <span className="text-amazon_red font-bold text-base">₹{product.price.toLocaleString()}</span>
                            <button
                              className="bg-amazon_yellow hover:bg-amazon_yellow-hover text-black text-xs py-1 px-2 rounded flex items-center"
                              onClick={() => handleAddToCart(product)}
                            >
                              <span className="material-icons text-xs mr-1">add_shopping_cart</span>
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fixed footer */}
                  <div className="p-3 border-t bg-white">
                    <button
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded flex items-center justify-center"
                      onClick={() => setActiveTab('summary')}
                    >
                      <span className="material-icons mr-2">arrow_back</span>
                      Back to Budget Summary
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
