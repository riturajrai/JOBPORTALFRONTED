import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null); // "candidate", "employer", or null
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const usertoken = localStorage.getItem("token");
    const employertoken = localStorage.getItem("employertoken");
    const storedRole = localStorage.getItem("role");

    setIsAuthenticated(!!usertoken || !!employertoken);
    setRole(storedRole);
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setRole(null);
    setIsOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center" aria-label="Home">
          <img className="h-10 w-auto transition-transform hover:scale-105" src={logo} alt="Job Portal Logo" />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center space-x-8 text-sm font-medium">
          <li>
            <Link
              to="/"
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full"
            >
              Find Jobs
            </Link>
          </li>
          <li>
            <Link
              to="/companies"
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full"
            >
              Companies
            </Link>
          </li>
          <li>
            <Link
              to="/salaries"
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full"
            >
              Salaries
            </Link>
          </li>
          {role === "candidate" && (
            <li>
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Dashboard
              </Link>
            </li>
          )}
          {role === "employer" && (
            <>
              <li>
                <Link
                  to="/employer-dashboard"
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/job-form"
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full"
                >
                  Post Job
                </Link>
              </li>
            </>
          )}
          {!role && (
            <li>
              <Link
                to="/employerpage"
                className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Employers/Post Job
              </Link>
            </li>
          )}
          {isAuthenticated ? (
            <li className="relative group">
              <button
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 focus:outline-none transition-colors duration-200"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <User size={20} />
                <span>Profile</span>
              </button>
              <ul className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-lg hidden group-hover:block group-focus-within:block transform transition-all duration-200 ease-in-out">
                <li>
                  <Link
                    to={role === "candidate" ? "/profile" : "/employer-dashboard"}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                  >
                    My Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </li>
          ) : (
            <li>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2 rounded-full hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-gray-700 hover:text-indigo-600 focus:outline-none transition-colors duration-200"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 bg-gray-900 bg-opacity-75 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex justify-between items-center border-b border-gray-200">
          <Link to="/" onClick={() => setIsOpen(false)} aria-label="Home">
            <img className="h-10 w-auto" src={logo} alt="Job Portal Logo" />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-700 hover:text-indigo-600 focus:outline-none transition-colors duration-200"
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
        </div>
        <nav className="mt-6 px-4">
          <ul className="space-y-3">
            <li>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200 text-base font-medium"
              >
                Find Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/companies"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200 text-base font-medium"
              >
                Companies
              </Link>
            </li>
            <li>
              <Link
                to="/salaries"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200 text-base font-medium"
              >
                Salaries
              </Link>
            </li>
            {role === "candidate" && (
              <li>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200 text-base font-medium"
                >
                  Dashboard
                </Link>
              </li>
            )}
            {role === "employer" && (
              <>
                <li>
                  <Link
                    to="/employer-dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200 text-base font-medium"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/job-form"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200 text-base font-medium"
                  >
                    Post Job
                  </Link>
                </li>
              </>
            )}
            {!role && (
              <li>
                <Link
                  to="/employerpage"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200 text-base font-medium"
                >
                  Employers/Post Job
                </Link>
              </li>
            )}
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    to={role === "candidate" ? "/profile" : "/employer-dashboard"}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors duration-200 text-base font-medium"
                  >
                    My Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-200 text-base font-medium"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-center rounded-full hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md text-base font-medium mx-4"
                >
                  Sign Up
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </nav>
  );
};

export default Navbar;