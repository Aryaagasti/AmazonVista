export default function Footer() {
  return (
    <footer className="text-white mt-8">
      {/* Back to top button */}
      <div
        className="bg-[#37475A] text-white text-center py-3 cursor-pointer hover:bg-gray-700"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <p className="font-bold text-sm">Back to top</p>
      </div>

      {/* Main footer content */}
      <div className="bg-[#232F3E] py-8">
        <div className="max-w-screen-xl mx-auto py-4 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-base mb-2">Get to Know Us</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="hover:underline cursor-pointer">About Amazon</li>
                <li className="hover:underline cursor-pointer">Careers</li>
                <li className="hover:underline cursor-pointer">Press Releases</li>
                <li className="hover:underline cursor-pointer">Amazon Science</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-2">Connect with Us</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="hover:underline cursor-pointer">Facebook</li>
                <li className="hover:underline cursor-pointer">Twitter</li>
                <li className="hover:underline cursor-pointer">Instagram</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-2">Make Money with Us</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="hover:underline cursor-pointer">Sell on Amazon</li>
                <li className="hover:underline cursor-pointer">Sell under Amazon Accelerator</li>
                <li className="hover:underline cursor-pointer">Protect and Build Your Brand</li>
                <li className="hover:underline cursor-pointer">Amazon Global Selling</li>
                <li className="hover:underline cursor-pointer">Supply to Amazon</li>
                <li className="hover:underline cursor-pointer">Become an Affiliate</li>
                <li className="hover:underline cursor-pointer">Fulfilment by Amazon</li>
                <li className="hover:underline cursor-pointer">Advertise Your Products</li>
                <li className="hover:underline cursor-pointer">Amazon Pay on Merchants</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-2">Let Us Help You</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="hover:underline cursor-pointer">Your Account</li>
                <li className="hover:underline cursor-pointer">Returns Centre</li>
                <li className="hover:underline cursor-pointer">Recalls and Product Safety Alerts</li>
                <li className="hover:underline cursor-pointer">100% Purchase Protection</li>
                <li className="hover:underline cursor-pointer">Amazon App Download</li>
                <li className="hover:underline cursor-pointer">Help</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="bg-[#232F3E] border-t border-gray-700 pt-6">
        <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center">
          <div className="flex items-center mb-2">
            <img
              src="https://pngimg.com/uploads/amazon/amazon_PNG11.png"
              alt="Amazon"
              className="h-6"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-300 mb-4">
            <button className="border border-gray-600 rounded px-2 py-1 flex items-center space-x-1">
              <span className="material-icons text-xs">language</span>
              <span>English</span>
              <span className="material-icons text-xs">arrow_drop_down</span>
            </button>

            <button className="border border-gray-600 rounded px-2 py-1 flex items-center space-x-1">
              <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png" alt="India" className="h-3 mr-1" />
              <span>India</span>
            </button>
          </div>
        </div>
      </div>

      {/* Services Links */}
      <div className="bg-[#131A22] py-6 text-center text-xs text-gray-400">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center mb-3">
            <div className="text-left">
              <p className="font-bold mb-1">AbeBooks</p>
              <p className="text-[10px] hover:underline cursor-pointer">Books, art</p>
              <p className="text-[10px] hover:underline cursor-pointer">& collectibles</p>
            </div>
            <div className="text-left">
              <p className="font-bold mb-1">Amazon Web Services</p>
              <p className="text-[10px] hover:underline cursor-pointer">Scalable Cloud</p>
              <p className="text-[10px] hover:underline cursor-pointer">Computing Services</p>
            </div>
            <div className="text-left">
              <p className="font-bold mb-1">Audible</p>
              <p className="text-[10px] hover:underline cursor-pointer">Download</p>
              <p className="text-[10px] hover:underline cursor-pointer">Audio Books</p>
            </div>
            <div className="text-left">
              <p className="font-bold mb-1">IMDb</p>
              <p className="text-[10px] hover:underline cursor-pointer">Movies, TV</p>
              <p className="text-[10px] hover:underline cursor-pointer">& Celebrities</p>
            </div>
            <div className="text-left">
              <p className="font-bold mb-1">Shopbop</p>
              <p className="text-[10px] hover:underline cursor-pointer">Designer</p>
              <p className="text-[10px] hover:underline cursor-pointer">Fashion Brands</p>
            </div>
            <div className="text-left">
              <p className="font-bold mb-1">Amazon Business</p>
              <p className="text-[10px] hover:underline cursor-pointer">Everything For</p>
              <p className="text-[10px] hover:underline cursor-pointer">Your Business</p>
            </div>
          </div>

          <div className="mt-6">
            <p>© 1996-{new Date().getFullYear()}, Amazon.com, Inc. or its affiliates</p>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <span className="hover:underline cursor-pointer whitespace-nowrap">Conditions of Use & Sale</span>
              <span className="hover:underline cursor-pointer whitespace-nowrap">Privacy Notice</span>
              <span className="hover:underline cursor-pointer whitespace-nowrap">Interest-Based Ads</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
