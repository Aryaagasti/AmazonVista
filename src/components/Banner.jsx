import { useState, useEffect } from 'react';

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const banners = [
    {
      id: 1,
      image: "https://m.media-amazon.com/images/I/71U-Q+N7PXL._SX3000_.jpg",
      alt: "Great Summer Sale"
    },
    {
      id: 2,
      image: "https://m.media-amazon.com/images/I/61zAjw4bqPL._SX3000_.jpg",
      alt: "Electronics Sale"
    },
    {
      id: 3,
      image: "https://m.media-amazon.com/images/I/71Ie3JXGfVL._SX3000_.jpg",
      alt: "Home & Kitchen Sale"
    },
    {
      id: 4,
      image: "https://m.media-amazon.com/images/I/61CiqVTRBEL._SX3000_.jpg",
      alt: "Fashion Sale"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full">
            <img 
              src={banner.image} 
              alt={banner.alt} 
              className="w-full object-cover h-[300px] md:h-auto"
            />
          </div>
        ))}
      </div>
      
      {/* Navigation Arrows */}
      <button 
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full p-2"
        onClick={goToPrevSlide}
      >
        <span className="material-icons text-gray-800">chevron_left</span>
      </button>
      
      <button 
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full p-2"
        onClick={goToNextSlide}
      >
        <span className="material-icons text-gray-800">chevron_right</span>
      </button>
      
      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              currentSlide === index ? 'bg-amazon_blue' : 'bg-gray-300'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-100 to-transparent"></div>
    </div>
  );
}
