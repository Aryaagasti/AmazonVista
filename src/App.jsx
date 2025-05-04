import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import CartPage from "./pages/CartPage";
import ProductDetail from "./pages/ProductDetail";
import CheckoutPage from "./pages/CheckoutPage";
import BudgetAssistant from "./components/BudgetAssistant";
import AmazonLoader from "./components/AmazonLoader";
import { useState, useEffect } from "react";
import { refreshCart } from "./utils/cartHelper";
import "./styles/darkMode.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize cart on app load
  useEffect(() => {
    console.log("App: Initializing cart");
    refreshCart();

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show loader for 2 seconds on initial load

    return () => clearTimeout(timer);
  }, []);

  // Check if URL has a hash for simple routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");

      // Show loader during page transition
      setIsLoading(true);

      // Short delay to show the loader
      setTimeout(() => {
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
        refreshCart();

        // Hide loader after transition
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }, 300);
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
        <AmazonLoader isLoading={isLoading} />
        {renderPage()}
        <BudgetAssistant />
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;