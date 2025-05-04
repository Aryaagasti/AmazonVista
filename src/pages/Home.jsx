import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ProductGrid from "../components/ProductGrid";
import ProductRow from "../components/ProductRow";
import Banner from "../components/Banner";
import Cart from "../components/Cart";
import Footer from "../components/Footer";
import ProductChatbot from "../components/ProductChatbot";
import productsData from "../assets/products.json";

// Enhance product data with additional Amazon-specific fields
const enhancedProducts = productsData.map(product => ({
  ...product,
  originalPrice: product.price + Math.floor(Math.random() * 10000) + 1000,
  prime: Math.random() > 0.5,
}));

const brands = ["Samsung", "Apple", "OnePlus", "Xiaomi"];
const categories = ["mobiles", "electronics", "fashion", "computers", "home", "books"];

export default function Home() {
  const { darkMode } = useTheme();
  const [filters, setFilters] = useState({
    price: 50000,
    brands: [],
    categories: [],
    rating: 1,
  });
  const [search, setSearch] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter products based on user selections
  const filtered = enhancedProducts.filter(p => {
    // Price filter - check both min and max price if available
    const priceInRange = filters.minPrice
      ? (p.price >= filters.minPrice && p.price <= filters.price)
      : (p.price <= filters.price);

    return priceInRange &&
      (filters.brands.length === 0 || filters.brands.includes(p.brand)) &&
      (filters.categories.length === 0 || filters.categories.includes(p.category)) &&
      p.rating >= filters.rating &&
      (search === "" || p.title.toLowerCase().includes(search.toLowerCase()) ||
       p.brand.toLowerCase().includes(search.toLowerCase()) ||
       p.category.toLowerCase().includes(search.toLowerCase()));
  });

  // Group products by category for row displays
  const mobileProducts = enhancedProducts.filter(p => p.category === "mobiles");
  const electronicsProducts = enhancedProducts.filter(p => p.category === "electronics");
  const computerProducts = enhancedProducts.filter(p => p.category === "computers");
  const fashionProducts = enhancedProducts.filter(p => p.category === "fashion");
  const homeProducts = enhancedProducts.filter(p => p.category === "home");
  const bookProducts = enhancedProducts.filter(p => p.category === "books");

  // Show back to top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && !e.target.closest('.sidebar-container') && !e.target.closest('.sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Prevent body scrolling when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`bg-amazon_gray-light min-h-screen w-full max-w-full overflow-hidden ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar
        onSearch={setSearch}
        onCategoryChange={cat => setFilters(f => ({ ...f, categories: cat ? [cat] : [] }))}
        onMenuClick={toggleSidebar}
      />
      <ProductChatbot />

      <div className="flex relative">
        {/* Mobile Sidebar Toggle Button */}
        <button
          className="md:hidden fixed top-20 left-4 z-40 bg-amazon_blue text-white p-2 rounded-full shadow-lg sidebar-toggle"
          onClick={toggleSidebar}
        >
          <span className="material-icons">{sidebarOpen ? 'close' : 'filter_list'}</span>
        </button>

        {/* Sidebar for filters - hidden on mobile unless toggled */}
        <div
          className={`sidebar-container fixed md:static top-0 left-0 h-full z-30 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar
            filters={filters}
            setFilters={setFilters}
            brands={brands}
            categories={categories}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Overlay when sidebar is open on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content area */}
        <main className={`flex-1 transition-all duration-300 overflow-hidden ${sidebarOpen ? 'md:ml-64' : ''}`}>
          {/* Banner/Carousel */}
          <Banner />

          {/* Product Rows */}
          <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 -mt-16 relative z-10 overflow-hidden">
            {/* Today's Deals */}
            <ProductRow
              title="Today's Deals"
              products={enhancedProducts.slice(0, 8)}
              viewAll={true}
            />

            {/* Mobile Phones */}
            {(filters.categories.length === 0 || filters.categories.includes("mobiles")) && (
              <ProductRow
                title="Smartphones & Accessories"
                products={mobileProducts}
                viewAll={true}
              />
            )}

            {/* Electronics */}
            {(filters.categories.length === 0 || filters.categories.includes("electronics")) && (
              <ProductRow
                title="Electronics"
                products={electronicsProducts}
                viewAll={true}
              />
            )}

            {/* Computers */}
            {(filters.categories.length === 0 || filters.categories.includes("computers")) && (
              <ProductRow
                title="Computers & Laptops"
                products={computerProducts}
                viewAll={true}
              />
            )}

            {/* Fashion */}
            {(filters.categories.length === 0 || filters.categories.includes("fashion")) && (
              <ProductRow
                title="Fashion & Accessories"
                products={fashionProducts}
                viewAll={true}
              />
            )}

            {/* Home & Kitchen */}
            {(filters.categories.length === 0 || filters.categories.includes("home")) && (
              <ProductRow
                title="Home & Kitchen"
                products={homeProducts}
                viewAll={true}
              />
            )}

            {/* Books */}
            {(filters.categories.length === 0 || filters.categories.includes("books")) && (
              <ProductRow
                title="Books"
                products={bookProducts}
                viewAll={true}
              />
            )}

            {/* All Products Grid */}
            <div className="bg-white p-4 rounded shadow mb-4">
              <h2 className="text-xl font-bold mb-4">
                {filters.categories.length > 0
                  ? `${filters.categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')} Products`
                  : "All Products"}
              </h2>
              <ProductGrid products={filtered} />
            </div>
          </div>
        </main>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-amazon_blue text-white p-3 rounded-full shadow-lg hover:bg-amazon_blue-light z-50"
        >
          <span className="material-icons">arrow_upward</span>
        </button>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}