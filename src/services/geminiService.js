// Gemini API Service for product recommendations

// API configuration
const GEMINI_API_CONFIG = {
  apiVersion: "v1beta",
  model: "gemini-2.0-flash",
  maxOutputTokens: 1024,
  temperature: 0.4,
  topK: 32,
  topP: 0.95
};

// Fallback recommendations when API fails
const FALLBACK_RECOMMENDATIONS = [
  {
    name: "Wireless Earbuds",
    description: "High-quality wireless earbuds with noise cancellation and long battery life.",
    reason: "Perfect companion for your electronic devices, allowing you to enjoy music or take calls on the go.",
    priceRange: "₹1,999 - ₹4,999",
    imageUrl: "https://m.media-amazon.com/images/I/61eDXs9QFNL._SX679_.jpg"
  },
  {
    name: "Multi-Device Charging Station",
    description: "Compact charging dock that can charge multiple devices simultaneously.",
    reason: "Keeps all your devices powered up and organized in one convenient location.",
    priceRange: "₹1,499 - ₹2,999",
    imageUrl: "https://m.media-amazon.com/images/I/71vHX08pxjL._SX679_.jpg"
  },
  {
    name: "Smart LED Light Strip",
    description: "Color-changing LED strip with app control and voice assistant compatibility.",
    reason: "Adds ambient lighting to your space and enhances your tech setup with customizable lighting.",
    priceRange: "₹899 - ₹1,999",
    imageUrl: "https://m.media-amazon.com/images/I/71r5EDsstsL._SX679_.jpg"
  }
];

// Category-based recommendations
const CATEGORY_RECOMMENDATIONS = {
  electronics: [
    {
      name: "Portable Power Bank",
      description: "20000mAh high-capacity power bank with fast charging support.",
      reason: "Keep your devices charged on the go, perfect for travel and daily use.",
      priceRange: "₹1,499 - ₹2,999",
      imageUrl: "https://m.media-amazon.com/images/I/71lVwl3q-kL._SX679_.jpg"
    },
    {
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with long battery life and precise tracking.",
      reason: "Enhances your computing experience with comfortable control and no wires.",
      priceRange: "₹799 - ₹1,999",
      imageUrl: "https://m.media-amazon.com/images/I/61qNHYBwYKL._SX679_.jpg"
    },
    {
      name: "Laptop Stand",
      description: "Adjustable aluminum laptop stand for better ergonomics and cooling.",
      reason: "Improves posture and prevents overheating when using your laptop for extended periods.",
      priceRange: "₹899 - ₹1,799",
      imageUrl: "https://m.media-amazon.com/images/I/71Zf9uUp+GL._SX679_.jpg"
    }
  ],
  fashion: [
    {
      name: "Minimalist Watch",
      description: "Sleek, water-resistant watch with stainless steel band.",
      reason: "Complements your style with a timeless accessory that goes with any outfit.",
      priceRange: "₹1,999 - ₹4,999",
      imageUrl: "https://m.media-amazon.com/images/I/61eDXs9QFNL._SX679_.jpg"
    },
    {
      name: "Leather Wallet",
      description: "Genuine leather wallet with RFID protection and multiple card slots.",
      reason: "Stylish and practical accessory to organize your essentials.",
      priceRange: "₹899 - ₹1,999",
      imageUrl: "https://m.media-amazon.com/images/I/71r5EDsstsL._SX679_.jpg"
    },
    {
      name: "Sunglasses",
      description: "Polarized sunglasses with UV protection and durable frame.",
      reason: "Protects your eyes while adding a stylish touch to your look.",
      priceRange: "₹1,299 - ₹2,999",
      imageUrl: "https://m.media-amazon.com/images/I/71vHX08pxjL._SX679_.jpg"
    }
  ],
  home: [
    {
      name: "Smart LED Bulbs",
      description: "Color-changing smart bulbs that work with voice assistants.",
      reason: "Transform your home lighting with customizable colors and automation.",
      priceRange: "₹999 - ₹2,499",
      imageUrl: "https://m.media-amazon.com/images/I/61eDXs9QFNL._SX679_.jpg"
    },
    {
      name: "Aroma Diffuser",
      description: "Ultrasonic essential oil diffuser with LED lights and auto shut-off.",
      reason: "Creates a relaxing atmosphere with pleasant scents and soft lighting.",
      priceRange: "₹899 - ₹1,999",
      imageUrl: "https://m.media-amazon.com/images/I/71r5EDsstsL._SX679_.jpg"
    },
    {
      name: "Cotton Bed Sheets",
      description: "100% cotton bed sheets with high thread count for maximum comfort.",
      reason: "Upgrade your bedroom with soft, breathable sheets for better sleep.",
      priceRange: "₹1,299 - ₹2,999",
      imageUrl: "https://m.media-amazon.com/images/I/71vHX08pxjL._SX679_.jpg"
    }
  ]
};

