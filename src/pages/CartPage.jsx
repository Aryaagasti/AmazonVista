import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GeminiRecommendations from "../components/GeminiRecommendations";
import VoiceCommandButton from "../components/VoiceCommandButton";
import ProductChatbot from "../components/ProductChatbot";
import productsData from "../assets/products.json";

export default function CartPage({ onClose }) {
  const { cart, dispatch } = useCart();
  const { darkMode } = useTheme();
  const [giftOption, setGiftOption] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Format price with commas for Indian currency format
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const totalItems = cart.items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Calculate delivery fee and discount
  const deliveryFee = subtotal > 0 ? (subtotal > 10000 ? 0 : 99) : 0;
  const discount = couponCode === "AMAZON10" ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + deliveryFee - discount;

  // Handle checkout
  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.hash = "checkout";
  };

  // Handle coupon application
  const applyCoupon = () => {
    if (couponCode === "AMAZON10") {
      alert("Coupon AMAZON10 applied successfully! 10% discount");
    } else {
      alert("Invalid coupon code");
      setCouponCode("");
    }
  };

  return (
    <div className={`bg-amazon_gray-light min-h-screen ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar />
      <ProductChatbot currentProduct={cart.items.length > 0 ? cart.items[0] : null} />

      <div className="min-h-screen bg-white">
        <div className="w-full max-w-screen-xl mx-auto bg-white flex flex-col">
          {/* Cart Header */}
          <div className="bg-[#232F3E] text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <a href="/" className="text-white mr-3 hover:bg-gray-700 p-1 rounded-full transition-colors duration-200">
                <span className="material-icons">arrow_back</span>
              </a>
              <h2 className="font-bold text-xl flex items-center">
                <span className="material-icons mr-2 text-2xl">shopping_cart</span>
                Shopping Cart
                <span className="text-sm font-normal ml-2">({totalItems} items)</span>
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              {/* Voice Command Button */}
              <div className="flex items-center bg-amazon_teal bg-opacity-20 px-2 py-1 rounded-full border border-amazon_teal">
                <VoiceCommandButton
                  onAddToCart={(product) => {
                    dispatch({ type: "ADD", product });
                  }}
                  onRemoveFromCart={(productId) => {
                    dispatch({ type: "REMOVE", id: productId });
                  }}
                />
                <span className="text-xs ml-1 font-medium hidden xs:inline whitespace-nowrap">Voice Shop</span>
              </div>
              <a href="/" className="text-white hover:bg-gray-700 p-2 rounded-full transition-colors duration-200">
                <span className="material-icons">home</span>
              </a>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 p-4 bg-white">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <span className="material-icons text-8xl text-amazon_yellow mb-8">shopping_cart</span>
                <h3 className="text-3xl font-bold mb-4">Your Amazon Cart is empty</h3>
                <p className="text-lg text-gray-600 mb-8">Shop today's deals</p>
                <button
                  onClick={() => window.location.hash = ""}
                  className="bg-amazon_yellow hover:bg-amazon_yellow-hover text-black font-semibold py-3 px-10 rounded-md transition-all duration-300 hover:shadow-md cursor-pointer active:scale-[0.98] active:shadow-inner w-1/2 max-w-md text-lg inline-block"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="border-b pb-3 mb-6">
                  <h3 className="font-bold text-2xl mb-2">Shopping Cart</h3>
                  <div className="flex justify-between items-center">
                    <button
                      className="text-amazon_teal text-sm hover:text-amazon_orange hover:underline cursor-pointer transition-colors duration-200"
                      onClick={() => dispatch({ type: "CLEAR" })}
                    >
                      Deselect all items
                    </button>
                    <div className="text-sm text-gray-600 font-medium">Price</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    {cart.items.map(item => (
                      <div key={item.id} className="flex border-b pb-6 mb-6">
                        <div className="w-36 h-36 flex-shrink-0 mr-6">
                          <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                        </div>

                        <div className="flex-1">
                          <div className="font-medium text-amazon_blue hover:text-amazon_orange cursor-pointer text-lg">
                            {item.title}
                          </div>

                          {item.prime && (
                            <div className="flex items-center my-2">
                              <span className="text-sm text-amazon_blue bg-amazon_yellow-hover px-1 rounded mr-1">prime</span>
                              <span className="text-sm">FREE Delivery</span>
                            </div>
                          )}

                          <div className="text-base text-amazon_green mb-2 font-medium">In Stock</div>

                          <div className="flex items-center text-sm">
                            <div className="border border-gray-300 rounded-md inline-flex">
                              <button
                                className="px-2 py-1 border-r border-gray-300 hover:bg-gray-100 transition-colors duration-200 cursor-pointer active:bg-gray-200"
                                onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, qty: item.qty - 1 })}
                                disabled={item.qty === 1}
                              >
                                -
                              </button>
                              <span className="px-3 py-1">{item.qty}</span>
                              <button
                                className="px-2 py-1 border-l border-gray-300 hover:bg-gray-100 transition-colors duration-200 cursor-pointer active:bg-gray-200"
                                onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, qty: item.qty + 1 })}
                              >
                                +
                              </button>
                            </div>

                            <div className="mx-2 text-gray-400">|</div>

                            <button
                              className="text-amazon_teal hover:text-amazon_orange hover:underline cursor-pointer transition-colors duration-200 active:text-red-600"
                              onClick={() => dispatch({ type: "REMOVE", id: item.id })}
                            >
                              Delete
                            </button>

                            <div className="mx-2 text-gray-400">|</div>

                            <button className="text-amazon_teal hover:text-amazon_orange hover:underline cursor-pointer transition-colors duration-200">
                              Save for later
                            </button>
                          </div>
                        </div>

                        <div className="text-right font-bold text-lg">
                          ₹{formatPrice(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-1">
                    {/* Order Summary */}
                    <div className="bg-gray-50 p-6 rounded shadow-sm border border-gray-200 sticky top-4">
                      <div className="text-right text-xl font-bold mb-4">
                        Subtotal ({totalItems} items): ₹{formatPrice(subtotal)}
                      </div>

                      <div className="text-sm mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Delivery Charges:</span>
                          <span className={deliveryFee === 0 ? 'text-amazon_green font-medium' : ''}>
                            {deliveryFee === 0 ? 'FREE' : `₹${formatPrice(deliveryFee)}`}
                          </span>
                        </div>

                        {discount > 0 && (
                          <div className="flex justify-between mb-2 text-amazon_green">
                            <span className="font-medium">Discount (AMAZON10):</span>
                            <span className="font-medium">-₹{formatPrice(discount)}</span>
                          </div>
                        )}

                        <div className="border-t pt-3 mt-2 font-bold flex justify-between text-base">
                          <span>Order Total:</span>
                          <span>₹{formatPrice(total)}</span>
                        </div>
                      </div>

                      {/* Coupon Section */}
                      <div className="border-t border-b py-3 mb-4">
                        {showCouponInput ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              placeholder="Enter coupon code"
                              className="border p-2 flex-1 mr-2 rounded"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <button
                              className="bg-amazon_yellow px-3 py-2 rounded text-sm font-medium cursor-pointer hover:bg-amazon_yellow-hover"
                              onClick={applyCoupon}
                            >
                              Apply
                            </button>
                          </div>
                        ) : (
                          <button
                            className="text-amazon_teal hover:text-amazon_orange hover:underline text-sm flex items-center cursor-pointer"
                            onClick={() => setShowCouponInput(true)}
                          >
                            <span className="material-icons text-sm mr-1">local_offer</span>
                            Apply a coupon
                          </button>
                        )}
                      </div>

                      <button
                        className="w-full bg-amazon_yellow hover:bg-amazon_yellow-hover text-black font-semibold py-3 rounded-md mb-3 flex items-center justify-center transition-all duration-300 hover:shadow-md cursor-pointer active:scale-[0.98] active:shadow-inner text-base"
                        onClick={handleCheckout}
                      >
                        <span className="material-icons mr-2">shopping_bag</span>
                        Proceed to Buy ({totalItems} items)
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="lg:col-span-3 mt-6">
                  <GeminiRecommendations
                    cartItems={cart.items}
                    onAddToCart={(product) => {
                      try {
                        console.log("Adding recommended product to cart:", product);

                        // Create a standardized product object
                        const standardizedProduct = {
                          id: product.id || Date.now(),
                          title: product.title || product.name || "Recommended Product",
                          price: typeof product.price === 'number' ? product.price :
                                 (product.priceRange ? parseInt(product.priceRange.replace(/[^\d]/g, '')) : 999),
                          image: product.image || product.imageUrl || "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg",
                          rating: product.rating || 4.5,
                          reviews: product.reviews || 120,
                          category: product.category || "recommended",
                          brand: product.brand || "Recommended"
                        };

                        console.log("Standardized product:", standardizedProduct);

                        // Use the direct method from cartHelper
                        import("../utils/cartHelper").then(module => {
                          const success = module.addToCart(standardizedProduct);
                          if (success) {
                            console.log("Successfully added recommended product");
                            // Also try the dispatch method
                            dispatch({ type: "ADD", product: standardizedProduct });
                          }
                        });

                        // Show success message
                        setTimeout(() => {
                          alert(`Added ${standardizedProduct.title} to your cart!`);
                        }, 100);
                      } catch (error) {
                        console.error("Error adding recommended product:", error);
                        alert("There was an error adding the product. Please try again.");
                      }
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Cart Footer */}
          {cart.items.length > 0 && (
            <div className="p-6 bg-white border-t mt-6">
              <div className="max-w-screen-xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4"
                      checked={giftOption}
                      onChange={() => setGiftOption(!giftOption)}
                    />
                    <span className="text-sm">This order contains a gift</span>
                  </div>

                  {/* EMI Option */}
                  {subtotal > 3000 && (
                    <div className="text-sm">
                      <span className="text-amazon_teal font-medium">EMI available</span> on orders above ₹3,000
                    </div>
                  )}

                  <button
                    onClick={() => window.location.hash = ""}
                    className="md:w-auto px-8 border border-gray-300 bg-gray-100 hover:bg-gray-200 text-black font-semibold py-2 rounded-md transition-all duration-300 hover:shadow-md cursor-pointer active:scale-[0.98] active:shadow-inner inline-block text-center"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Floating Voice Command Button for Mobile */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50">
        <div className="bg-amazon_teal rounded-full p-3 shadow-lg flex items-center justify-center relative">
          {/* Attention-grabbing animation */}
          <div className="absolute inset-0 rounded-full bg-amazon_teal animate-ping opacity-50"></div>
          <div className="absolute inset-0 rounded-full border-4 border-white animate-pulse"></div>

          <div className="relative">
            <VoiceCommandButton
              onAddToCart={(product) => {
                try {
                  console.log("Cart page adding product:", product);
                  dispatch({ type: "ADD", product });
                  console.log("Product added successfully from cart page");
                } catch (error) {
                  console.error("Error adding product from cart page:", error);
                  alert("There was an error adding the product. Please try again.");
                }
              }}
              onRemoveFromCart={(productId) => {
                try {
                  console.log("Cart page removing product:", productId);
                  dispatch({ type: "REMOVE", id: productId });
                  console.log("Product removed successfully from cart page");
                } catch (error) {
                  console.error("Error removing product from cart page:", error);
                  alert("There was an error removing the product. Please try again.");
                }
              }}
            />
          </div>

          {/* Label */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full shadow-md text-xs font-bold text-amazon_teal whitespace-nowrap">
            Try "Add product"
          </div>
        </div>
      </div>
    </div>
  );
}
