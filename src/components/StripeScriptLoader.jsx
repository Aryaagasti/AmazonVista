import React, { useEffect, useState } from 'react';

export default function StripeScriptLoader({ children }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Stripe is already loaded
    if (window.Stripe) {
      setLoaded(true);
      return;
    }

    // Check if script is already in the DOM
    if (document.querySelector('#stripe-js')) {
      const checkStripeInterval = setInterval(() => {
        if (window.Stripe) {
          setLoaded(true);
          clearInterval(checkStripeInterval);
        }
      }, 100);
      
      return () => clearInterval(checkStripeInterval);
    }

    // Load Stripe.js script
    const script = document.createElement('script');
    script.id = 'stripe-js';
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    
    script.onload = () => {
      console.log('Stripe.js loaded successfully');
      setLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Stripe.js');
      setError('Failed to load payment processing. Please try again later.');
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Don't remove the script on unmount as it might be needed by other components
    };
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon_teal"></div>
      </div>
    );
  }

  return children;
}
