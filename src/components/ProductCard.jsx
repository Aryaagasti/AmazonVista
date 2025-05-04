import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  // Format price with commas for Indian currency format
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate discount percentage if original price is available
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Handle Buy Now functionality
  const handleBuyNow = () => {
    // First add to cart
    dispatch({ type: "ADD", product });

    // Redirect to checkout
    window.location.hash = "cart";
  };

  // Handle product click to view details
  const handleProductClick = (e) => {
    // Prevent navigation if clicking on buttons
    if (e.target.closest('button')) {
      return;
    }

    // Navigate to product detail page
    window.location.hash = `product-${product.id}`;
  };

  return (
    <div
      className="bg-white rounded hover:shadow-lg transition-all duration-300 p-3 flex flex-col h-full border border-gray-200 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      <div className="relative mb-2">
        {discountPercentage > 0 && (
          <span className="absolute top-0 left-0 bg-amazon_red text-white text-xs font-bold px-1.5 py-0.5 rounded-br z-10">
            -{discountPercentage}%
          </span>
        )}
        <div className="h-40 flex items-center justify-center bg-white p-2">
          <img
            src={product.image}
            alt={product.title}
            className={`max-h-full max-w-full object-contain transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg";
            }}
          />
        </div>
      </div>

      <div className="flex-grow">
        <h3 className="text-sm text-amazon_blue line-clamp-2 mb-1 hover:text-amazon_orange cursor-pointer">
          {product.title}
        </h3>

        <div className="flex items-center mb-1">
          <div className="flex text-amazon_orange">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < product.rating ? "text-amazon_orange" : "text-gray-300"}>★</span>
            ))}
          </div>
          <span className="ml-1 text-xs text-amazon_teal hover:text-amazon_orange cursor-pointer">
            ({product.reviews})
          </span>
        </div>

        <div className="mb-1">
          <span className="text-amazon_red font-bold text-lg">₹{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-gray-500 text-xs line-through ml-2">
              ₹{formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {product.prime && (
          <div className="flex items-center mb-1">
            <span className="text-xs text-amazon_blue bg-amazon_yellow-hover px-1 rounded">prime</span>
            <span className="text-xs ml-1">FREE Delivery by Tomorrow</span>
          </div>
        )}

        <div className="text-xs text-amazon_green mb-1">In Stock</div>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <button
          className="bg-amazon_yellow hover:bg-amazon_yellow-hover text-black text-sm py-1.5 rounded-full border border-yellow-700 transition-all duration-200 hover:shadow-md cursor-pointer active:scale-95 active:shadow-inner"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card click
            dispatch({ type: "ADD", product });
            // Show a small notification
            alert(`${product.title} added to cart!`);
          }}
        >
          <span className="flex items-center justify-center">
            <span className="material-icons text-sm mr-1">shopping_cart</span>
            Add to Cart
          </span>
        </button>
        <button
          className="bg-amazon_yellow hover:bg-amazon_yellow-hover text-black text-sm py-1.5 rounded-full border border-yellow-700 transition-all duration-200 hover:shadow-md cursor-pointer active:scale-95 active:shadow-inner"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card click
            handleBuyNow();
          }}
        >
          <span className="flex items-center justify-center">
            <span className="material-icons text-sm mr-1">bolt</span>
            Buy Now
          </span>
        </button>
      </div>

      {/* Quick view options that appear on hover - removed to fix black screen issue */}
    </div>
  );
}