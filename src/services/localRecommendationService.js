// Local recommendation service that doesn't rely on external APIs
import productsData from "../assets/products.json";

/**
 * Get product recommendations based on cart items
 * @param {Array} cartItems - Array of products in the cart
 * @returns {Array} - Array of recommended products
 */
export const getRecommendations = (cartItems = []) => {
  // If no cart items, return popular products
  if (!cartItems || cartItems.length === 0) {
    return getPopularProducts(3);
  }

  // Get categories and brands from cart items
  const categories = cartItems.map(item => item.category).filter(Boolean);
  const brands = cartItems.map(item => item.brand).filter(Boolean);

  // Find the most common category
  const categoryCounts = {};
  let topCategory = null;
  let maxCount = 0;

  categories.forEach(category => {
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    if (categoryCounts[category] > maxCount) {
      maxCount = categoryCounts[category];
      topCategory = category;
    }
  });

  // Get products from the same category but different from cart items
  const cartItemIds = cartItems.map(item => item.id);
  let recommendations = productsData
    .filter(product =>
      product.category === topCategory &&
      !cartItemIds.includes(product.id)
    )
    .slice(0, 6);

  // If we don't have enough recommendations, add products from the same brands
  if (recommendations.length < 3) {
    const brandRecommendations = productsData
      .filter(product =>
        brands.includes(product.brand) &&
        !cartItemIds.includes(product.id) &&
        !recommendations.some(r => r.id === product.id)
      )
      .slice(0, 3 - recommendations.length);

    recommendations = [...recommendations, ...brandRecommendations];
  }

  // If we still don't have enough, add popular products
  if (recommendations.length < 3) {
    const popularProducts = getPopularProducts(3 - recommendations.length,
      [...cartItemIds, ...recommendations.map(r => r.id)]
    );

    recommendations = [...recommendations, ...popularProducts];
  }

  // Enhance recommendations with reasons
  return recommendations.slice(0, 3).map(product => enhanceRecommendation(product, cartItems));
};

/**
 * Get popular products (products with high ratings and reviews)
 * @param {Number} count - Number of products to return
 * @param {Array} excludeIds - Array of product IDs to exclude
 * @returns {Array} - Array of popular products
 */
const getPopularProducts = (count = 3, excludeIds = []) => {
  return productsData
    .filter(product => !excludeIds.includes(product.id))
    .sort((a, b) => {
      // Sort by rating and reviews
      const scoreA = a.rating * Math.log(a.reviews + 1);
      const scoreB = b.rating * Math.log(b.reviews + 1);
      return scoreB - scoreA;
    })
    .slice(0, count);
};

/**
 * Enhance a product with recommendation reasons
 * @param {Object} product - Product to enhance
 * @param {Array} cartItems - Cart items to base reasons on
 * @returns {Object} - Enhanced product with recommendation reasons
 */
const enhanceRecommendation = (product, cartItems) => {
  // Generate a reason based on the product and cart items
  let reason = "";

  if (cartItems.some(item => item.category === product.category)) {
    reason = `This complements the ${product.category} items in your cart.`;
  } else if (cartItems.some(item => item.brand === product.brand)) {
    reason = `You seem to like ${product.brand} products.`;
  } else {
    reason = "This is a popular product that many customers enjoy.";
  }

  // Generate a price range
  const priceRange = `₹${product.price} - ₹${Math.round(product.price * 1.2)}`;

  return {
    id: product.id,
    name: product.title,
    description: `${product.brand} ${product.title} - A high-quality product with ${product.rating} stars from ${product.reviews} reviews.`,
    reason,
    priceRange,
    imageUrl: product.image,
    price: product.price,
    rating: product.rating,
    reviews: product.reviews,
    category: product.category,
    brand: product.brand
  };
};

/**
 * Get chatbot response based on user query
 * @param {String} query - User query
 * @param {Object} productContext - Current product context (optional)
 * @returns {Object} - Chatbot response with text and recommendations
 */
