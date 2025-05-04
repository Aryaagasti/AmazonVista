// Web Speech API Service for voice commands

/**
 * Initialize speech recognition
 * @returns {SpeechRecognition} - Speech recognition object
 */
export const initSpeechRecognition = () => {
  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.error("Speech recognition not supported in this browser");
    return null;
  }

  try {
    // Create recognition instance
    const recognition = new SpeechRecognition();

    // Configure recognition
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    console.log("Speech recognition initialized successfully");
    return recognition;
  } catch (error) {
    console.error("Error initializing speech recognition:", error);
    return null;
  }
};

/**
 * Parse voice command to determine action and product
 * @param {string} command - Voice command text
 * @returns {Object} - Parsed command with action and product
 */
export const parseVoiceCommand = (command) => {
  const commandText = command.toLowerCase().trim();
  console.log("Parsing command:", commandText);

  // Handle simple "add product" command
  if (commandText === "add product" || commandText === "at product") {
    console.log("Simple ADD PRODUCT command detected");
    return {
      action: 'ADD',
      productName: "product" // Will match any product with highest rating
    };
  }

  // Handle simple "add" command
  if (commandText === "add" || commandText === "at") {
    console.log("Simple ADD command detected");
    return {
      action: 'ADD',
      productName: "popular" // Special keyword to find popular product
    };
  }

  // Check for "add" command with various phrasings
  if ((commandText.includes('add') || commandText.startsWith('at')) &&
      (commandText.includes('to cart') || commandText.includes('to my cart') ||
       commandText.includes('to the cart') || commandText.endsWith('cart') ||
       !commandText.includes(' to '))) { // Allow "add iPhone" without "to cart"

    let productName = commandText
      .replace(/^add\s+/i, '')
      .replace(/^at\s+/i, '') // Common misrecognition
      .replace(/\s+to\s+(my\s+)?(the\s+)?cart$/i, '')
      .replace(/\s+cart$/i, '')
      .trim();

    console.log("ADD command detected, product:", productName);

    return {
      action: 'ADD',
      productName
    };
  }

  // Check for "remove" command with variations
  if (commandText.includes('remove') || commandText.includes('delete') ||
      commandText.includes('take out') || commandText.includes('get rid of')) {

    let productName = commandText
      .replace(/^remove\s+/i, '')
      .replace(/^delete\s+/i, '')
      .replace(/^take\s+out\s+/i, '')
      .replace(/^get\s+rid\s+of\s+/i, '')
      .replace(/\s+from\s+(my\s+)?(the\s+)?cart$/i, '')
      .trim();

    // Handle simple "remove" command
    if (!productName) {
      productName = "last"; // Special keyword to remove last added item
    }

    console.log("REMOVE command detected, product:", productName);

    return {
      action: 'REMOVE',
      productName
    };
  }

  // Check for "buy" command (same as add) with variations
  if (commandText.includes('buy') || commandText.includes('purchase') ||
      commandText.includes('get me') || commandText.includes('i want') ||
      commandText.includes('get') || commandText.includes('want')) {

    let productName = commandText
      .replace(/^buy\s+/i, '')
      .replace(/^purchase\s+/i, '')
      .replace(/^get\s+me\s+/i, '')
      .replace(/^get\s+/i, '')
      .replace(/^i\s+want\s+(to\s+)?(buy\s+)?/i, '')
      .replace(/^want\s+/i, '')
      .replace(/^i\s+want\s+/i, '')
      .replace(/\s+please$/i, '')
      .trim();

    console.log("BUY command detected, product:", productName);

    return {
      action: 'ADD',
      productName
    };
  }

  // If the command is very short, assume it's a product name to add
  if (commandText.length > 0 && commandText.length < 20 && !commandText.includes(' ')) {
    console.log("Short command detected, assuming product name:", commandText);
    return {
      action: 'ADD',
      productName: commandText
    };
  }

  // Unknown command
  console.log("UNKNOWN command detected");
  return {
    action: 'UNKNOWN',
    originalCommand: commandText
  };
};

/**
 * Find product by name in product list
 * @param {string} productName - Product name to search for
 * @param {Array} productList - List of products to search in
 * @returns {Object|null} - Found product or null
 */
