import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, MessageSquare } from "lucide-react";
import axios from "axios";

const API_BASE_URL = "https://jobporatl.onrender.com/api";

const DownArrowIcon = ({ isOpen }) => (
  <svg
    className={`inline ml-1 w-3 h-3 sm:ml-2 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isCandidateSubmenuOpen, setIsCandidateSubmenuOpen] = useState(false);
  const [isProfileSubmenuOpen, setIsProfileSubmenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const userId = localStorage.getItem("user_id");

    setIsAuthenticated(!!storedToken);
    setRole(storedRole || null);

    if (storedRole !== "candidate") return;

    const fetchUnreadCount = async () => {
      if (!storedToken || !userId) {
        setUnreadCount(0);
        setUnreadMessages(0);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${storedToken}`, "Content-Type": "application/json" };
        const notificationResponse = await axios.get(`${API_BASE_URL}/notifications/${userId}/unread`, { headers });
        setUnreadCount(notificationResponse.data.unreadCount || 0);

        const messagesResponse = await axios.get(`${API_BASE_URL}/messages/${userId}/unread`, { headers });
        setUnreadMessages(messagesResponse.data.unreadMessages || 0);
      } catch (error) {
        console.error("Fetch Unread Count Error:", error.response?.data || error.message);
        setUnreadCount(0);
        setUnreadMessages(0);
      }
    };

    fetchUnreadCount();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    setIsAuthenticated(false);
    setRole(null);
    setIsOpen(false);
    setUnreadCount(0);
    setUnreadMessages(0);
    navigate("/jobs");
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
    setIsOpen(false);
  };

  const handleMessagesClick = () => {
    navigate("/messages");
    setIsOpen(false);
  };

  const handleOpenAppClick = () => {
    window.location.href = "https://your-app-link.com";
    setIsOpen(false);
  };

  const toggleCandidateSubmenu = () => setIsCandidateSubmenuOpen(!isCandidateSubmenuOpen);
  const toggleProfileSubmenu = () => setIsProfileSubmenuOpen(!isProfileSubmenuOpen);

  const closeAllSubmenus = () => {
    setIsCandidateSubmenuOpen(false);
    setIsProfileSubmenuOpen(false);
  };

  if (!isAuthenticated || role !== "candidate") return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-full sm:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="Home">
          <span className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 tracking-tight">JobLeAaye</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={handleOpenAppClick}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gray-900 text-white rounded-lg shadow-sm focus:outline-none text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors"
            aria-label="Open App"
          >
            <span>Open App</span>
          </button>

          <button
            onClick={handleMessagesClick}
            className="relative p-1.5 text-gray-700 focus:outline-none hover:text-gray-900 transition-colors"
            aria-label={`Messages (${unreadMessages} unread)`}
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 bg-gray-900 text-white text-[0.6rem] rounded-full h-3.5 w-3.5 flex items-center justify-center">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </button>

          <button
            onClick={handleNotificationsClick}
            className="relative p-1.5 text-gray-700 focus:outline-none hover:text-gray-900 transition-colors"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-gray-900 text-white text-[0.6rem] rounded-full h-3.5 w-3.5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            className="lg:hidden p-1.5 text-gray-700 focus:outline-none hover:text-gray-900 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>

        <ul className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium">
          <li>
            <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link to="/jobs" className="text-gray-700 hover:text-gray-900 transition-colors">
              Find Jobs
            </Link>
          </li>
          <li>
            <Link to="/salaries" className="text-gray-700 hover:text-gray-900 transition-colors">
              Salaries
            </Link>
          </li>
          <li className="relative">
            <button
              onClick={toggleCandidateSubmenu}
              className="text-gray-700 hover:text-gray-900 focus:outline-none flex items-center transition-colors"
            >
              Candidate Options <DownArrowIcon isOpen={isCandidateSubmenuOpen} />
            </button>
            <ul
              className={`absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg transition-all duration-200 ${
                isCandidateSubmenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              <li>
                <Link
                  to="/dashboard"
                  onClick={closeAllSubmenus}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Your Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/saved-jobs"
                  onClick={closeAllSubmenus}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Saved Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/applications"
                  onClick={closeAllSubmenus}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Applications
                </Link>
              </li>
              <li>
                <Link
                  to="/resumebuilder"
                  onClick={closeAllSubmenus}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Resume Builder
                </Link>
              </li>
            </ul>
          </li>
          <li className="relative">
            <button
              onClick={toggleProfileSubmenu}
              className="text-gray-700 hover:text-gray-900 focus:outline-none flex items-center transition-colors"
            >
              Profile <DownArrowIcon isOpen={isProfileSubmenuOpen} />
            </button>
            <ul
              className={`absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg transition-all duration-200 ${
                isProfileSubmenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              <li>
                <Link
                  to="/profile"
                  onClick={closeAllSubmenus}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      {/* Mobile menu backdrop */}
      <div
        className={`lg:hidden fixed inset-0 bg-gray-900/50 bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile menu */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-64 sm:w-72 bg-white z-50 border-r border-gray-100 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <Link to="/" onClick={() => setIsOpen(false)} aria-label="Home" className="flex items-center">
            <span className="text-lg font-semibold text-gray-900">JobLeAaye</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-gray-700 focus:outline-none hover:text-gray-900 transition-colors"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="mt-4 px-4">
          <ul className="space-y-3">
            <li>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Find Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/salaries"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Salaries
              </Link>
            </li>
            <li>
              <button
                onClick={() => setIsCandidateSubmenuOpen(!isCandidateSubmenuOpen)}
                className="flex justify-between items-center w-full px-4 py-2 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Candidate Options <DownArrowIcon isOpen={isCandidateSubmenuOpen} />
              </button>
              {isCandidateSubmenuOpen && (
                <ul className="ml-4 space-y-2 mt-2">
                  <li>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-1.5 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      Your Jobs
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/saved-jobs"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-1.5 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      Saved Jobs
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/applications"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-1.5 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      Applications
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/resumebuilder"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-1.5 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      Resume Builder
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
              >
                My Profile
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-600 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </nav>
  );
};

export default Navbar;