export const getChatbotResponse = (query, productContext = null) => {
  // Convert query to lowercase for easier matching
  const queryLower = query.toLowerCase();

  // Check for greetings first
  const greetings = ["hi", "hello", "hey", "hola", "greetings", "howdy"];
  if (greetings.some(greeting => queryLower.startsWith(greeting))) {
    // Return a greeting with popular product recommendations
    const popularProducts = getPopularProducts(3);
    return {
      text: "Hello! Welcome to Amazon. Here are some popular products you might like today:",
      recommendations: popularProducts.map(product => enhanceRecommendation(product, []))
    };
  }

  // Default response
  let response = {
    text: "I'm here to help you find products. You can ask about specific categories, brands, or features you're looking for.",
    recommendations: []
  };

  // Check for category queries
  const categories = ["mobiles", "electronics", "fashion", "computers", "home", "books"];
  const categoryMatch = categories.find(category => queryLower.includes(category));

  if (categoryMatch) {
    const categoryProducts = productsData
      .filter(product => product.category === categoryMatch)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    response = {
      text: `Here are some great ${categoryMatch} products I found for you:`,
      recommendations: categoryProducts.map(product => enhanceRecommendation(product, []))
    };
    return response;
  }

  // Check for brand queries
  const brands = ["Samsung", "Apple", "OnePlus", "Xiaomi", "Sony", "HP", "Dell"];
  const brandMatch = brands.find(brand => queryLower.includes(brand.toLowerCase()));

  if (brandMatch) {
    const brandProducts = productsData
      .filter(product => product.brand === brandMatch)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    response = {
      text: `Here are some popular ${brandMatch} products:`,
      recommendations: brandProducts.map(product => enhanceRecommendation(product, []))
    };
    return response;
  }

  // Check for price range queries
  if (queryLower.includes("under") || queryLower.includes("less than") || queryLower.includes("cheaper")) {
    // Extract price from query
    const priceMatch = query.match(/\d+/);
    if (priceMatch) {
      const priceLimit = parseInt(priceMatch[0]);
      const affordableProducts = productsData
        .filter(product => product.price < priceLimit)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);

      response = {
        text: `Here are some great products under ₹${priceLimit}:`,
        recommendations: affordableProducts.map(product => enhanceRecommendation(product, []))
      };
      return response;
    }
  }

  // Check for "best" or "top" queries
  if (queryLower.includes("best") || queryLower.includes("top") || queryLower.includes("recommended")) {
    // Check if query specifies a category
    const categoryForBest = categories.find(category => queryLower.includes(category));

    if (categoryForBest) {
      const topProducts = productsData
        .filter(product => product.category === categoryForBest)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);

      response = {
        text: `Here are the top rated ${categoryForBest} products:`,
        recommendations: topProducts.map(product => enhanceRecommendation(product, []))
      };
    } else {
      // General "best products" query
      const topProducts = getPopularProducts(3);

      response = {
        text: "Here are some of our top-rated products across all categories:",
        recommendations: topProducts.map(product => enhanceRecommendation(product, []))
      };
    }
    return response;
  }

  // Check for recommendation requests
  if (queryLower.includes("recommend") || queryLower.includes("suggestion") ||
      queryLower.includes("show me") || queryLower.includes("what should") ||
      queryLower === "products" || queryLower === "product") {
    const popularProducts = getPopularProducts(3);
    return {
      text: "Here are some great products I recommend for you:",
      recommendations: popularProducts.map(product => enhanceRecommendation(product, []))
    };
  }

  // Check for help or general queries
  if (queryLower.includes("help") || queryLower.includes("how") || queryLower.includes("what")) {
    // Also provide recommendations with help text
    const popularProducts = getPopularProducts(3);
    return {
      text: "I can help you find products based on category, brand, price range, or features. Here are some popular items you might like:",
      recommendations: popularProducts.map(product => enhanceRecommendation(product, []))
    };
  }

  // If we have a product context, use it for recommendations
  if (productContext) {
    const similarProducts = productsData
      .filter(product =>
        product.category === productContext.category &&
        product.id !== productContext.id
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    response = {
      text: `Based on your interest in ${productContext.title}, you might also like these similar products:`,
      recommendations: similarProducts.map(product => enhanceRecommendation(product, [productContext]))
    };
    return response;
  }

  // For any other query, always show recommendations
  const popularProducts = getPopularProducts(3);

  // Try to make the response more conversational based on the query
  let responseText = "";

  if (queryLower.length < 5) {
    // Very short query, likely just testing
    responseText = "Here are some popular products you might be interested in:";
  } else if (queryLower.endsWith("?")) {
    // Question format
    responseText = "I'll help you find what you're looking for. Meanwhile, check out these popular items:";
  } else {
    // Default response
    responseText = "I'm not sure exactly what you're looking for, but here are some popular products you might like:";
  }

  return {
    text: responseText,
    recommendations: popularProducts.map(product => enhanceRecommendation(product, []))
  };
};