export const findProductByName = (productName, productList) => {
  const searchName = productName.toLowerCase().trim();
  console.log("Searching for product:", searchName);

  // Handle special keywords
  if (searchName === "product") {
    // Return a random product from the top 5 highest rated products
    const topProducts = [...productList].sort((a, b) => b.rating - a.rating).slice(0, 5);
    const randomProduct = topProducts[Math.floor(Math.random() * topProducts.length)];
    console.log("Returning random top product:", randomProduct.title);
    return randomProduct;
  }

  if (searchName === "popular" || searchName === "best") {
    // Return the highest rated product
    const bestProduct = [...productList].sort((a, b) => b.rating - a.rating)[0];
    console.log("Returning most popular product:", bestProduct.title);
    return bestProduct;
  }

  if (searchName === "last") {
    // In a real app, this would return the last added item
    // For demo, return a random product
    const randomIndex = Math.floor(Math.random() * productList.length);
    console.log("Returning 'last' product (random for demo):", productList[randomIndex].title);
    return productList[randomIndex];
  }

  if (!searchName || searchName.length < 2) {
    console.log("Search term too short");
    return null;
  }

  // Try exact match first
  let product = productList.find(p =>
    p.title.toLowerCase() === searchName
  );

  if (product) {
    console.log("Found exact match:", product.title);
    return product;
  }

  // Try category match (e.g., "phone" should match "iPhone")
  const categoryMatches = productList.filter(p =>
    p.category && p.category.toLowerCase() === searchName
  );

  if (categoryMatches.length === 1) {
    console.log("Found single category match:", categoryMatches[0].title);
    return categoryMatches[0];
  } else if (categoryMatches.length > 1) {
    // If multiple matches in category, return the highest rated one
    const bestCategoryMatch = categoryMatches.sort((a, b) => b.rating - a.rating)[0];
    console.log("Found best category match:", bestCategoryMatch.title);
    return bestCategoryMatch;
  }

  // Try brand match (e.g., "samsung" should match "Samsung Galaxy")
  const brandMatches = productList.filter(p =>
    p.brand && p.brand.toLowerCase() === searchName
  );

  if (brandMatches.length === 1) {
    console.log("Found single brand match:", brandMatches[0].title);
    return brandMatches[0];
  } else if (brandMatches.length > 1) {
    // If multiple matches in brand, return the highest rated one
    const bestBrandMatch = brandMatches.sort((a, b) => b.rating - a.rating)[0];
    console.log("Found best brand match:", bestBrandMatch.title);
    return bestBrandMatch;
  }

  // Try includes match (e.g., "phone" should match "Smartphone")
  const includesMatches = productList.filter(p =>
    p.title.toLowerCase().includes(searchName)
  );

  if (includesMatches.length === 1) {
    console.log("Found single includes match:", includesMatches[0].title);
    return includesMatches[0];
  } else if (includesMatches.length > 1) {
    // If multiple includes matches, return the one where the search term appears earliest
    const bestIncludesMatch = includesMatches.sort((a, b) => {
      return a.title.toLowerCase().indexOf(searchName) - b.title.toLowerCase().indexOf(searchName);
    })[0];
    console.log("Found best includes match:", bestIncludesMatch.title);
    return bestIncludesMatch;
  }

  // If still no match, try matching keywords with scoring
  const keywords = searchName.split(' ').filter(k => k.length > 2);
  console.log("Trying keyword matching with:", keywords);

  if (keywords.length === 0) {
    // If no keywords but we have a short search term, try to match it anyway
    if (searchName.length >= 2) {
      // Find the best match based on the short term
      const matches = productList.filter(p =>
        p.title.toLowerCase().includes(searchName) ||
        (p.category && p.category.toLowerCase().includes(searchName)) ||
        (p.brand && p.brand.toLowerCase().includes(searchName))
      );

      if (matches.length > 0) {
        // Return the highest rated match
        const bestMatch = matches.sort((a, b) => b.rating - a.rating)[0];
        console.log("Found best match for short term:", bestMatch.title);
        return bestMatch;
      }

      // If still no match, return a random popular product
      const randomPopular = [...productList].sort((a, b) => b.rating - a.rating).slice(0, 5)[Math.floor(Math.random() * 5)];
      console.log("No match found, returning random popular product:", randomPopular.title);
      return randomPopular;
    }

    return null;
  }

  // Find product that matches the most keywords with scoring
  let bestMatch = null;
  let highestScore = 0;

  productList.forEach(p => {
    const title = p.title.toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const category = (p.category || '').toLowerCase();
    let score = 0;

    keywords.forEach(keyword => {
      // Title matches are worth more
      if (title.includes(keyword)) {
        // Exact word match is worth more than partial
        if (title.split(' ').includes(keyword)) {
          score += 3;
        } else {
          score += 2;
        }
      }

      // Brand and category matches
      if (brand.includes(keyword)) score += 1.5;
      if (category.includes(keyword)) score += 1;
    });

    // Bonus for shorter titles (more likely to be exact match)
    score = score * (1 + (1 / Math.max(title.split(' ').length, 1)));

    // Bonus for higher rated products
    score = score * (1 + (p.rating / 10));

    if (score > highestScore) {
      highestScore = score;
      bestMatch = p;
    }
  });

  if (highestScore > 1) {
    console.log("Found keyword match with score", highestScore, ":", bestMatch.title);
    return bestMatch;
  }

  // If still no match, return a random popular product
  if (productList.length > 0) {
    const randomPopular = [...productList].sort((a, b) => b.rating - a.rating).slice(0, 5)[Math.floor(Math.random() * 5)];
    console.log("No match found, returning random popular product:", randomPopular.title);
    return randomPopular;
  }

  console.log("No product match found");
  return null;
};
