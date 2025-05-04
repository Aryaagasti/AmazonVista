import React, { useEffect, useState } from 'react';
import { initStripe } from '../services/stripeService';

export default function StripeCardElement({ onChange }) {
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [error, setError] = useState(null);

  // Initialize Stripe and Elements
  useEffect(() => {
    if (!window.Stripe) {
      setError('Stripe.js not loaded');
      return;
    }

    try {
      const stripeInstance = initStripe();
      if (!stripeInstance) {
        setError('Failed to initialize Stripe');
        return;
      }

      setStripe(stripeInstance);
      const elementsInstance = stripeInstance.elements();
      setElements(elementsInstance);
    } catch (err) {
      console.error('Error initializing Stripe:', err);
      setError('Failed to initialize payment system');
    }
  }, []);

  // Create and mount the Card Element
  useEffect(() => {
    if (!elements) return;

    try {
      // Create card element with custom style
      const card = elements.create('card', {
        style: {
          base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        }
      });

      // Mount the card element to the DOM
      const cardElementContainer = document.getElementById('card-element');
      if (cardElementContainer) {
        card.mount('#card-element');
        setCardElement(card);

        // Add event listener for changes
        card.on('change', (event) => {
          if (event.error) {
            setError(event.error.message);
          } else {
            setError(null);
          }

          // Pass the event to parent component
          if (onChange) {
            onChange(event);
          }
        });
      }

      // Cleanup function
      return () => {
        if (card) {
          card.unmount();
        }
      };
    } catch (err) {
      console.error('Error creating card element:', err);
      setError('Failed to create payment form');
    }
  }, [elements, onChange]);

  return (
    <div>
      <div id="card-element" className="p-3 border border-gray-300 rounded-md">
        {/* Stripe Card Element will be mounted here */}
      </div>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        * For testing, you can use card number: 4242 4242 4242 4242, any future date, any 3 digits for CVC, and any 5 digits for postal code.
      </div>
    </div>
  );
}
