import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";

const Signup = ({ isLoggedIn, onSignup }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    team: "",
    tickets_solved: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    } else {
      fetchTeams();
    }
  }, [navigate, isLoggedIn]);

  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      const response = await api.get('/team/');
      setTeams(response.data || []);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      setTeams([
        { id: 1, name: 'developer' },
        { id: 2, name: 'designer' },
        { id: 3, name: 'qa' },
        { id: 4, name: 'manager' }
      ]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const ensureTeamExists = async (teamName) => {
    try {
      const teamExists = teams.some(team => team.name.toLowerCase() === teamName.toLowerCase());
      if (teamExists) {
        return true;
      }
      
      try {
        await api.get(`/team/${teamName}`);
        return true;
      } catch (error) {
        if (error.response?.status === 404) {
          // Team doesn't exist, create it
          try {
            await api.post('/team/', { name: teamName });
            console.log(`Team '${teamName}' created successfully`);
            return true;
          } catch (createError) {
            console.error('Failed to create team:', createError);
            throw new Error(`Failed to create team: ${createError.response?.data?.detail || createError.message}`);
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error with team:', error);
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.username.trim()) return setError("Please enter your full name"), false;
    if (!formData.email.trim()) return setError("Please enter your email address"), false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return setError("Invalid email"), false;

    if (!formData.password) return setError("Please enter a password"), false;
    if (formData.password.length < 8) return setError("Password must be at least 8 characters"), false;
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match"), false;

    if (!formData.role.trim()) return setError("Please enter your role"), false;
    if (!formData.team.trim()) return setError("Please select a team"), false;
    if (!/^\d+$/.test(formData.tickets_solved)) return setError("Tickets solved must be a number"), false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await ensureTeamExists(formData.team);

      await api.post("/auth/signup", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        is_active: true,
        role: formData.role,
        team: formData.team,
        tickets_solved: Number(formData.tickets_solved),
      });

      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      const errorDetail = err.response?.data?.detail;
      if (typeof errorDetail === "string") setError(errorDetail);
      else if (Array.isArray(errorDetail)) setError(errorDetail.map((e) => e.msg).join(". "));
      else if (errorDetail?.msg) setError(errorDetail.msg);
      else if (err.message === "Network Error") setError("Network error. Check your connection.");
      else setError("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow flex flex-col items-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Create a New Account
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded w-full text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Create a password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm password"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              id="role"
              name="role"
              type="text"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. developer, designer, qa"
            />
          </div>

          <div>
            <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
              Team
            </label>
            <select
              id="team"
              name="team"
              value={formData.team}
              onChange={handleChange}
              required
              disabled={loadingTeams}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                {loadingTeams ? "Loading teams..." : "Select a team"}
              </option>
              {teams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
            {loadingTeams && (
              <p className="text-sm text-gray-500 mt-1">Loading available teams...</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Don't see your team? It will be created automatically when you sign up.
            </p>
          </div>

          <div>
            <label htmlFor="tickets_solved" className="block text-sm font-medium text-gray-700 mb-1">
              Tickets Solved
            </label>
            <input
              id="tickets_solved"
              name="tickets_solved"
              type="number"
              value={formData.tickets_solved}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              min="0"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || loadingTeams}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                isLoading || loadingTeams ? "bg-green-500" : "bg-green-600 hover:bg-green-700"
              } transition-colors disabled:cursor-not-allowed`}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600 pt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;