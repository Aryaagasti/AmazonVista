import React, { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

// Load cart from localStorage if available
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('amazonCart');
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return { items: [] };
};

const initialState = loadCartFromStorage();

function cartReducer(state, action) {
  let newState;

  // Debug logging
  console.log("Cart action:", action.type, action);

  try {
    switch (action.type) {
      case "ADD":
        // Validate product data
        if (!action.product || typeof action.product !== 'object') {
          console.error("Invalid product data:", action.product);
          return state;
        }

        // Ensure product has an ID
        if (!action.product.id) {
          // Generate a random ID if missing
          action.product.id = Date.now() + Math.floor(Math.random() * 1000);
          console.log("Generated ID for product:", action.product.id);
        }

        const exists = state.items.find(i => i.id === action.product.id);
        if (exists) {
          console.log("Product exists in cart, updating quantity");
          newState = {
            ...state,
            items: state.items.map(i =>
              i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i
            ),
          };
        } else {
          console.log("Adding new product to cart:", action.product.title);
          newState = {
            ...state,
            items: [...state.items, { ...action.product, qty: 1 }]
          };
        }
        break;

      case "REMOVE":
        console.log("Removing product from cart:", action.id);
        newState = {
          ...state,
          items: state.items.filter(i => i.id !== action.id)
        };
        break;

    case "UPDATE_QTY":
        console.log("Updating product quantity:", action.id, action.qty);
        if (action.qty <= 0) {
          newState = {
            ...state,
            items: state.items.filter(i => i.id !== action.id)
          };
        } else {
          newState = {
            ...state,
            items: state.items.map(i =>
              i.id === action.id ? { ...i, qty: action.qty } : i
            ),
          };
        }
        break;

      case "CLEAR":
        console.log("Clearing cart");
        newState = { ...state, items: [] };
        break;

      case "FORCE_REFRESH":
        console.log("Force refreshing cart from localStorage");
        try {
          const savedCart = localStorage.getItem('amazonCart');
          if (savedCart) {
            newState = JSON.parse(savedCart);
          } else {
            newState = { ...state };
          }
        } catch (e) {
          console.error("Error refreshing cart from localStorage:", e);
          newState = { ...state };
        }
        break;

      default:
        console.warn("Unknown action type:", action.type);
        return state;
    }

    // Save to localStorage
    try {
      localStorage.setItem('amazonCart', JSON.stringify(newState));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }

    return newState;
  } catch (error) {
    console.error("Error in cart reducer:", error);
    // Return unchanged state if there was an error
    return state;
  }
}

// Direct method to add a product to cart (bypasses reducer for reliability)
export const addProductToCartDirectly = (product) => {
  try {
    console.log("DIRECT METHOD: Adding product to cart:", product);

    // Validate and sanitize product
    if (!product || typeof product !== 'object') {
      console.error("DIRECT METHOD: Invalid product data");
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
      console.error("DIRECT METHOD: Error reading cart from localStorage:", e);
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
    console.log("DIRECT METHOD: Cart updated successfully:", currentCart);

    // Update cart count in UI
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
      const totalItems = currentCart.items.reduce((total, item) => total + item.qty, 0);
      cartCountElement.textContent = totalItems;
      cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    return true;
  } catch (error) {
    console.error("DIRECT METHOD: Failed to add product to cart:", error);
    return false;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Add direct method to context
  const directAddToCart = (product) => {
    const success = addProductToCartDirectly(product);
    if (success) {
      // Also try to update through reducer for state consistency
      try {
        dispatch({ type: "ADD", product });
      } catch (e) {
        console.error("Error in dispatch after direct add:", e);
        // Force refresh the component to reflect localStorage changes
        dispatch({ type: "FORCE_REFRESH" });
      }
    }
    return success;
  };

  return (
    <CartContext.Provider value={{ cart: state, dispatch, directAddToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}