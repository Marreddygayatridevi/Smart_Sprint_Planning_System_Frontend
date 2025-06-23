import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Kanban,
  UserCheck,
  FileText,
  AlertTriangle,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { api } from "../api/axios.js";

const Home = ({ authToken, isLoggedIn }) => {
  const navigate = useNavigate();
  const [employeeCount, setEmployeeCount] = useState(0);
  const [teamsCount, setTeamsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployeeCount = async () => {
    try {
      if (!authToken) {
        setLoading(false);
        return;
      }

      const response = await api.get("/auth/users", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setEmployeeCount(response.data.length);
      setError(null);
    } catch (err) {
      setError("Unable to load employee count");
      console.error("Error fetching employee count:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamsCount = async () => {
    try {
      if (!authToken) return;

      const response = await api.get("/team/", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setTeamsCount(response.data.length);
    } catch (err) {
      console.error("Error fetching teams count:", err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    await Promise.all([fetchEmployeeCount(), fetchTeamsCount()]);
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn && authToken) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, authToken]);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Welcome to the Smart Sprint Planner!
          </h1>
        </div>

        {isLoggedIn ? (
          <>
            {/* Dashboard Analytics */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Employee Count Card */}
              <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 rounded-2xl p-4">
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">Team Members</h3>
                      <p className="text-indigo-100 text-sm">Active employees</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-12 w-20 bg-white/20 rounded-xl"></div>
                      </div>
                    ) : error ? (
                      <p className="text-3xl font-bold text-red-200">--</p>
                    ) : (
                      <p className="text-5xl font-bold">{employeeCount}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Teams Count Card */}
              <div className="bg-teal-600 rounded-3xl p-8 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 rounded-2xl p-4">
                      <UsersRound className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">Active Teams</h3>
                      <p className="text-teal-100 text-sm">Total teams</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-12 w-20 bg-white/20 rounded-xl"></div>
                      </div>
                    ) : (
                      <p className="text-5xl font-bold">{teamsCount}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Navigation Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {[
                {
                  icon: Kanban,
                  title: "Kanban Board",
                  description: "Visualize your workflow with intuitive drag-and-drop task management",
                  path: "/kanban",
                  colors: "from-blue-500 to-blue-600",
                },
                {
                  icon: UserCheck,
                  title: "Assign Tickets",
                  description: "Efficiently distribute tasks and manage team workloads",
                  path: "/assign-tickets",
                  colors: "from-purple-500 to-purple-600",
                },
                {
                  icon: FileText,
                  title: "AI Reports",
                  description: "Generate comprehensive sprint insights with AI-powered analytics",
                  path: "/report-generation",
                  colors: "from-emerald-500 to-emerald-600",
                },
                {
                  icon: AlertTriangle,
                  title: "Risk Analysis",
                  description: "Proactive risk detection with intelligent monitoring systems",
                  path: "/risk-analysis",
                  colors: "from-red-500 to-pink-600",
                },
              ].map(({ icon: Icon, title, description, path, colors }, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-3xl p-8 shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(path)}
                >
                  <div className="text-center">
                    <div className={`bg-gradient-to-br ${colors} rounded-2xl p-6 w-fit mx-auto mb-6`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-3xl p-12 shadow-xl max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Get Started Today</h2>
                <p className="text-gray-600 leading-relaxed">
                  Welcome to Smart Sprint Planner, please log in to access the full features of our platform
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-10 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;