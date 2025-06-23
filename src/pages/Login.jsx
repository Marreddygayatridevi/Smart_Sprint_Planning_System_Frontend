import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";

const Login = ({ isLoggedIn, onLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [navigate, isLoggedIn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.username.trim()) {
      setError("Please enter your username");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const formDataEncoded = new URLSearchParams();
      formDataEncoded.append("username", formData.username);
      formDataEncoded.append("password", formData.password);

      const response = await api.post("/auth/token", formDataEncoded, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.data && response.data.access_token) {
        // Call the onLogin callback with the token
        onLogin(response.data.access_token);
        // Redirect to home page after successful login
        navigate("/");
      } else {
        setError("Authentication failed. No access token received.");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid username or password. Please try again.");
        } else if (err.response.status === 404) {
          setError("Authentication service unavailable. Please try again later.");
        } else if (err.response.data && err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          setError(`Login failed: ${err.response.status} ${err.response.statusText}`);
        }
      } else if (err.request) {
        setError("Unable to connect to the server. Please check your internet connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Login to Your Account
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded w-full text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded text-white font-semibold ${
              isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;