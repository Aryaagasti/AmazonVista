# Amazon Clone with AI Features

This project is an Amazon clone with two unique AI-powered features:

## 1. Gemini AI Product Recommendations

The Gemini AI Recommender analyzes your cart items and suggests complementary products that might interest you. This feature uses Google's Gemini API to generate personalized recommendations based on what's already in your cart.

### How it works:
- When you add items to your cart, the system sends the product information to Gemini AI
- Gemini analyzes the products and suggests complementary items
- The recommendations appear at the bottom of your cart page
- Each recommendation includes a product name, description, reason for recommendation, and price range

## 2. Voice Command Shopping

The Voice-to-Cart feature allows you to add or remove items from your cart using voice commands. This feature uses the Web Speech API to recognize your voice and execute shopping commands.

### How to use:
1. Click the microphone icon in the navigation bar or on the cart page
2. When the microphone turns red, speak your command
3. Use commands like:
   - "Add iPhone to cart"
   - "Buy headphones"
   - "Remove shoes"
4. A confirmation dialog will appear before executing your command

## Setup Instructions

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file in the root directory with your Gemini API key:
   ```
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the development server with `npm start`

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## Browser Compatibility

The Voice Command feature requires a browser that supports the Web Speech API. This includes:
- Chrome (desktop and mobile)
- Edge
- Safari (iOS 14.5+ and macOS)
- Firefox (with flag enabled)

## Technologies Used

- React
- Tailwind CSS
- Google Gemini API
- Web Speech API
