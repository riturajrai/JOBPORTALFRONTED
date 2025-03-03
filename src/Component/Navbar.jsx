import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setIsOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
      <img className="w-[50px] rounded-md" src={logo} alt="Logo" />


        {/* 🏆 Desktop Navigation */}
        <ul className="hidden md:flex space-x-6">
          <li><Link to="/" className="hover:text-yellow-500">Home</Link></li>
          <li><Link to="/jobs" className="hover:text-yellow-500">Jobs</Link></li>

          {!isAuthenticated ? (
            <li><Link to="/signup" className="hover:text-yellow-500">Signup</Link></li>
          ) : (
            <>
              <li><Link to="/dashboard" className="hover:text-yellow-500">Dashboard</Link></li>
              <li><Link to="/profile" className="hover:text-yellow-500 flex items-center gap-1"><User size={18} />Profile</Link></li>
              <li><button onClick={handleLogout} className="text-red-500">Logout</button></li>
            </>
          )}
        </ul>

        {/* 🏆 Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* 🏆 Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 text-center p-4">
          <ul>
            <li><Link to="/" className="block py-2" onClick={() => setIsOpen(false)}>Home</Link></li>
            <li><Link to="/jobs" className="block py-2" onClick={() => setIsOpen(false)}>Jobs</Link></li>

            {!isAuthenticated ? (
              <li><Link to="/signup" className="block py-2" onClick={() => setIsOpen(false)}>Signup</Link></li>
            ) : (
              <>
                <li><Link to="/dashboard" className="block py-2" onClick={() => setIsOpen(false)}>Dashboard</Link></li>
                <li><Link to="/profile" className="block py-2 flex justify-center items-center gap-1" onClick={() => setIsOpen(false)}>
                  <User size={18} /> Profile
                </Link></li>
                <li><button onClick={handleLogout} className="block py-2 text-red-500 w-full text-left">Logout</button></li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
