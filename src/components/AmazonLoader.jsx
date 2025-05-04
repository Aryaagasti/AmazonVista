import React, { useState, useEffect } from 'react';
import '../styles/AmazonLoader.css';

export default function AmazonLoader({ isLoading }) {
  const [showLoader, setShowLoader] = useState(isLoading);
  
  // Add a slight delay before hiding the loader to ensure animations complete
  useEffect(() => {
    if (isLoading) {
      setShowLoader(true);
    } else {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 600); // Delay hiding to allow exit animation
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  if (!showLoader) return null;
  
  return (
    <div className={`amazon-loader-container ${isLoading ? 'fade-in' : 'fade-out'}`}>
      <div className="amazon-loader-content">
        <div className="amazon-smile">
          <div className="smile-curve"></div>
          <div className="arrow-head"></div>
        </div>
        
        <div className="package-container">
          <div className="package">
            <div className="package-top">
              <div className="amazon-tape"></div>
            </div>
            <div className="package-body"></div>
          </div>
        </div>
        
        <div className="loading-text">
          <span>L</span>
          <span>o</span>
          <span>a</span>
          <span>d</span>
          <span>i</span>
          <span>n</span>
          <span>g</span>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </div>
  );
}
