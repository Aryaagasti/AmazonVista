import React, { useState } from 'react';

export default function PriceGraph({ productId, currentPrice }) {
  const [timeRange, setTimeRange] = useState('6m'); // Default to 6 months
  
  // Generate random price history data
  const generatePriceHistory = () => {
    const today = new Date();
    const priceHistory = [];
    const volatility = 0.15; // Price volatility factor
    
    // Determine number of data points based on time range
    let dataPoints = 0;
    switch (timeRange) {
      case '1m':
        dataPoints = 30;
        break;
      case '3m':
        dataPoints = 90;
        break;
      case '6m':
        dataPoints = 180;
        break;
      case '1y':
        dataPoints = 365;
        break;
      default:
        dataPoints = 180;
    }
    
    // Generate price points
    for (let i = dataPoints; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Generate a random price fluctuation around the current price
      // Make sure the current price is the last point
      let price;
      if (i === 0) {
        price = currentPrice;
      } else {
        // Random fluctuation between -15% and +15% of current price
        const fluctuation = (Math.random() * 2 - 1) * volatility;
        price = Math.round(currentPrice * (1 + fluctuation));
        
        // Ensure price doesn't go below 50% of current price
        price = Math.max(price, currentPrice * 0.5);
      }
      
      priceHistory.push({
        date: date.toISOString().split('T')[0],
        price
      });
    }
    
    return priceHistory;
  };
  
  // Get price history based on product ID and time range
  const priceHistory = generatePriceHistory();
  
  // Find min and max prices for scaling
  const minPrice = Math.min(...priceHistory.map(p => p.price));
  const maxPrice = Math.max(...priceHistory.map(p => p.price));
  const priceRange = maxPrice - minPrice;
  
  // Calculate if current price is a good deal
  const isGoodDeal = () => {
    const avgPrice = priceHistory.reduce((sum, p) => sum + p.price, 0) / priceHistory.length;
    return currentPrice < avgPrice * 0.95; // If current price is at least 5% below average
  };
  
  // Get price trend
  const getPriceTrend = () => {
    // Look at last 30 days or less
    const recentPrices = priceHistory.slice(-Math.min(30, priceHistory.length));
    
    if (recentPrices.length < 2) return 'stable';
    
    const firstPrice = recentPrices[0].price;
    const lastPrice = recentPrices[recentPrices.length - 2].price; // Second to last (before current)
    
    const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    if (percentChange > 5) return 'rising';
    if (percentChange < -5) return 'falling';
    return 'stable';
  };
  
  // Get trend message and color
  const getTrendInfo = () => {
    const trend = getPriceTrend();
    
    switch (trend) {
      case 'rising':
        return {
          message: 'Price has been rising recently',
          color: 'text-red-600',
          icon: 'trending_up'
        };
      case 'falling':
        return {
          message: 'Price has been falling recently',
          color: 'text-green-600',
          icon: 'trending_down'
        };
      default:
        return {
          message: 'Price has been stable recently',
          color: 'text-blue-600',
          icon: 'trending_flat'
        };
    }
  };
  
  const trendInfo = getTrendInfo();
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center">
          <span className="material-icons mr-2">show_chart</span>
          Price History
        </h3>
        
        <div className="flex space-x-2">
          <button 
            className={`px-2 py-1 text-xs rounded ${timeRange === '1m' ? 'bg-amazon_teal text-white' : 'bg-gray-100'}`}
            onClick={() => setTimeRange('1m')}
          >
            1M
          </button>
          <button 
            className={`px-2 py-1 text-xs rounded ${timeRange === '3m' ? 'bg-amazon_teal text-white' : 'bg-gray-100'}`}
            onClick={() => setTimeRange('3m')}
          >
            3M
          </button>
          <button 
            className={`px-2 py-1 text-xs rounded ${timeRange === '6m' ? 'bg-amazon_teal text-white' : 'bg-gray-100'}`}
            onClick={() => setTimeRange('6m')}
          >
            6M
          </button>
          <button 
            className={`px-2 py-1 text-xs rounded ${timeRange === '1y' ? 'bg-amazon_teal text-white' : 'bg-gray-100'}`}
            onClick={() => setTimeRange('1y')}
          >
            1Y
          </button>
        </div>
      </div>
      
      {/* Price Graph */}
      <div className="relative h-40 mb-4">
        <div className="absolute inset-0 flex items-end">
          {priceHistory.map((point, index) => {
            // Calculate height percentage based on price
            const heightPercentage = priceRange === 0 
              ? 50 
              : ((point.price - minPrice) / priceRange) * 100;
            
            // Only show every nth label to avoid overcrowding
            const showLabel = index % Math.ceil(priceHistory.length / 6) === 0;
            
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center"
                title={`${point.date}: ₹${point.price.toLocaleString()}`}
              >
                <div 
                  className={`w-1 ${index === priceHistory.length - 1 ? 'bg-amazon_red' : 'bg-amazon_teal'}`}
                  style={{ height: `${heightPercentage}%`, minHeight: '1px' }}
                ></div>
                {showLabel && (
                  <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                    {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Price labels on Y-axis */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <div>₹{maxPrice.toLocaleString()}</div>
          <div>₹{Math.round((maxPrice + minPrice) / 2).toLocaleString()}</div>
          <div>₹{minPrice.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Price Analysis */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <span className={`material-icons mr-2 ${trendInfo.color}`}>{trendInfo.icon}</span>
          <span className={`text-sm ${trendInfo.color}`}>{trendInfo.message}</span>
        </div>
        
        {isGoodDeal() && (
          <div className="flex items-center text-green-600">
            <span className="material-icons mr-2">thumb_up</span>
            <span className="text-sm font-medium">Good deal! Current price is lower than average.</span>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-1">
          Highest: ₹{maxPrice.toLocaleString()} • Lowest: ₹{minPrice.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
