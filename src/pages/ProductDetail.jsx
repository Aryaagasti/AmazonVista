import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductChatbot from "../components/ProductChatbot";
import PriceGraph from "../components/PriceGraph";
import productsData from "../assets/products.json";

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const { dispatch } = useCart();
  const { darkMode } = useTheme();

  // Get product ID from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    const productId = hash.split("product-")[1];

    if (productId) {
      // Find product by ID
      const foundProduct = productsData.find(p => p.id === parseInt(productId));

      if (foundProduct) {
        // Enhance product with additional data
        const enhancedProduct = {
          ...foundProduct,
          originalPrice: foundProduct.price + Math.floor(Math.random() * 10000) + 1000,
          prime: Math.random() > 0.5,
          // Add multiple images (using the same image for demo)
          images: [
            foundProduct.image,
            foundProduct.image,
            foundProduct.image,
            foundProduct.image
          ],
          // Add specifications
          specifications: [
            { name: "Brand", value: foundProduct.brand },
            { name: "Category", value: foundProduct.category },
            { name: "Model", value: `${foundProduct.brand}-${Math.floor(Math.random() * 1000)}` },
            { name: "Color", value: ["Black", "White", "Blue", "Red"][Math.floor(Math.random() * 4)] },
            { name: "Weight", value: `${Math.floor(Math.random() * 5) + 1} kg` },
            { name: "Dimensions", value: `${Math.floor(Math.random() * 30) + 10} x ${Math.floor(Math.random() * 20) + 5} x ${Math.floor(Math.random() * 10) + 2} cm` },
            { name: "Warranty", value: `${Math.floor(Math.random() * 2) + 1} year` }
          ],
          // Add features
          features: [
            "High quality product",
            "Durable and long-lasting",
            "Easy to use",
            "Energy efficient",
            "Modern design"
          ],
          // Add reviews
          reviews: Array(foundProduct.reviews).fill().map((_, i) => ({
            id: i + 1,
            user: `User${Math.floor(Math.random() * 1000)}`,
            rating: Math.floor(Math.random() * 5) + 1,
            title: ["Great product!", "Excellent value", "Highly recommended", "Good quality", "Worth the money"][Math.floor(Math.random() * 5)],
            comment: ["I'm very satisfied with this product. It works perfectly and looks great!",
                      "This product exceeded my expectations. The quality is amazing for the price.",
                      "I've been using this for a month now and it's still working perfectly. Very happy with my purchase.",
                      "Good product for the price. Delivery was quick and packaging was good.",
                      "I would definitely recommend this product to others. It's worth every penny."][Math.floor(Math.random() * 5)],
            date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
            verified: Math.random() > 0.3
          })),
          // Add discount percentage
          discountPercentage: Math.floor(((foundProduct.price + Math.floor(Math.random() * 10000) + 1000) - foundProduct.price) / (foundProduct.price + Math.floor(Math.random() * 10000) + 1000) * 100)
        };

        setProduct(enhancedProduct);
      }
    }

    setLoading(false);
  }, []);

  // Format price with commas for Indian currency format
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle add to cart
  const handleAddToCart = () => {
    dispatch({
      type: "ADD",
      product: {
        ...product,
        qty: quantity
      }
    });
    alert(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart!`);
  };

  // Handle buy now
  const handleBuyNow = () => {
    dispatch({
      type: "ADD",
      product: {
        ...product,
        qty: quantity
      }
    });
    window.location.hash = "cart";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon_blue"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="mb-4">Sorry, the product you're looking for doesn't exist.</p>
            <a href="/" className="bg-amazon_yellow hover:bg-amazon_yellow-hover text-black font-semibold py-2 px-4 rounded">
              Back to Home
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate rating distribution
  const ratingDistribution = [0, 0, 0, 0, 0];
  product.reviews.forEach(review => {
    ratingDistribution[review.rating - 1]++;
  });

  // Calculate average rating
  const averageRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;

  return (
    <div className={`min-h-screen flex flex-col bg-amazon_gray-light ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar />
      <ProductChatbot currentProduct={product} />

      <div className="flex-1 max-w-screen-xl mx-auto p-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-amazon_orange hover:underline">Home</a>
          <span className="mx-1">&gt;</span>
          <a href={`/#${product.category}`} className="hover:text-amazon_orange hover:underline">{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</a>
          <span className="mx-1">&gt;</span>
          <a href={`/#${product.brand}`} className="hover:text-amazon_orange hover:underline">{product.brand}</a>
          <span className="mx-1">&gt;</span>
          <span className="text-gray-700">{product.title}</span>
        </div>

        {/* Product Details */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Images */}
            <div className="md:col-span-1">
              <div className="sticky top-20">
                <div className="flex mb-4">
                  <div className="w-16 space-y-2 mr-2">
                    {product.images.map((image, index) => (
                      <div
                        key={index}
                        className={`border p-1 cursor-pointer ${selectedImage === index ? 'border-amazon_orange' : 'border-gray-300'}`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img src={image} alt={`${product.title} - view ${index + 1}`} className="w-full h-14 object-contain" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 border border-gray-200 flex items-center justify-center p-4">
                    <img
                      src={product.images[selectedImage]}
                      alt={product.title}
                      className="max-w-full max-h-80 object-contain"
                    />
                  </div>
                </div>

                <div className="flex justify-center space-x-4 mt-4">
                  <button className="bg-amazon_yellow hover:bg-amazon_yellow-hover text-black font-semibold py-2 px-4 rounded-full flex items-center">
                    <span className="material-icons mr-1">share</span>
                    Share
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-full flex items-center">
                    <span className="material-icons mr-1">favorite_border</span>
                    Wishlist
                  </button>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="md:col-span-2">
              <h1 className="text-xl md:text-2xl font-medium mb-2">{product.title}</h1>

              <div className="flex items-center mb-2">
                <div className="flex text-amazon_yellow">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-icons text-xl">
                      {i < Math.floor(product.rating) ? 'star' : (i < product.rating ? 'star_half' : 'star_border')}
                    </span>
                  ))}
                </div>
                <a href="#reviews" className="ml-2 text-amazon_teal hover:text-amazon_orange hover:underline" onClick={() => setReviewsVisible(true)}>
                  {product.reviews.length} ratings
                </a>
              </div>

              {product.prime && (
                <div className="flex items-center my-2">
                  <span className="text-xs text-amazon_blue bg-amazon_yellow-hover px-1 rounded mr-1">prime</span>
                  <span className="text-xs">FREE Delivery by <span className="font-bold">Tomorrow</span></span>
                </div>
              )}

              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-baseline">
                  <span className="text-red-600 text-xs mr-1">-{product.discountPercentage}%</span>
                  <span className="text-2xl font-bold">₹{formatPrice(product.price)}</span>
                  <span className="text-gray-500 line-through text-sm ml-2">₹{formatPrice(product.originalPrice)}</span>
                </div>
                <div className="text-xs text-gray-500">Inclusive of all taxes</div>
              </div>

              {/* Offers */}
              <div className="border border-gray-200 rounded p-3 mb-4">
                <h3 className="font-bold text-lg mb-2">Available offers</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="material-icons text-amazon_teal mr-2 text-xl">local_offer</span>
                    <div>
                      <span className="font-medium">Bank Offer:</span> 10% off on HDFC Bank Credit Card, up to ₹1,500. On orders of ₹5,000 and above
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-amazon_teal mr-2 text-xl">local_offer</span>
                    <div>
                      <span className="font-medium">No Cost EMI:</span> Avail No Cost EMI on select cards for orders above ₹3000
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-amazon_teal mr-2 text-xl">local_offer</span>
                    <div>
                      <span className="font-medium">Partner Offers:</span> Get GST invoice and save up to 28% on business purchases
                    </div>
                  </li>
                </ul>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <div className="flex items-center">
                  <span className="mr-2 font-medium">Quantity:</span>
                  <div className="border border-gray-300 rounded-md inline-flex">
                    <button
                      className="px-3 py-1 border-r border-gray-300 hover:bg-gray-100 transition-colors duration-200 cursor-pointer active:bg-gray-200"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="px-4 py-1">{quantity}</span>
                    <button
                      className="px-3 py-1 border-l border-gray-300 hover:bg-gray-100 transition-colors duration-200 cursor-pointer active:bg-gray-200"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    className="bg-amazon_yellow hover:bg-amazon_yellow-hover text-black font-semibold py-3 px-8 rounded-full flex-1 md:flex-none flex items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-inner"
                    onClick={handleAddToCart}
                  >
                    <span className="material-icons mr-2">shopping_cart</span>
                    Add to Cart
                  </button>

                  <button
                    className="bg-amazon_orange hover:bg-amazon_orange-dark text-white font-semibold py-3 px-8 rounded-full flex-1 md:flex-none flex items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 active:shadow-inner"
                    onClick={handleBuyNow}
                  >
                    <span className="material-icons mr-2">flash_on</span>
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Price Graph */}
              <PriceGraph productId={product.id} currentPrice={product.price} />

              {/* Delivery */}
              <div className="border border-gray-200 rounded p-3 mb-4">
                <div className="flex items-start">
                  <span className="material-icons text-gray-600 mr-2">location_on</span>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">Deliver to:</span>
                      <a href="#" className="ml-2 text-amazon_teal hover:text-amazon_orange hover:underline">Select delivery location</a>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {product.prime ? 'FREE delivery' : 'Standard delivery'}: <span className="font-bold">Tomorrow</span>
                      <div className="text-amazon_green text-xs font-medium mt-1">
                        Order within 4 hrs 32 mins
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">About this item</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-sm">{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">Product Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.specifications.map((spec, index) => (
              <div key={index} className="flex border-b border-gray-100 pb-2">
                <div className="font-medium w-1/3 text-gray-600">{spec.name}</div>
                <div className="w-2/3">{spec.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div id="reviews" className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Customer Reviews</h2>
            <button
              className="text-amazon_teal hover:text-amazon_orange hover:underline"
              onClick={() => setReviewsVisible(!reviewsVisible)}
            >
              {reviewsVisible ? 'Hide Reviews' : 'Show All Reviews'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rating Summary */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <div className="text-3xl font-bold mr-2">{averageRating.toFixed(1)}</div>
                <div className="flex text-amazon_yellow">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-icons">
                      {i < Math.floor(averageRating) ? 'star' : (i < averageRating ? 'star_half' : 'star_border')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-4">{product.reviews.length} global ratings</div>

              {/* Rating Bars */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const percentage = (ratingDistribution[rating - 1] / product.reviews.length) * 100;
                  return (
                    <div key={rating} className="flex items-center">
                      <a href="#" className="text-amazon_teal hover:text-amazon_orange hover:underline mr-2">
                        {rating} star
                      </a>
                      <div className="flex-1 bg-gray-200 h-4 rounded-full overflow-hidden">
                        <div
                          className="bg-amazon_yellow h-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">{percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <button className="w-full bg-white hover:bg-gray-100 text-amazon_blue border border-gray-300 font-medium py-2 px-4 rounded">
                  Write a customer review
                </button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="md:col-span-2">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="font-bold text-lg mb-2">Top reviews from India</h3>
                <div className="flex space-x-4">
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded text-sm">
                    All reviews
                  </button>
                  <button className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-medium py-1 px-3 rounded text-sm">
                    Positive
                  </button>
                  <button className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-medium py-1 px-3 rounded text-sm">
                    Critical
                  </button>
                </div>
              </div>

              {/* Reviews */}
              {(reviewsVisible ? product.reviews : product.reviews.slice(0, 3)).map(review => (
                <div key={review.id} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
                  <div className="flex items-start">
                    <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 font-bold mr-2">
                      {review.user.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{review.user}</div>
                      {review.verified && (
                        <div className="text-xs text-amazon_orange">Verified Purchase</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center mt-2">
                    <div className="flex text-amazon_yellow">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-icons text-sm">
                          {i < review.rating ? 'star' : 'star_border'}
                        </span>
                      ))}
                    </div>
                    <div className="ml-2 font-medium">{review.title}</div>
                  </div>

                  <div className="text-xs text-gray-500 mt-1">Reviewed on {review.date}</div>

                  <div className="mt-2 text-sm">{review.comment}</div>

                  <div className="mt-3 flex items-center">
                    <button className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded mr-2 flex items-center">
                      <span className="material-icons text-xs mr-1">thumb_up</span>
                      Helpful
                    </button>
                    <button className="text-xs text-amazon_teal hover:text-amazon_orange hover:underline">
                      Report abuse
                    </button>
                  </div>
                </div>
              ))}

              {!reviewsVisible && product.reviews.length > 3 && (
                <button
                  className="text-amazon_teal hover:text-amazon_orange hover:underline font-medium"
                  onClick={() => setReviewsVisible(true)}
                >
                  See all {product.reviews.length} reviews
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {productsData
              .filter(p => p.category === product.category && p.id !== product.id)
              .slice(0, 5)
              .map(relatedProduct => (
                <div
                  key={relatedProduct.id}
                  className="border border-gray-200 rounded p-3 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <a
                    href={`#product-${relatedProduct.id}`}
                    className="cursor-pointer flex-1 flex flex-col"
                  >
                    <div className="h-32 flex items-center justify-center mb-2">
                      <img src={relatedProduct.image} alt={relatedProduct.title} className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="text-sm font-medium line-clamp-2 mb-1 hover:text-amazon_teal">{relatedProduct.title}</div>
                    <div className="flex text-amazon_yellow text-xs">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-icons text-xs">
                          {i < Math.floor(relatedProduct.rating) ? 'star' : (i < relatedProduct.rating ? 'star_half' : 'star_border')}
                        </span>
                      ))}
                      <span className="text-gray-500 ml-1">({relatedProduct.reviews})</span>
                    </div>
                    <div className="font-bold mt-1 text-amazon_red">₹{formatPrice(relatedProduct.price)}</div>
                  </a>

                  <div className="mt-2 flex flex-col gap-1">
                    <button
                      className="bg-amazon_yellow hover:bg-amazon_yellow-hover text-black text-xs py-1 rounded-full border border-yellow-700 transition-all duration-200 hover:shadow-md cursor-pointer active:scale-95"
                      onClick={() => {
                        dispatch({ type: "ADD", product: relatedProduct });
                        alert(`${relatedProduct.title} added to cart!`);
                      }}
                    >
                      <span className="flex items-center justify-center">
                        <span className="material-icons text-xs mr-1">shopping_cart</span>
                        Add to Cart
                      </span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
