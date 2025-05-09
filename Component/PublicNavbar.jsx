import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logo } from "../assets/Icons";
const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    try {
      navigate(path);
      setIsMenuOpen(false);
      setError(null);
    } catch (err) {
      console.error(`Navigation error to ${path}:`, err);
      setError(`Failed to navigate to ${path}. Please try again.`);
      window.location.href = path;
    }
  };

  const handleButtonClick = (path) => {
    console.log(`Button clicked for: ${path}`);
    handleNavigation(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl xl:max-w-[80rem] 2xl:max-w-[96rem]">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
  <img 
    src={logo} 
    alt="Logo" 
    className="w-10 h-10 brightness-110 contrast-110 hover:scale-105 transition-all duration-300"
  />
  {/* <span className="text-xl font-bold text-teal-600 hidden sm:block">YourBrand</span> */}
</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3 md:gap-4 lg:gap-6 xl:gap-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-[10px] md:text-[10px] lg:text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/jobs"
              className="text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-[10px] md:text-[10px] lg:text-sm font-medium transition-colors"
            >
              Browse Jobs
            </Link>
            <Link
              to="/salaries"
              className="text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-[10px] md:text-[10px] lg:text-sm font-medium transition-colors"
            >
              Salaries
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-[10px] md:text-[10px] lg:text-sm font-medium transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-[10px] md:text-[10px] lg:text-sm font-medium transition-colors"
            >
              Contact Us
            </Link>
            <Link
              to="/blog"
              className="text-gray-700 hover:text-teal-600 px-2 md:px-3 py-2 text-[10px] md:text-[10px] lg:text-sm font-medium transition-colors"
            >
              Blog
            </Link>
            <button
              onClick={() => handleButtonClick("/signup")}
              onMouseDown={() => console.log("Candidate Signup button mousedown")}
              className="px-2 md:px-3 py-1 md:py-1 bg-teal-600 text-white rounded-md text-[10px] md:text-[10px] lg:text-sm font-medium hover:bg-teal-700 transition-colors"
              aria-label="Candidate signup"
            >
              Candidate Signup
            </button>
            <button
              onClick={() => handleButtonClick("/employer-signup")}
              onMouseDown={() => console.log("Employer Signup button mousedown")}
              className="px-2 md:px-3 py-1 md:py-1 bg-orange-500 text-white rounded-md text-[10px] md:text-[10px] lg:text-sm font-medium hover:bg-orange-600 transition-colors"
              aria-label="Employer signup"
            >
              Employer Signup
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/jobs"
              className="block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Jobs
            </Link>
            <Link
              to="/salaries"
              className="block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Salaries
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
            <Link
              to="/blog"
              className="block px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <button
              onClick={() => handleButtonClick("/signup")}
              onMouseDown={() => console.log("Mobile Candidate Signup button mousedown")}
              className="block w-full text-left px-3 py-2 text-xs sm:text-sm font-medium text-teal-600 hover:bg-gray-50 transition-colors"
              aria-label="Candidate signup"
            >
              Candidate Signup
            </button>
            <button
              onClick={() => handleButtonClick("/employer-signup")}
              onMouseDown={() => console.log("Mobile Employer Signup button mousedown")}
              className="block wフル text-left px-3 py-2 text-xs sm:text-sm font-medium text-orange-500 hover:bg-gray-50 transition-colors"
              aria-label="Employer signup"
            >
              Employer Signup
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 text-red-700 p-2 md:p-3 rounded-md text-[10px] md:text-[10px] sm:text-sm flex items-center gap-2 max-w-[10rem] sm:max-w-xs md:max-w-sm">
          <svg className="w-3 h-3 sm:w-5 sm:h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800 text-[10px] md:text-[10px] sm:text-xs"
            aria-label="Close error"
          >
            Close
          </button>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;