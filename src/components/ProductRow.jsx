import { useRef } from 'react';
import ProductCard from './ProductCard';

export default function ProductRow({ title, products, viewAll }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      rowRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white mb-4 p-4 rounded shadow">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">{title}</h2>
        {viewAll && (
          <a href="#" className="text-amazon_teal hover:underline text-sm">
            See all deals
          </a>
        )}
      </div>
      
      <div className="relative">
        {products.length > 4 && (
          <>
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow p-1 hover:bg-gray-100"
            >
              <span className="material-icons">chevron_left</span>
            </button>
            
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow p-1 hover:bg-gray-100"
            >
              <span className="material-icons">chevron_right</span>
            </button>
          </>
        )}
        
        <div 
          ref={rowRef}
          className="flex overflow-x-auto scrollbar-hide gap-4 py-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map(product => (
            <div key={product.id} className="min-w-[200px] md:min-w-[220px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
