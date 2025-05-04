// Stripe payment integration service

// Simulated Stripe public key (replace with your actual key in production)
const STRIPE_PUBLIC_KEY = "pk_test_TYooMQauvdEDq54NiTphI7jx";

/**
 * Initialize Stripe with public key
 * @returns {Object} Stripe instance
 */
export const initStripe = () => {
  // Check if Stripe is loaded
  if (!window.Stripe) {
    console.error("Stripe.js not loaded");
    return null;
  }
  
  return window.Stripe(STRIPE_PUBLIC_KEY);
};

/**
 * Create a payment method using Stripe Elements
 * @param {Object} stripe - Stripe instance
 * @param {Object} elements - Stripe Elements instance
 * @param {Object} billingDetails - Customer billing details
 * @returns {Promise} Payment method result
 */
export const createPaymentMethod = async (stripe, elements, billingDetails) => {
  try {
    const cardElement = elements.getElement('card');
    
    if (!cardElement) {
      throw new Error("Card element not found");
    }
    
    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: billingDetails
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.paymentMethod;
  } catch (error) {
    console.error("Error creating payment method:", error);
    throw error;
  }
};

/**
 * Process payment (simulated backend call)
 * @param {Object} paymentDetails - Payment details including amount, currency, etc.
 * @returns {Promise} Payment result
 */
export const processPayment = async (paymentDetails) => {
  try {
    // In a real implementation, this would be a call to your backend
    // which would then call Stripe's API to process the payment
    
    // Simulate API call
    console.log("Processing payment:", paymentDetails);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful payment (90% success rate)
    const isSuccessful = Math.random() < 0.9;
    
    if (!isSuccessful) {
      throw new Error("Payment failed. Please try again.");
    }
    
    // Generate a fake order ID
    const orderId = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    return {
      success: true,
      orderId,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    throw error;
  }
};

/**
 * Format price for display
 * @param {Number} amount - Amount in smallest currency unit (e.g., cents)
 * @param {String} currency - Currency code
 * @returns {String} Formatted price
 */
export const formatPrice = (amount, currency = 'INR') => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  });
  
  return formatter.format(amount / 100);
};

/**
 * Convert price to smallest currency unit
 * @param {Number} amount - Amount in currency units (e.g., dollars)
 * @returns {Number} Amount in smallest currency unit (e.g., cents)
 */
export const convertToSmallestUnit = (amount) => {
  return Math.round(amount * 100);
};
