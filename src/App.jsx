import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import CartPage from "./pages/CartPage";
import ProductDetail from "./pages/ProductDetail";
import CheckoutPage from "./pages/CheckoutPage";
import BudgetAssistant from "./components/BudgetAssistant";
import { useState, useEffect } from "react";
import { refreshCart } from "./utils/cartHelper";
import "./styles/darkMode.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  // Initialize cart on app load
  useEffect(() => {
    console.log("App: Initializing cart");
    refreshCart();
  }, []);

  // Check if URL has a hash for simple routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");

      if (hash === "cart") {
        setCurrentPage("cart");
      } else if (hash === "checkout") {
        setCurrentPage("checkout");
      } else if (hash.startsWith("product-")) {
        setCurrentPage("product");
      } else {
        setCurrentPage("home");
      }

      // Refresh cart on page change
      setTimeout(() => {
        refreshCart();
      }, 100);
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Render the appropriate page based on the current route
  const renderPage = () => {
    switch (currentPage) {
      case "cart":
        return <CartPage />;
      case "checkout":
        return <CheckoutPage />;
      case "product":
        return <ProductDetail />;
      default:
        return <Home />;
    }
  };

  return (
    <ThemeProvider>
      <CartProvider>
        {renderPage()}
        <BudgetAssistant />
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;