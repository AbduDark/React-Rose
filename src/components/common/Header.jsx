import { useState, useEffect } from "react";
import { FaUser, FaSignOutAlt, FaSun, FaMoon } from "react-icons/fa";
import { FaCircleUser } from "react-icons/fa6";
import { MdSubscriptions } from "react-icons/md";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { IoNotificationsSharp } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../assets/images/Rose_Logo.png";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import i18n from "../../i18n/index.js";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useTranslation("common");
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActiveLink = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getActiveLinkClasses = (isActive) => {
    return isActive
      ? "px-4 py-2 text-primary dark:text-primary font-[600] text-base border-b-2 border-primary bg-primary/10 dark:bg-primary/20 rounded-t-lg transition-all duration-300"
      : "px-4 py-2 text-gray-700 dark:text-gray-200 font-[500] text-base hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-t-lg transition-all duration-300";
  };

  const getActiveMobileLinkClasses = (isActive) => {
    return isActive
      ? "block px-4 py-3 text-primary font-semibold border-l-4 border-primary bg-primary/10 dark:bg-primary/20 rounded-r-lg transition-all duration-300"
      : "block px-4 py-3 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-r-lg transition-all duration-300";
  };

  const handleLogout = async () => {
    try {
      logout();
      setIsMenuOpen(false);
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      dir="ltr"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "shadow-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg py-2"
          : "shadow-md bg-white dark:bg-gray-900 backdrop-blur-md py-3"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              className="flex items-center space-x-2 group"
              onClick={() => setIsMenuOpen(false)}
              to="/"
            >
              <img 
                src={Logo} 
                alt="Logo" 
                className={`transition-all duration-300 ${
                  isScrolled ? "h-9" : "h-11"
                }`} 
              />
              <h4 className={`font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transition-all duration-300 ${
                isScrolled ? "text-lg" : "text-xl"
              }`}>
                Rose
              </h4>
            </Link>
          </div>

          <div className="flex items-center md:hidden space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {isDark ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>
            
            <button
              className="rounded-lg p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiMenuAlt3 className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="hidden md:flex md:items-center md:flex-1 md:justify-between md:ml-10">
            <ul
              className={`flex space-x-2 ${
                i18n.language === "ar" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <li>
                <Link
                  className={getActiveLinkClasses(isActiveLink("/"))}
                  to="/"
                >
                  {t("header.home")}
                </Link>
              </li>
              <li>
                <Link
                  className={getActiveLinkClasses(isActiveLink("/courses"))}
                  to="/courses"
                >
                  {t("header.courses")}
                </Link>
              </li>
              <li>
                <Link
                  className={getActiveLinkClasses(isActiveLink("/about"))}
                  to="/about"
                >
                  {t("header.about")}
                </Link>
              </li>
              <li>
                <Link
                  className={getActiveLinkClasses(isActiveLink("/contact"))}
                  to="/contact"
                >
                  {t("header.contact")}
                </Link>
              </li>
            </ul>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <FaSun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <FaMoon className="w-5 h-5 text-indigo-600" />
                )}
              </button>

              <LanguageSwitcher />

              <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-200 relative">
                {user ? (
                  <>
                    <Link
                      to="/notifications"
                      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                      title={t("header.notifications")}
                    >
                      <IoNotificationsSharp className="w-6 h-6" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    >
                      <FaCircleUser className="w-6 h-6" />
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth/login"
                    className="bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105"
                  >
                    {t("header.login")}
                  </Link>
                )}
                {isUserDropdownOpen && (
                  <ul className="dropdown-menu absolute right-0 top-12 mt-2 w-56 bg-white dark:bg-gray-800 shadow-xl rounded-lg py-2 z-50 border border-gray-200 dark:border-gray-700 animate-slide-down">
                    <li>
                      <h4 className="px-4 py-2 text-sm font-bold text-center text-gray-700 dark:text-gray-200">
                        {user?.name || "User"}
                      </h4>
                    </li>
                    <li>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    </li>
                    {user?.role === "student" ? (
                      <>
                        <li>
                          <Link
                            to="/student-dashboard/subscriptions"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <MdSubscriptions className="mr-3" />
                            {t("header.subscriptions")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/student-dashboard/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <FaUser className="mr-3" />
                            {t("header.profile")}
                          </Link>
                        </li>
                      </>
                    ) : (
                      <li>
                        <Link
                          to="/admin/overview"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <MdSubscriptions className="mr-3" />
                          {t("header.dashboard")}
                        </Link>
                      </li>
                    )}
                    <li>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <FaSignOutAlt className="mr-3" />
                        {t("header.logout")}
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden animate-slide-down">
            <div className="px-2 pt-4 pb-3 space-y-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg mt-4 shadow-lg backdrop-blur-md">
              <Link
                to="/"
                className={getActiveMobileLinkClasses(isActiveLink("/"))}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("header.home")}
              </Link>
              <Link
                to="/courses"
                className={getActiveMobileLinkClasses(isActiveLink("/courses"))}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("header.courses")}
              </Link>
              <Link
                to="/about"
                className={getActiveMobileLinkClasses(isActiveLink("/about"))}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("header.about")}
              </Link>
              <Link
                to="/contact"
                className={getActiveMobileLinkClasses(isActiveLink("/contact"))}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("header.contact")}
              </Link>

              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <LanguageSwitcher className="w-full" />
              </div>

              {user ? (
                <div className="px-4 py-3 space-y-2 border-t border-gray-200 dark:border-gray-700">
                  {user.role === "student" ? (
                    <>
                      <Link
                        to="/student-dashboard/profile"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("header.profile")}
                      </Link>
                      <Link
                        to="/student-dashboard/subscriptions"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("header.subscriptions")}
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/admin/overview"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("header.dashboard")}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    {t("header.logout")}
                  </button>
                </div>
              ) : (
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/auth/login"
                    className="block w-full text-center bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("header.login")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
