import { useState, useEffect } from "react";
import { getRecommendations } from "../services/localRecommendationService";

export default function GeminiRecommendations({ cartItems, onAddToCart }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);

  // Get recommendations when cart items change
  useEffect(() => {
    const fetchRecommendations = () => {
      // Always fetch recommendations, even if cart is empty
      setLoading(true);
      setError(null);

      try {
        // Use our local recommendation service
        const result = getRecommendations(cartItems);

        // Local service always returns an array of recommendations
        setRecommendations(result);
        setRawResponse(null);
      } catch (err) {
        setError("Failed to get recommendations");
        console.error("Error in GeminiRecommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [cartItems]);

  // Format price range for display
  const formatPriceRange = (priceRange) => {
    if (!priceRange) return "";

    // If it's already in the right format, return as is
    if (priceRange.startsWith("₹")) return priceRange;

    // Otherwise, add the rupee symbol
    return `₹${priceRange}`;
  };

  // Generate a placeholder image URL based on product name
  const getPlaceholderImage = (productName) => {
    // Use a placeholder image service with the product name as seed
    return `https://source.unsplash.com/300x300/?${encodeURIComponent(productName.split(' ')[0])}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="material-icons mr-2 text-amazon_teal">psychology</span>
          AI Recommendations
        </h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon_teal"></div>
        </div>
      </div>
    );
  }

  // We don't need to show an error message anymore since we're using local recommendations
  if (error) {
    console.log("Error in recommendations, but using local service:", error);
  }

  // Return null if no recommendations and no raw response
  if (recommendations.length === 0 && !rawResponse) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="material-icons mr-2 text-amazon_teal">recommend</span>
        Recommended For You
      </h2>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recommendations.map((product, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded p-3 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="h-40 flex items-center justify-center mb-2">
                <img
                  src={product.imageUrl || getPlaceholderImage(product.name || "Product")}
                  alt={product.name || "Recommended Product"}
                  className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.log("Image failed to load, using fallback");
                    e.target.onerror = null;
                    e.target.src = "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg";
                  }}
                />
              </div>

              <h3 className="text-sm font-medium line-clamp-2 mb-1 hover:text-amazon_teal">
                {product.name}
              </h3>

              <div className="text-xs text-gray-600 mb-2 line-clamp-3">
                {product.description}
              </div>

              <div className="text-xs bg-amazon_yellow-light p-2 rounded mb-2 line-clamp-3">
                <span className="font-medium">Why we suggest this: </span>
                {product.reason}
              </div>

              <div className="font-bold mt-auto text-amazon_red">
                {formatPriceRange(product.priceRange)}
              </div>

              <button
                className="mt-2 bg-amazon_yellow hover:bg-amazon_yellow-hover text-black text-xs py-1 rounded-full border border-yellow-700 transition-all duration-200 hover:shadow-md cursor-pointer active:scale-95"
                onClick={() => onAddToCart({
                  id: product.id || Date.now() + index,
                  title: product.name || "Recommended Product",
                  price: typeof product.price === 'number' ? product.price :
                         (product.priceRange ? parseInt(product.priceRange.replace(/[^\d]/g, '')) : 999),
                  image: product.imageUrl || getPlaceholderImage(product.name || "Product"),
                  rating: product.rating || 4.5,
                  reviews: product.reviews || 120,
                  category: product.category || "recommended",
                  brand: product.brand || "Recommended"
                })}
              >
                <span className="flex items-center justify-center">
                  <span className="material-icons text-xs mr-1">shopping_cart</span>
                  Add to Cart
                </span>
              </button>
            </div>
          ))}
        </div>
      ) : rawResponse ? (
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <h3 className="font-medium mb-2">Based on your cart, we recommend:</h3>
          <div className="whitespace-pre-wrap text-sm">{rawResponse}</div>
        </div>
      ) : null}

      <div className="mt-4 text-xs text-gray-500 flex items-center">
        <span className="material-icons text-xs mr-1">info</span>
        Personalized recommendations based on your shopping preferences
      </div>
    </div>
  );
}
