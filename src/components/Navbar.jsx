import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import productsData from "../assets/products.json";
import FinalVoiceCommands from "./FinalVoiceCommands";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ onSearch, onCategoryChange, onMenuClick }) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const suggestionsRef = useRef(null);
  const { cart } = useCart();

  const totalItems = cart.items.reduce((sum, item) => sum + item.qty, 0);

  // Filter products based on search term and selected category
  useEffect(() => {
    if (search.trim().length > 0) {
      const searchTerm = search.toLowerCase();

      // First, find products that start with the search term (higher priority)
      const startsWithMatches = productsData.filter(product =>
        product.title.toLowerCase().startsWith(searchTerm) ||
        product.brand.toLowerCase().startsWith(searchTerm)
      );

      // Then, find products that include the search term but don't start with it
      const includesMatches = productsData.filter(product =>
        (product.title.toLowerCase().includes(searchTerm) && !product.title.toLowerCase().startsWith(searchTerm)) ||
        (product.brand.toLowerCase().includes(searchTerm) && !product.brand.toLowerCase().startsWith(searchTerm))
      );

      // Combine the results, prioritizing the startsWith matches
      let filtered = [...startsWithMatches, ...includesMatches];

      // Apply category filter if selected
      if (selectedCategory) {
        filtered = filtered.filter(product => product.category === selectedCategory);
      }

      // Limit to 8 suggestions
      setSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search, selectedCategory]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    // Add overflow hidden to body when suggestions are shown (prevents scrolling behind dropdown on mobile)
    if (showSuggestions && suggestions.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showSuggestions, suggestions.length]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  // Format price with commas for Indian currency format
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <header className="sticky top-0 z-50 w-full max-w-full overflow-hidden">
      {/* Main Navigation */}
      <nav className="w-full bg-[#131921] text-white flex flex-wrap items-center px-1 sm:px-2 py-1 font-amazon">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center mr-1 sm:mr-2 border border-transparent hover:border-white p-1 cursor-pointer no-underline"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = "";
            // Reset any search or filters
            setSearch("");
            onCategoryChange("");
          }}
        >
          <img
            src="https://pngimg.com/uploads/amazon/amazon_PNG11.png"
            alt="Amazon"
            className="h-6 sm:h-7"
          />
          <span className="text-xs font-bold -ml-1 mt-3 text-amazon_yellow">.in</span>
        </a>

        {/* Deliver to */}
        <div className="hidden md:flex flex-col justify-center items-start mr-2 border border-transparent hover:border-white p-1 cursor-pointer">
          <span className="text-xs text-gray-300">Delivering to Nagpur 440024</span>
          <div className="flex items-center">
            <span className="material-icons text-sm">location_on</span>
            <span className="font-bold text-xs ml-1">Update location</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-1 h-10 mx-1">
          <div className="relative flex w-full rounded overflow-visible border border-[#cdcdcd] focus-within:border-[#ff9900] z-[90]" ref={suggestionsRef}>
            <div className="relative hidden sm:block">
              <select
                className="appearance-none h-full bg-[#f3f3f3] text-[#555555] pl-2 pr-5 py-0 border-none outline-none text-xs cursor-pointer"
                onChange={e => handleCategoryChange(e.target.value)}
                value={selectedCategory}
                style={{ minWidth: '45px' }}
              >
                <option value="">All</option>
                <option value="mobiles">Mobiles</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="computers">Computers</option>
                <option value="home">Home & Kitchen</option>
                <option value="books">Books</option>
              </select>
              <span className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                <span className="material-icons text-xs">arrow_drop_down</span>
              </span>
            </div>
            <div className="relative flex-1 flex items-center">
              <input
                className="flex-1 px-2 py-0 bg-white text-black outline-none text-sm border-0 h-full min-w-0"
                type="text"
                placeholder="Search Amazon.in"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);

                  // Show suggestions as user types
                  if (e.target.value.trim().length > 0) {
                    setShowSuggestions(true);
                  } else {
                    // If empty, show popular products
                    const popularProducts = [...productsData]
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 8);
                    setSuggestions(popularProducts);
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={e => e.key === "Enter" && onSearch(search)}
                onClick={() => {
                  // Always show suggestions on click
                  if (search.trim().length > 0) {
                    setShowSuggestions(true);
                  } else {
                    // If empty, show popular products
                    const popularProducts = [...productsData]
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 8);
                    setSuggestions(popularProducts);
                    setShowSuggestions(true);
                  }
                }}
                onFocus={() => {
                  // Show suggestions immediately if there's any text
                  if (search.trim().length > 0) {
                    setShowSuggestions(true);
                  }
                  // If empty, show popular products as suggestions
                  else {
                    // Get a mix of popular products (high ratings)
                    const popularProducts = [...productsData]
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 8);
                    setSuggestions(popularProducts);
                    setShowSuggestions(true);
                  }
                }}
              />
              {/* Show suggestions button - always visible */}
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                onClick={() => {
                  // If empty, show popular products
                  if (!search.trim()) {
                    const popularProducts = [...productsData]
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 8);
                    setSuggestions(popularProducts);
                  }
                  setShowSuggestions(true);
                }}
              >
                <span className="material-icons text-sm">expand_more</span>
              </button>
            </div>
            <button
              className="bg-[#febd69] hover:bg-[#f3a847] text-black px-2 sm:px-4 flex items-center justify-center border-none flex-shrink-0"
              onClick={() => {
                if (search.trim()) {
                  onSearch(search);
                } else {
                  // If empty, show popular products
                  const popularProducts = [...productsData]
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 8);
                  setSuggestions(popularProducts);
                  setShowSuggestions(true);
                }
              }}
            >
              <span className="material-icons">search</span>
            </button>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div id="search-suggestions-overlay" className="fixed inset-0 z-[9999] flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                {/* Search suggestions panel */}
                <div className="bg-white w-full h-full overflow-auto flex flex-col" style={{ maxHeight: '100vh' }}>
                  {/* Header with back button */}
                  <div className="bg-[#131921] text-white p-4 flex items-center justify-between sticky top-0 z-[9999]">
                    <button
                      className="flex items-center"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <span className="material-icons mr-2">arrow_back</span>
                      <span>Back to Amazon</span>
                    </button>

                    <button
                      className="text-white p-1 rounded-full"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <span className="material-icons">close</span>
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="bg-[#232F3E] p-4 sticky top-[60px] z-[9999]">
                    <div className="flex w-full rounded overflow-hidden">
                      <input
                        className="flex-1 px-3 py-3 bg-white text-black outline-none text-sm border-0"
                        type="text"
                        placeholder="Search Amazon.in"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                      />
                      <button
                        className="bg-[#febd69] hover:bg-[#f3a847] text-black px-4 flex items-center justify-center border-none"
                        onClick={() => {
                          if (search.trim()) {
                            onSearch(search);
                            setShowSuggestions(false);
                            window.location.hash = "";
                          }
                        }}
                      >
                        <span className="material-icons">search</span>
                      </button>
                    </div>
                  </div>

                  {/* Results header */}
                  <div className="p-3 bg-gray-50 border-b border-gray-200 text-sm font-medium sticky top-[128px] z-[9998]">
                    {search.trim().length > 0 ? `Search results for "${search}"` : "Popular products"}
                  </div>

                  {/* Results list */}
                  <div className="flex-1 overflow-auto">
                    {suggestions.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100 active:bg-gray-200"
                        onClick={() => {
                          setSearch(product.title);
                          setShowSuggestions(false);
                          // Navigate to product detail page
                          window.location.hash = `product-${product.id}`;
                        }}
                      >
                        <div className="w-16 h-16 flex-shrink-0 mr-4">
                          <img src={product.image} alt={product.title} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-medium text-gray-800 mb-1">
                            {search.trim().length > 0 ? (
                              <span>
                                {product.title.split(new RegExp(`(${search})`, 'i')).map((part, i) =>
                                  part.toLowerCase() === search.toLowerCase() ?
                                    <span key={i} className="bg-yellow-200">{part}</span> :
                                    <span key={i}>{part}</span>
                                )}
                              </span>
                            ) : (
                              product.title
                            )}
                          </div>
                          <div className="flex items-center mb-1">
                            <span className="text-sm text-amazon_red font-medium">₹{formatPrice(product.price)}</span>
                            <span className="mx-2 text-xs text-gray-500">|</span>
                            <div className="flex text-amazon_yellow">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-icons text-sm">
                                  {i < Math.floor(product.rating) ? 'star' : (i < product.rating ? 'star_half' : 'star_border')}
                                </span>
                              ))}
                              <span className="text-gray-500 ml-1">({product.reviews})</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 capitalize">{product.category}</span>
                            <span className="mx-2 text-xs text-gray-500">|</span>
                            <span className="text-sm text-gray-500">{product.brand}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {search.trim().length > 0 && (
                      <div
                        className="p-4 text-center text-amazon_teal hover:text-amazon_orange cursor-pointer text-base font-medium bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border-t border-gray-200"
                        onClick={() => {
                          onSearch(search);
                          setShowSuggestions(false);
                          // Return to home page with search results
                          window.location.hash = "";
                        }}
                      >
                        See all results for "{search}"
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500 text-center">
                    {search.trim().length === 0
                      ? "Popular products shown based on high ratings"
                      : "Click on a product to view details"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side navigation */}
        <div className="flex items-center ml-1 md:ml-2">
          {/* Theme Toggle */}
          <div className="flex items-center border border-transparent hover:border-white p-1 cursor-pointer mx-1">
            <div className="flex flex-col items-center">
              <ThemeToggle />
              <span className="text-xs mt-1 font-bold hidden sm:inline">Theme</span>
            </div>
          </div>

          {/* Language selector */}
          <div className="hidden md:flex items-center border border-transparent hover:border-white p-1 cursor-pointer mx-1">
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png" alt="India" className="h-3 mr-1" />
            <span className="text-xs font-bold">EN</span>
            <span className="material-icons text-xs">arrow_drop_down</span>
          </div>

          {/* Account & Lists */}
          <div className="flex flex-col text-xs border border-transparent hover:border-white p-1 cursor-pointer mx-1">
            <span className="text-xs hidden xs:inline">Hello, sign in</span>
            <div className="flex items-center">
              <span className="font-bold text-xs">Account & Lists</span>
              <span className="material-icons text-xs">arrow_drop_down</span>
            </div>
          </div>

          {/* Returns & Orders */}
          <div className="hidden sm:flex flex-col text-xs border border-transparent hover:border-white p-1 cursor-pointer mx-1">
            <span className="text-xs">Returns</span>
            <span className="font-bold text-xs">& Orders</span>
          </div>

          {/* Voice Command Button */}
          <div className="flex items-center border border-transparent hover:border-white p-1 cursor-pointer mx-1 relative">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amazon_red rounded-full animate-ping"></div>
                <FinalVoiceCommands />
              </div>
              <span className="text-xs mt-1 font-bold hidden sm:inline">Voice</span>
            </div>
          </div>

          {/* Cart */}
          <a
            href="#cart"
            className="relative flex items-center border border-transparent hover:border-white p-1 cursor-pointer mx-1 no-underline"
          >
            <div className="relative">
              <span className="material-icons text-xl sm:text-2xl">shopping_cart</span>
              <span
                className={`cart-count absolute -top-1 right-0 bg-red-600 text-white font-bold rounded-full h-4 w-4 flex items-center justify-center text-xs shadow-sm ${totalItems > 0 ? '' : 'hidden'}`}
              >
                {totalItems}
              </span>
            </div>
            <span className="font-bold text-sm mt-3 ml-1 text-white">Cart</span>
          </a>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="flex items-center bg-[#232F3E] text-white px-1 sm:px-2 py-1 text-xs w-full max-w-full">
        {/* Menu button - also used for sidebar toggle */}
        <div
          className="flex items-center border border-transparent hover:border-white p-1 cursor-pointer sidebar-toggle flex-shrink-0"
          onClick={onMenuClick}
        >
          <span className="material-icons text-sm mr-1">menu</span>
          <span className="font-bold">All</span>
        </div>

        <div className="flex space-x-2 md:space-x-4 ml-1 sm:ml-2 overflow-x-auto hide-scrollbar flex-grow">
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0 hidden xs:inline">MX Player</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0">Sell</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0 hidden sm:inline">Bestsellers</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0">Today's Deals</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0">Mobiles</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0 hidden sm:inline">Prime</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0">Fashion</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0 hidden md:inline">Customer Service</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0 hidden md:inline">New Releases</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0">Electronics</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0 hidden md:inline">Amazon Pay</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0 hidden lg:inline">Home & Kitchen</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0 hidden lg:inline">Computers</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0 hidden lg:inline">Books</span>
          <span className="whitespace-nowrap hover:text-white cursor-pointer flex-shrink-0 hidden xl:inline">Car & Motorbike</span>
        </div>
      </div>
    </header>
  );
}