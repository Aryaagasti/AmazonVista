import { useState, useEffect } from "react";
import productsData from "../assets/products.json";

export default function Sidebar({ filters, setFilters, brands, categories, onClose }) {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(filters.price);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Format price with commas for Indian currency format
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get all available brands for the selected categories
  useEffect(() => {
    let filteredProducts = productsData;

    // Filter by selected categories if any
    if (filters.categories.length > 0) {
      filteredProducts = filteredProducts.filter(p =>
        filters.categories.includes(p.category)
      );
    }

    // Get unique brands from filtered products
    const uniqueBrands = [...new Set(filteredProducts.map(p => p.brand))];
    setAvailableBrands(uniqueBrands);
  }, [filters.categories]);

  // Apply price range filter
  const applyPriceFilter = () => {
    setFilters(f => ({
      ...f,
      price: maxPrice,
      minPrice: minPrice
    }));
  };

  // Get category-specific filters
  const getCategorySpecificFilters = () => {
    if (filters.categories.length === 0) return null;

    if (filters.categories.includes("mobiles")) {
      return (
        <div className="mb-4 border-b pb-3">
          <h3 className="font-bold text-sm mb-2">Mobile Features</h3>
          <ul className="text-sm">
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="feature-5g" className="mr-2" />
                <label htmlFor="feature-5g" className="cursor-pointer">5G Compatible</label>
              </div>
            </li>
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="feature-camera" className="mr-2" />
                <label htmlFor="feature-camera" className="cursor-pointer">Camera 48MP & Above</label>
              </div>
            </li>
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="feature-battery" className="mr-2" />
                <label htmlFor="feature-battery" className="cursor-pointer">Battery 5000mAh & Above</label>
              </div>
            </li>
          </ul>
        </div>
      );
    }

    if (filters.categories.includes("electronics")) {
      return (
        <div className="mb-4 border-b pb-3">
          <h3 className="font-bold text-sm mb-2">Electronics Features</h3>
          <ul className="text-sm">
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="feature-4k" className="mr-2" />
                <label htmlFor="feature-4k" className="cursor-pointer">4K Resolution</label>
              </div>
            </li>
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="feature-smart" className="mr-2" />
                <label htmlFor="feature-smart" className="cursor-pointer">Smart Features</label>
              </div>
            </li>
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="feature-wireless" className="mr-2" />
                <label htmlFor="feature-wireless" className="cursor-pointer">Wireless</label>
              </div>
            </li>
          </ul>
        </div>
      );
    }

    if (filters.categories.includes("computers")) {
      return (
        <div className="mb-4 border-b pb-3">
          <h3 className="font-bold text-sm mb-2">Computer Features</h3>
          <ul className="text-sm">
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="feature-gaming" className="mr-2" />
                <label htmlFor="feature-gaming" className="cursor-pointer">Gaming</label>
              </div>
            </li>
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="feature-ssd" className="mr-2" />
                <label htmlFor="feature-ssd" className="cursor-pointer">SSD Storage</label>
              </div>
            </li>
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="feature-touchscreen" className="mr-2" />
                <label htmlFor="feature-touchscreen" className="cursor-pointer">Touchscreen</label>
              </div>
            </li>
          </ul>
        </div>
      );
    }

    return null;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      price: 100000,
      brands: [],
      categories: [],
      rating: 1,
    });
    setMinPrice(0);
    setMaxPrice(100000);
  };

  return (
    <aside className="w-64 h-full bg-white shadow-md overflow-y-auto">
      {/* Mobile Close Button */}
      <div className="md:hidden flex items-center justify-between bg-[#232F3E] text-white p-4">
        <div className="flex items-center">
          <span className="material-icons mr-2">account_circle</span>
          <span className="font-bold">Hello, Sign In</span>
        </div>
        <button onClick={onClose} className="text-white">
          <span className="material-icons">close</span>
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Filters</h2>
          <button
            onClick={clearAllFilters}
            className="text-xs text-amazon_teal hover:text-amazon_orange hover:underline"
          >
            Clear all
          </button>
        </div>

        {/* Department/Category Section */}
        <div className="mb-4 border-b pb-3">
          <h3 className="font-bold text-sm mb-2">Department</h3>
          <ul className="text-sm">
            {categories.map(cat => (
              <li key={cat} className="mb-1.5">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`cat-${cat}`}
                    className="mr-2"
                    checked={filters.categories.includes(cat)}
                    onChange={e =>
                      setFilters(f => ({
                        ...f,
                        categories: e.target.checked
                          ? [...f.categories, cat]
                          : f.categories.filter(c => c !== cat),
                        // Reset brands when changing categories
                        brands: e.target.checked ? [] : f.brands
                      }))
                    }
                  />
                  <label htmlFor={`cat-${cat}`} className="cursor-pointer capitalize">
                    {cat}
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Category-specific filters */}
        {getCategorySpecificFilters()}

        {/* Customer Reviews Section */}
        <div className="mb-4 border-b pb-3">
          <h3 className="font-bold text-sm mb-2">Customer Reviews</h3>
          <ul className="text-sm">
            {[4, 3, 2, 1].map(r => (
              <li key={r} className="mb-1.5">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => setFilters(f => ({ ...f, rating: r }))}
                >
                  <div className="flex text-amazon_orange">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < r ? "text-amazon_orange" : "text-gray-300"}>★</span>
                    ))}
                  </div>
                  <span className="ml-2 text-amazon_teal hover:text-amazon_orange">& Up</span>
                  {filters.rating === r && (
                    <span className="ml-auto text-amazon_teal">✓</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Brands Section */}
        <div className="mb-4 border-b pb-3">
          <h3 className="font-bold text-sm mb-2">Brands</h3>
          <ul className="text-sm">
            {availableBrands.length > 0 ? (
              <>
                {(showAllBrands ? availableBrands : availableBrands.slice(0, 5)).map(brand => (
                  <li key={brand} className="mb-1.5">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`brand-${brand}`}
                        className="mr-2"
                        checked={filters.brands.includes(brand)}
                        onChange={e =>
                          setFilters(f => ({
                            ...f,
                            brands: e.target.checked
                              ? [...f.brands, brand]
                              : f.brands.filter(b => b !== brand),
                          }))
                        }
                      />
                      <label htmlFor={`brand-${brand}`} className="cursor-pointer">
                        {brand}
                      </label>
                    </div>
                  </li>
                ))}

                {availableBrands.length > 5 && (
                  <button
                    onClick={() => setShowAllBrands(!showAllBrands)}
                    className="text-amazon_teal hover:text-amazon_orange hover:underline text-xs mt-1"
                  >
                    {showAllBrands ? 'Show less' : `See all ${availableBrands.length} brands`}
                  </button>
                )}
              </>
            ) : (
              <li>No brands available for selected filters</li>
            )}
          </ul>
        </div>

        {/* Price Range Section */}
        <div className="mb-4 border-b pb-3">
          <h3 className="font-bold text-sm mb-2">Price</h3>
          <ul className="text-sm">
            <li className="mb-1.5">
              <div className="flex flex-col">
                <input
                  type="range"
                  min={0}
                  max={250000}
                  step={1000}
                  value={maxPrice}
                  onChange={e => setMaxPrice(parseInt(e.target.value))}
                  className="w-full mb-2"
                />
                <div className="flex justify-between text-xs">
                  <span>₹0</span>
                  <span>₹{formatPrice(maxPrice)}</span>
                  <span>₹250,000</span>
                </div>
              </div>
            </li>
            <li className="mt-3">
              <div className="flex items-center">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full p-1 border border-gray-300 rounded text-xs"
                    min={0}
                    max={maxPrice}
                    value={minPrice || ""}
                    onChange={e => setMinPrice(parseInt(e.target.value) || 0)}
                  />
                </div>
                <span className="mx-2 text-gray-400">-</span>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full p-1 border border-gray-300 rounded text-xs"
                    min={minPrice}
                    max={250000}
                    value={maxPrice || ""}
                    onChange={e => setMaxPrice(parseInt(e.target.value) || 0)}
                  />
                </div>
                <button
                  className="ml-2 bg-gray-200 hover:bg-gray-300 text-xs px-2 py-1 rounded"
                  onClick={applyPriceFilter}
                >
                  Go
                </button>
              </div>
            </li>

            {/* Predefined price ranges */}
            <li className="mt-3">
              <ul>
                <li className="mb-1">
                  <button
                    className="text-amazon_teal hover:text-amazon_orange"
                    onClick={() => {
                      setMinPrice(0);
                      setMaxPrice(1000);
                      setFilters(f => ({ ...f, price: 1000, minPrice: 0 }));
                    }}
                  >
                    Under ₹1,000
                  </button>
                </li>
                <li className="mb-1">
                  <button
                    className="text-amazon_teal hover:text-amazon_orange"
                    onClick={() => {
                      setMinPrice(1000);
                      setMaxPrice(5000);
                      setFilters(f => ({ ...f, price: 5000, minPrice: 1000 }));
                    }}
                  >
                    ₹1,000 - ₹5,000
                  </button>
                </li>
                <li className="mb-1">
                  <button
                    className="text-amazon_teal hover:text-amazon_orange"
                    onClick={() => {
                      setMinPrice(5000);
                      setMaxPrice(10000);
                      setFilters(f => ({ ...f, price: 10000, minPrice: 5000 }));
                    }}
                  >
                    ₹5,000 - ₹10,000
                  </button>
                </li>
                <li className="mb-1">
                  <button
                    className="text-amazon_teal hover:text-amazon_orange"
                    onClick={() => {
                      setMinPrice(10000);
                      setMaxPrice(20000);
                      setFilters(f => ({ ...f, price: 20000, minPrice: 10000 }));
                    }}
                  >
                    ₹10,000 - ₹20,000
                  </button>
                </li>
                <li>
                  <button
                    className="text-amazon_teal hover:text-amazon_orange"
                    onClick={() => {
                      setMinPrice(20000);
                      setMaxPrice(250000);
                      setFilters(f => ({ ...f, price: 250000, minPrice: 20000 }));
                    }}
                  >
                    Over ₹20,000
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Deals Section */}
        <div className="mb-4 border-b pb-3">
          <h3 className="font-bold text-sm mb-2">Deals & Discounts</h3>
          <ul className="text-sm">
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="deal-today" className="mr-2" />
                <label htmlFor="deal-today" className="cursor-pointer">Today's Deals</label>
              </div>
            </li>
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="deal-discount" className="mr-2" />
                <label htmlFor="deal-discount" className="cursor-pointer">Discounts</label>
              </div>
            </li>
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="deal-clearance" className="mr-2" />
                <label htmlFor="deal-clearance" className="cursor-pointer">Clearance</label>
              </div>
            </li>
          </ul>
        </div>

        {/* Availability Section */}
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-2">Availability</h3>
          <ul className="text-sm">
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="include-out-of-stock" className="mr-2" />
                <label htmlFor="include-out-of-stock" className="cursor-pointer">
                  Include Out of Stock
                </label>
              </div>
            </li>
            <li className="mb-1.5">
              <div className="flex items-center">
                <input type="checkbox" id="prime-delivery" className="mr-2" />
                <label htmlFor="prime-delivery" className="cursor-pointer">
                  Prime Delivery
                </label>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}