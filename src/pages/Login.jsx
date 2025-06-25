import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ImSpinner8 } from "react-icons/im";
import { api } from "../api/axios";

const Login = ({ isLoggedIn, onLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

    // Clear error when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    setError("");
    setSuccess("");

    if (!formData.username.trim()) {
      setError("Please enter your username or email");
      return false;
    }

    if (!formData.password) {
      setError("Please enter your password");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const formDataEncoded = new URLSearchParams();
      formDataEncoded.append("username", formData.username.trim());
      formDataEncoded.append("password", formData.password);

      const response = await api.post("/auth/token", formDataEncoded, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.data && response.data.access_token) {
        setSuccess("Login successful! Redirecting...");
        
        // Call the onLogin callback with the token
        onLogin(response.data.access_token);
        
        // Clear form
        setFormData({
          username: "",
          password: "",
        });

        // Redirect to home page after successful login
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setError("Authentication failed. No access token received.");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      if (err.response) {
        const status = err.response.status;
        const errorDetail = err.response.data?.detail;
        
        if (status === 401) {
          if (errorDetail) {
            setError(errorDetail);
          } else {
            setError("Invalid username or password. Please check your credentials and try again.");
          }
        } else if (status === 404) {
          setError("Authentication service unavailable. Please try again later.");
        } else if (status === 422) {
          setError("Invalid input format. Please check your username and password.");
        } else if (status >= 500) {
          setError("Server error. Please try again later.");
        } else if (errorDetail) {
          setError(errorDetail);
        } else {
          setError(`Login failed: ${status} ${err.response.statusText}`);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded w-full text-center">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded w-full text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          {/* Username/Email */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username or Email *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your username or email"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
              >
                {showPassword ? (
                  <AiOutlineEye className="h-5 w-5" />
                ) : (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
              isLoading 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <ImSpinner8 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Signup Link */}
          <div className="text-center text-sm text-gray-600 pt-2">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
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