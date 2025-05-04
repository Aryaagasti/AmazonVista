import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StripeScriptLoader from "../components/StripeScriptLoader";
import StripeCardElement from "../components/StripeCardElement";
import { processPayment, formatPrice, convertToSmallestUnit } from "../services/stripeService";

export default function CheckoutPage() {
  const { cart, dispatch } = useCart();
  const { darkMode } = useTheme();
  const [paymentStep, setPaymentStep] = useState("details"); // details, payment, confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  // Form state
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "IN",
    },
  });

  // Calculate order totals
  const subtotal = cart.items.reduce((total, item) => total + item.price * item.qty, 0);
  const shipping = subtotal > 1000 ? 0 : 40;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;

  // No need for manual Stripe loading as we're using StripeScriptLoader component

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBillingDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBillingDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentStep === "details") {
      // Validate form
      const requiredFields = [
        'name', 'email', 'phone',
        'address.line1', 'address.city', 'address.state', 'address.postal_code'
      ];

      const missingFields = requiredFields.filter(field => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          return !billingDetails[parent][child];
        }
        return !billingDetails[field];
      });

      if (missingFields.length > 0) {
        setPaymentError("Please fill in all required fields");
        return;
      }

      // Move to payment step
      setPaymentStep("payment");
      setPaymentError(null);
      return;
    }

    if (paymentStep === "payment") {
      if (!stripe || !elements) {
        setPaymentError("Stripe has not been initialized");
        return;
      }

      if (!cardComplete) {
        setPaymentError("Please complete your card details");
        return;
      }

      setIsProcessing(true);
      setPaymentError(null);

      try {
        // In a real implementation, you would create a payment intent on your server
        // and confirm it here with the card details

        // Simulate payment processing
        const paymentResult = await processPayment({
          amount: convertToSmallestUnit(total),
          currency: 'inr',
          description: 'Amazon Clone Purchase',
          billingDetails
        });

        setPaymentSuccess(paymentResult);
        setPaymentStep("confirmation");

        // Clear cart after successful payment
        dispatch({ type: "CLEAR" });
      } catch (error) {
        setPaymentError(error.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Handle card element change
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setPaymentError(event.error.message);
    } else {
      setPaymentError(null);
    }
  };

  // Render billing details form
  const renderBillingDetailsForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Shipping & Billing Information</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={billingDetails.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon_yellow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={billingDetails.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon_yellow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={billingDetails.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon_yellow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
            <input
              type="text"
              name="address.line1"
              value={billingDetails.address.line1}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon_yellow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address Line 2</label>
            <input
              type="text"
              name="address.line2"
              value={billingDetails.address.line2}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon_yellow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <input
              type="text"
              name="address.city"
              value={billingDetails.address.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon_yellow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State *</label>
            <input
              type="text"
              name="address.state"
              value={billingDetails.address.state}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon_yellow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Postal Code *</label>
            <input
              type="text"
              name="address.postal_code"
              value={billingDetails.address.postal_code}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon_yellow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select
              name="address.country"
              value={billingDetails.address.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon_yellow"
            >
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
            </select>
          </div>
        </div>

        {paymentError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {paymentError}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-amazon_yellow hover:bg-amazon_yellow-hover text-black font-semibold py-3 rounded-md transition-all duration-300 hover:shadow-md"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );

  // Render payment form
  const renderPaymentForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Payment Information</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Card Details</label>
          <StripeScriptLoader>
            <StripeCardElement onChange={handleCardChange} />
          </StripeScriptLoader>

          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="font-medium text-sm mb-2">Payment Summary</h3>
            <div className="flex justify-between text-sm mb-1">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Shipping:</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Tax (18% GST):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {paymentError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {paymentError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setPaymentStep("details")}
            className="sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-md transition-all duration-300"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isProcessing || !cardComplete}
            className={`sm:flex-1 bg-amazon_yellow hover:bg-amazon_yellow-hover text-black font-semibold py-3 rounded-md transition-all duration-300 hover:shadow-md ${
              (isProcessing || !cardComplete) ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="material-icons mr-2">lock</span>
                Pay ₹{total.toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Render order confirmation
  const renderOrderConfirmation = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
      <div className="flex justify-center mb-4">
        <span className="material-icons text-5xl text-green-500">check_circle</span>
      </div>

      <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
      <p className="text-gray-600 mb-4">Thank you for your purchase</p>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Order ID:</span>
          <span>{paymentSuccess?.orderId}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-medium">Amount:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-medium">Date:</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Delivery Expected:</span>
          <span>{new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 flex items-start">
        <span className="material-icons text-green-500 mr-2 mt-0.5">local_shipping</span>
        <div className="text-left">
          <p className="font-medium">Your order is confirmed!</p>
          <p className="text-sm mt-1">We've accepted your order and are getting it ready. A confirmation email has been sent to {billingDetails.email}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={() => window.location.hash = ""}
          className="sm:flex-1 bg-amazon_yellow hover:bg-amazon_yellow-hover text-black font-semibold py-3 rounded-md transition-all duration-300 hover:shadow-md text-center flex items-center justify-center"
        >
          <span className="material-icons mr-2">shopping_bag</span>
          Continue Shopping
        </button>

        <button
          onClick={() => alert("Order tracking will be available soon!")}
          className="sm:flex-1 bg-amazon_teal text-white hover:bg-teal-600 font-semibold py-3 rounded-md transition-all duration-300 hover:shadow-md text-center flex items-center justify-center"
        >
          <span className="material-icons mr-2">local_shipping</span>
          Track Order
        </button>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-500">
          Need help? Contact <button onClick={() => alert("Customer service will be available soon!")} className="text-amazon_teal hover:underline">Amazon customer service</button>
        </p>
      </div>
    </div>
  );

  // Render order summary
  const renderOrderSummary = () => (
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-20">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="max-h-60 overflow-y-auto mb-4">
        {cart.items.map(item => (
          <div key={item.id} className="flex items-center py-2 border-b border-gray-100">
            <div className="w-12 h-12 flex-shrink-0 mr-2">
              <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-gray-500">Qty: {item.qty}</p>
            </div>
            <div className="text-sm font-medium">₹{(item.price * item.qty).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Shipping</span>
          <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Tax (18% GST)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      {shipping === 0 && (
        <div className="mt-4 bg-green-50 text-green-700 p-2 rounded-md text-sm flex items-center">
          <span className="material-icons text-green-500 mr-1 text-sm">local_shipping</span>
          Free shipping applied
        </div>
      )}
    </div>
  );

  // Redirect to home if cart is empty
  useEffect(() => {
    if (cart.items.length === 0 && paymentStep !== "confirmation") {
      window.location.hash = "";
    }
  }, [cart.items.length, paymentStep]);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar onSearch={() => {}} onCategoryChange={() => {}} />

      <div className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Checkout</h1>

          {/* Progress indicator */}
          <div className="flex items-center mt-4">
            <div className={`flex items-center ${paymentStep === "details" ? "text-amazon_teal font-medium" : "text-gray-500"}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${paymentStep === "details" ? "bg-amazon_teal text-white" : "bg-gray-200"}`}>
                1
              </span>
              Shipping
            </div>
            <div className={`w-12 h-1 mx-2 ${paymentStep === "details" ? "bg-gray-200" : "bg-amazon_teal"}`}></div>
            <div className={`flex items-center ${paymentStep === "payment" ? "text-amazon_teal font-medium" : "text-gray-500"}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${paymentStep === "payment" ? "bg-amazon_teal text-white" : "bg-gray-200"}`}>
                2
              </span>
              Payment
            </div>
            <div className={`w-12 h-1 mx-2 ${paymentStep === "confirmation" ? "bg-amazon_teal" : "bg-gray-200"}`}></div>
            <div className={`flex items-center ${paymentStep === "confirmation" ? "text-amazon_teal font-medium" : "text-gray-500"}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${paymentStep === "confirmation" ? "bg-amazon_teal text-white" : "bg-gray-200"}`}>
                3
              </span>
              Confirmation
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {paymentStep === "details" && renderBillingDetailsForm()}
            {paymentStep === "payment" && renderPaymentForm()}
            {paymentStep === "confirmation" && renderOrderConfirmation()}
          </div>

          <div className="lg:col-span-1">
            {renderOrderSummary()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
