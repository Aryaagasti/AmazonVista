/**
 * Utility functions for cart operations
 */

/**
 * Add a product to cart directly (bypassing React state)
 * @param {Object} product - Product to add to cart
 * @returns {boolean} - Success status
 */
export const addToCart = (product) => {
  try {
    console.log("CartHelper: Adding product to cart:", product);
    
    // Validate and sanitize product
    if (!product || typeof product !== 'object') {
      console.error("CartHelper: Invalid product data");
      return false;
    }
    
    // Create a sanitized product object
    const sanitizedProduct = {
      id: product.id || Date.now() + Math.floor(Math.random() * 1000),
      title: product.title || "Product",
      price: product.price || 999,
      image: product.image || "https://m.media-amazon.com/images/I/51UW1849rJL._SX679_.jpg",
      qty: 1
    };
    
    // Get current cart from localStorage
    let currentCart;
    try {
      const savedCart = localStorage.getItem('amazonCart');
      currentCart = savedCart ? JSON.parse(savedCart) : { items: [] };
    } catch (e) {
      console.error("CartHelper: Error reading cart from localStorage:", e);
      currentCart = { items: [] };
    }
    
    // Check if product already exists
    const existingProductIndex = currentCart.items.findIndex(item => item.id === sanitizedProduct.id);
    
    if (existingProductIndex >= 0) {
      // Update quantity if product exists
      currentCart.items[existingProductIndex].qty += 1;
    } else {
      // Add new product
      currentCart.items.push(sanitizedProduct);
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('amazonCart', JSON.stringify(currentCart));
    console.log("CartHelper: Cart updated successfully:", currentCart);
    
    // Update cart count in UI
    updateCartUI(currentCart);
    
    return true;
  } catch (error) {
    console.error("CartHelper: Failed to add product to cart:", error);
    return false;
  }
};

/**
 * Update the cart UI elements
 * @param {Object} cart - Cart object
 */
export const updateCartUI = (cart) => {
  try {
    // Get cart from localStorage if not provided
    if (!cart) {
      try {
        const savedCart = localStorage.getItem('amazonCart');
        cart = savedCart ? JSON.parse(savedCart) : { items: [] };
      } catch (e) {
        console.error("CartHelper: Error reading cart from localStorage:", e);
        return;
      }
    }
    
    // Calculate total items
    const totalItems = cart.items.reduce((total, item) => total + item.qty, 0);
    
    // Update cart count element
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = totalItems;
      cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    console.log("CartHelper: UI updated with total items:", totalItems);
  } catch (error) {
    console.error("CartHelper: Error updating UI:", error);
  }
};

/**
 * Force refresh the cart from localStorage
 */
export const refreshCart = () => {
  try {
    const savedCart = localStorage.getItem('amazonCart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      updateCartUI(cart);
    }
  } catch (error) {
    console.error("CartHelper: Error refreshing cart:", error);
  }
};

// Initialize cart UI on page load
window.addEventListener('DOMContentLoaded', () => {
  refreshCart();
});