/**
 * Get product recommendations from Gemini API based on cart items
 * @param {Array} cartItems - Array of products in the cart
 * @returns {Promise} - Promise with recommendation text
 */
export const getProductRecommendations = async (cartItems) => {
  try {
    console.log("Getting recommendations for cart items:", cartItems);

    // If no cart items, return fallback recommendations
    if (!cartItems || cartItems.length === 0) {
      console.log("No cart items, returning fallback recommendations");
      return FALLBACK_RECOMMENDATIONS;
    }

    // Extract product names and categories from cart items
    const productNames = cartItems.map(item => item.title);
    const categories = cartItems.map(item => item.category).filter(Boolean);

    // Check if we should use category-based recommendations
    if (categories.length > 0) {
      // Find the most common category
      const categoryCounts = {};
      let maxCategory = null;
      let maxCount = 0;

      categories.forEach(category => {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        if (categoryCounts[category] > maxCount) {
          maxCount = categoryCounts[category];
          maxCategory = category;
        }
      });

      // If we have recommendations for this category, use them as fallback
      const categoryFallback = maxCategory && CATEGORY_RECOMMENDATIONS[maxCategory.toLowerCase()];

      console.log("Most common category:", maxCategory, "with count:", maxCount);
      console.log("Category fallback available:", !!categoryFallback);
    }

    // Create prompt for Gemini
    const prompt = `Suggest 3 useful products based on this cart: ${productNames.join(", ")}.
    For each product, provide:
    1. Product name
    2. Brief description (1-2 sentences)
    3. Why it complements the items in the cart
    4. Approximate price range
    Format as JSON array with fields: name, description, reason, priceRange, imageUrl (leave as placeholder)`;

    console.log("Using prompt:", prompt);

    // API endpoint with key
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    // Check if API key is available
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
      console.log("No valid API key found, using fallback recommendations");
      return FALLBACK_RECOMMENDATIONS;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_API_CONFIG.model}:generateContent?key=${apiKey}`;

    // Request body - simplified to match the curl example format
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    console.log("Making API request to Gemini");

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("API request failed with status", response.status);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Received response from Gemini API");

      // Extract text from response
      const recommendationText = data.candidates[0].content.parts[0].text;

      // Try to parse JSON from the response
      try {
        // Look for JSON in the response
        const jsonMatch = recommendationText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsedJson = JSON.parse(jsonMatch[0]);
          console.log("Successfully parsed JSON array from response");
          return parsedJson;
        }

        // If no JSON array found, try parsing the whole response
        const parsedJson = JSON.parse(recommendationText);
        console.log("Successfully parsed JSON from response");
        return parsedJson;
      } catch (parseError) {
        console.error("Failed to parse JSON from Gemini response:", parseError);

        // Try to extract product information from text
        const extractedProducts = extractProductsFromText(recommendationText);
        if (extractedProducts.length > 0) {
          console.log("Extracted products from text:", extractedProducts);
          return extractedProducts;
        }

        // Return a formatted object with the raw text
        return {
          rawText: recommendationText,
          error: "Failed to parse structured recommendations"
        };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error("Error getting recommendations from Gemini:", error);

    // Determine the most common category in cart items
    const categories = cartItems
      .map(item => item.category)
      .filter(Boolean)
      .map(cat => cat.toLowerCase());

    const categoryCounts = {};
    let maxCategory = null;
    let maxCount = 0;

    categories.forEach(category => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      if (categoryCounts[category] > maxCount) {
        maxCount = categoryCounts[category];
        maxCategory = category;
      }
    });

    // Use category-specific recommendations if available
    if (maxCategory && CATEGORY_RECOMMENDATIONS[maxCategory]) {
      console.log("Using category-specific recommendations for", maxCategory);
      return CATEGORY_RECOMMENDATIONS[maxCategory];
    }

    // Otherwise use general fallback
    console.log("Using general fallback recommendations");
    return FALLBACK_RECOMMENDATIONS;
  }
};

/**
 * Extract product information from unstructured text
 * @param {string} text - Raw text from API
 * @returns {Array} - Array of product objects
 */
function extractProductsFromText(text) {
  const products = [];

  // Split by numbered items (1., 2., 3., etc.)
  const productSections = text.split(/\d+\.\s+/).filter(Boolean);

  productSections.forEach(section => {
    try {
      // Extract product name (usually the first line)
      const nameMatch = section.match(/^([^:]+?)(?::|$)/m);
      const name = nameMatch ? nameMatch[1].trim() : "Product";

      // Extract description
      const descMatch = section.match(/Description:?\s*([^]*?)(?:Why|Reason|Price|$)/i);
      const description = descMatch ? descMatch[1].trim() : "A useful product for your needs.";

      // Extract reason
      const reasonMatch = section.match(/(?:Why|Reason):?\s*([^]*?)(?:Price|$)/i);
      const reason = reasonMatch ? reasonMatch[1].trim() : "Complements your existing items.";

      // Extract price
      const priceMatch = section.match(/Price:?\s*([^]*?)(?:$)/i);
      const priceRange = priceMatch ? priceMatch[1].trim() : "₹999 - ₹1,999";

      products.push({
        name,
        description,
        reason,
        priceRange,
        imageUrl: ""
      });
    } catch (e) {
      console.error("Error extracting product from text section:", e);
    }
  });

  return products;
}

/**
 * Get product recommendations from Gemini AI chatbot
 * @param {string} userQuery - User's question about products
 * @param {Object} productContext - Current product context (optional)
 * @returns {Promise} - Promise with chatbot response
 */
/**
 * Test the Gemini API with a simple query
 * This function follows exactly the format from the curl example
 */
export const testGeminiAPI = async () => {
  try {
    console.log("Testing Gemini API with simple query");

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
      console.log("No valid API key found");
      return { error: "No valid API key" };
    }

    // Using exactly the format from the curl example
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{ text: "Explain how AI works" }]
      }]
    };

    console.log("Making test API request to Gemini");

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error("Test API request failed with status", response.status);
      return {
        error: `API request failed with status ${response.status}`,
        details: await response.text()
      };
    }

    const data = await response.json();
    console.log("Received test response from Gemini API:", data);

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error("Error testing Gemini API:", error);
    return {
      error: error.message
    };
  }
};

export const getChatbotRecommendation = async (userQuery, productContext = null) => {
  try {
    console.log("Getting chatbot recommendation for query:", userQuery);

    // Create prompt based on user query and product context
    let prompt = `You are an Amazon shopping assistant helping a customer find products.

    ${productContext ? `The customer is currently viewing: ${productContext.title} (${productContext.category})` : ''}

    Customer query: "${userQuery}"

    Provide a helpful, friendly response that recommends relevant products.
    If appropriate, suggest 1-2 specific products with brief descriptions and approximate price ranges.
    Keep your response conversational, concise (under 150 words), and focused on helping the customer find what they need.`;

    console.log("Using chatbot prompt:", prompt);

    // API endpoint with key
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    // Check if API key is available
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
      console.log("No valid API key found, using fallback response");
      return {
        text: "I'd be happy to help you find products! However, I'm currently in demo mode. Please try again later or browse our featured products below.",
        isError: true
      };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_API_CONFIG.model}:generateContent?key=${apiKey}`;

    // Request body - simplified to match the curl example format
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    console.log("Making chatbot API request to Gemini");

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("Chatbot API request failed with status", response.status);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Received chatbot response from Gemini API");

      // Extract text from response
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        const responseText = data.candidates[0].content.parts[0].text;
        return {
          text: responseText,
          isError: false
        };
      } else {
        throw new Error("Invalid response format from Gemini API");
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Chatbot fetch error:", fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error("Error getting chatbot recommendation:", error);
    return {
      text: "I'm sorry, I couldn't process your request at the moment. Please try again later or browse our featured products.",
      isError: true
    };
  }
};
