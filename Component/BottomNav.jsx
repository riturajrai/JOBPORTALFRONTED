import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  BriefcaseIcon,
  UserIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

const BottomNav = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      // Hide when scrolling down, show when scrolling up
      if (currentScroll > lastScroll && currentScroll > 50) {
        setIsVisible(false);
      } else if (currentScroll < lastScroll) {
        setIsVisible(true);
      }

      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  const navItems = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "Jobs", path: "/jobs", icon: BriefcaseIcon },
    { name: "Profile", path: "/profile", icon: UserIcon },
    { name: "Services", path: "/salaries", icon: CogIcon },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden flex justify-around items-center py-3 px-4 
        bg-gradient-to-r from-white to-teal-100 border-t border-teal-200 shadow-md transition-transform duration-300 rounded-t-xl 
        ${isVisible ? "translate-y-0" : "translate-y-full"}`}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center text-sm font-medium ${
              isActive ? "text-teal-600" : "text-gray-500"
            }`
          }
        >
          <item.icon className="w-6 h-6" />
          <span className="mt-1">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
