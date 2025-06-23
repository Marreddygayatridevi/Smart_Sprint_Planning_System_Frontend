import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Zap, 
  Kanban, 
  ClipboardCheck, 
  FileBarChart, 
  AlertTriangle, 
  LogOut, 
  Menu 
} from "lucide-react";

const Navbar = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout(); // Call the logout function passed from parent
    navigate("/"); 
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getLinkClasses = (path) => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2";
    if (isActive(path)) {
      return `${baseClasses} bg-blue-100 text-blue-700 shadow-sm`;
    }
    return `${baseClasses} text-gray-600 hover:text-blue-600 hover:bg-blue-50`;
  };

  if (!isLoggedIn) {
    return null; // Don't show navbar when not logged in
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
          >
            <Zap className="w-8 h-8 text-blue-600" />
            <span>Smart Sprint Planner</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/kanban" className={getLinkClasses("/kanban")}>
              <Kanban className="w-4 h-4" />
              Kanban Board
            </Link>

            <Link to="/assign-tickets" className={getLinkClasses("/assign-tickets")}>
              <ClipboardCheck className="w-4 h-4" />
              Assign Tickets
            </Link>

            <Link to="/report-generation" className={getLinkClasses("/report-generation")}>
              <FileBarChart className="w-4 h-4" />
              Report Generation
            </Link>

            <Link to="/risk-analysis" className={getLinkClasses("/risk-analysis")}>
              <AlertTriangle className="w-4 h-4" />
              Risk Analysis
            </Link>

            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden border-t border-gray-200 pt-4 pb-3 space-y-1">
          <Link
            to="/kanban"
            className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            Kanban Board
          </Link>
          <Link
            to="/assign-tickets"
            className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            Assign Tickets
          </Link>
          <Link
            to="/report-generation"
            className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            Report Generation
          </Link>
          <Link
            to="/risk-analysis"
            className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            Risk Analysis
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
