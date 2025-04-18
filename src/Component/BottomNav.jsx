import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  BriefcaseIcon,
  UserIcon,
  CogIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

const BottomNav = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "Jobs", path: "/jobs", icon: BriefcaseIcon },
    { name: "Profile", path: "/profile", icon: UserIcon },
    { name: "Services", path: "/salaries", icon: CogIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t-md border-t border-gray-200 flex justify-around items-center py-2 lg:hidden z-50">
      {/* Navigation Items */}
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center p-2 transition-colors ${
              isActive ? "text-[#008080]" : "text-gray-600 hover:text-[#008080]"
            }`
          }
        >
          <item.icon className="w-6 h-6" />
          <span className="text-xs mt-1">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;