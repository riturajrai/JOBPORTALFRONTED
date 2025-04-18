import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, MessageSquare } from "lucide-react";
import axios from "axios";

const API_BASE_URL = " http://localhost:5000/api";

const DownArrowIcon = ({ isOpen }) => (
  <svg
    className={`inline ml-1 sm:ml-2 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
    width="12"
    height="12"
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

    if (storedRole !== "candidate") return; // Exit early if not candidate

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
    navigate("/jobs"); // Redirect to candidate login
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

  if (!isAuthenticated || role !== "candidate") return null; // Only render for authenticated candidates

  return (
    <nav className="bg-[#f2f2f2] shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="Home">
          <span className="ml-1 sm:ml-2 text-base sm:text-lg md:text-xl font-bold text-[#008080]">JobLeAaye</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <button
            onClick={handleOpenAppClick}
            className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-600 text-white border border-[#006666] rounded-lg shadow-sm focus:outline-none text-[0.65rem] sm:text-sm md:text-base font-medium"
            aria-label="Open App"
          >
            <span>Open App</span>
          </button>

          <button
            onClick={handleMessagesClick}
            className="relative p-1 sm:p-2 text-[#008080] focus:outline-none hover:text-[#006666]"
            aria-label={`Messages (${unreadMessages} unread)`}
          >
            <MessageSquare size={16} className="sm:h-5 sm:w-5 md:h-6 md:w-6" />
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 bg-[#008080] text-white text-[0.65rem] sm:text-xs rounded-full h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>

          <button
            onClick={handleNotificationsClick}
            className="relative p-1 sm:p-2 text-[#008080] focus:outline-none hover:text-[#006666]"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell size={16} className="sm:h-5 sm:w-5 md:h-6 md:w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#008080] text-white text-[0.65rem] sm:text-xs rounded-full h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            className="lg:hidden p-1 sm:p-2 text-[#008080] focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>

        <ul className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs md:text-sm xl:text-base font-medium">
          <li>
            <Link to="/" className="text-black hover:text-[#008080]">
              Home
            </Link>
          </li>
          <li>
            <Link to="/jobs" className="text-black hover:text-[#008080]">
              Find Jobs
            </Link>
          </li>
          <li>
            <Link to="/salaries" className="text-black hover:text-[#008080]">
              Salaries
            </Link>
          </li>
          <li className="relative">
            <button
              onClick={toggleCandidateSubmenu}
              className="text-black hover:text-[#008080] focus:outline-none flex items-center"
            >
              Candidate Options <DownArrowIcon isOpen={isCandidateSubmenuOpen} />
            </button>
            <ul
              className={`absolute left-0 mt-2 w-40 md:w-48 bg-[#f2f2f2] border border-gray-200 rounded-lg shadow-lg transition-opacity duration-200 ${
                isCandidateSubmenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <li>
                <Link
                  to="/dashboard"
                  onClick={closeAllSubmenus}
                  className="block px-3 md:px-4 py-1.5 md:py-2 text-black hover:bg-gray-200"
                >
                  Your Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/saved-jobs"
                  onClick={closeAllSubmenus}
                  className="block px-3 md:px-4 py-1.5 md:py-2 text-black hover:bg-gray-200"
                >
                  Saved Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/applications"
                  onClick={closeAllSubmenus}
                  className="block px-3 md:px-4 py-1.5 md:py-2 text-black hover:bg-gray-200"
                >
                  Applications
                </Link>
              </li>
              <li>
                <Link
                  to="/resumebuilder"
                  onClick={closeAllSubmenus}
                  className="block px-3 md:px-4 py-1.5 md:py-2 text-black hover:bg-gray-200"
                >
                  Resume Builder
                </Link>
              </li>
            </ul>
          </li>
          <li className="relative">
            <button
              onClick={toggleProfileSubmenu}
              className="text-black hover:text-[#008080] focus:outline-none flex items-center"
            >
              Profile <DownArrowIcon isOpen={isProfileSubmenuOpen} />
            </button>
            <ul
              className={`absolute right-0 mt-2 w-40 md:w-48 bg-[#f2f2f2] border border-gray-200 rounded-lg shadow-lg transition-opacity duration-200 ${
                isProfileSubmenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <li>
                <Link
                  to="/profile"
                  onClick={closeAllSubmenus}
                  className="block px-3 md:px-4 py-1.5 md:py-2 text-black hover:bg-gray-200"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 md:px-4 py-1.5 md:py-2 text-red-600 hover:bg-gray-200"
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <div
        className={`lg:hidden fixed inset-0 bg-gray-900 bg-opacity-60 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-64 sm:w-72 md:w-80 bg-[#f2f2f2] z-50 border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3 sm:p-4 flex justify-between items-center border-b border-gray-200">
          <Link to="/" onClick={() => setIsOpen(false)} aria-label="Home" className="flex items-center">
            <span className="ml-1 sm:ml-2 text-base sm:text-lg md:text-xl font-bold text-[#008080]">JobLeAaye</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 sm:p-2 text-[#008080] focus:outline-none"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="mt-3 sm:mt-4 px-3 sm:px-4">
          <ul className="space-y-2 sm:space-y-3">
            <li>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block px-3 sm:px-4 py-1.5 sm:py-2 text-black rounded-lg text-sm sm:text-base md:text-lg font-medium hover:bg-gray-200"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                onClick={() => setIsOpen(false)}
                className="block px-3 sm:px-4 py-1.5 sm:py-2 text-black rounded-lg text-sm sm:text-base md:text-lg font-medium hover:bg-gray-200"
              >
                Find Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/salaries"
                onClick={() => setIsOpen(false)}
                className="block px-3 sm:px-4 py-1.5 sm:py-2 text-black rounded-lg text-sm sm:text-base md:text-lg font-medium hover:bg-gray-200"
              >
                Salaries
              </Link>
            </li>
            <li>
              <button
                onClick={() => setIsCandidateSubmenuOpen(!isCandidateSubmenuOpen)}
                className="flex justify-between items-center w-full px-3 sm:px-4 py-1.5 sm:py-2 text-black rounded-lg text-sm sm:text-base md:text-lg font-medium hover:bg-gray-200"
              >
                Candidate Options <DownArrowIcon isOpen={isCandidateSubmenuOpen} />
              </button>
              {isCandidateSubmenuOpen && (
                <ul className="ml-4 sm:ml-6 space-y-1 sm:space-y-2 mt-1 sm:mt-2">
                  <li>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 sm:px-4 py-1 sm:py-1.5 text-black rounded-lg text-xs sm:text-sm md:text-base hover:bg-gray-200"
                    >
                      Your Jobs
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/saved-jobs"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 sm:px-4 py-1 sm:py-1.5 text-black rounded-lg text-xs sm:text-sm md:text-base hover:bg-gray-200"
                    >
                      Saved Jobs
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/applications"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 sm:px-4 py-1 sm:py-1.5 text-black rounded-lg text-xs sm:text-sm md:text-base hover:bg-gray-200"
                    >
                      Applications
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/resumebuilder"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 sm:px-4 py-1 sm:py-1.5 text-black rounded-lg text-xs sm:text-sm md:text-base hover:bg-gray-200"
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
                className="block px-3 sm:px-4 py-1.5 sm:py-2 text-black rounded-lg text-sm sm:text-base md:text-lg font-medium hover:bg-gray-200"
              >
                My Profile
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-red-600 rounded-lg text-sm sm:text-base md:text-lg font-medium hover:bg-gray-200"
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