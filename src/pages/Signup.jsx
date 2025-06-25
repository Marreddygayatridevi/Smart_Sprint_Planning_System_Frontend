import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ImSpinner8 } from "react-icons/im";
import { api } from "../api/axios";

const Signup = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    team: "",
    tickets_solved: "",
  });

  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [status, setStatus] = useState({
    error: "",
    success: "",
    isLoading: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn) navigate("/");
    else fetchTeams();
  }, [isLoggedIn, navigate]);

  const fetchTeams = useCallback(async () => {
    setLoadingTeams(true);
    try {
      const res = await api.get("/team/");
      setTeams(res.data || []);
    } catch {
      setTeams([
        { id: 1, name: "alpha" },
        { id: 2, name: "beta" },
        { id: 3, name: "delta" },
        { id: 4, name: "gamma" },
        { id: 5, name: "developer" },
        { id: 6, name: "designer" },
      ]);
    } finally {
      setLoadingTeams(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus({ ...status, error: "", success: "" });
  };

  const validate = () => {
    const {
      username,
      email,
      password,
      confirmPassword,
      role,
      team,
      tickets_solved,
    } = formData;

    if (!username.trim() || username.length < 2)
      return "Full name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email address.";
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password)
    )
      return "Password must be 8+ characters with uppercase, lowercase, and number.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!role.trim()) return "Please enter your role.";
    if (!team.trim()) return "Please select a team.";
    if (!teams.some((t) => t.name.toLowerCase() === team.toLowerCase()))
      return `Team "${team}" does not exist.`;
    if (!/^\d+$/.test(tickets_solved))
      return "Tickets solved must be a valid number.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) return setStatus({ ...status, error: errorMsg });

    setStatus({ error: "", success: "", isLoading: true });

    try {
      await api.post("/auth/signup", {
        username: formData.username.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        is_active: true,
        role: formData.role.trim(),
        team: formData.team.trim(),
        tickets_solved: Number(formData.tickets_solved),
      });

      setStatus({
        success: "Account created! Redirecting...",
        error: "",
        isLoading: false,
      });
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        team: "",
        tickets_solved: "",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((e) => e.msg).join(". ")
          : detail?.msg || "Signup failed. Try again.";

      setStatus({ ...status, error: message, isLoading: false });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Create a New Account
        </h2>

        {status.success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-center">
            {status.success}
          </div>
        )}
        {status.error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
            {status.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter full name"
            disabled={status.isLoading}
          />

          <Input
            label="Email Address *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            disabled={status.isLoading}
          />

          <PasswordInput
            label="Password *"
            name="password"
            value={formData.password}
            onChange={handleChange}
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
            disabled={status.isLoading}
          />
          <p className="text-xs text-gray-500">
            Must be 8+ characters with uppercase, lowercase, and numbers
          </p>

          <PasswordInput
            label="Confirm Password *"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            show={showConfirmPassword}
            toggle={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={status.isLoading}
          />

          <Input
            label="Role *"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g. developer, designer"
            disabled={status.isLoading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team *
            </label>
            <select
              name="team"
              value={formData.team}
              onChange={handleChange}
              disabled={loadingTeams || status.isLoading || teams.length === 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                {loadingTeams
                  ? "Loading teams..."
                  : teams.length === 0
                  ? "No teams available"
                  : "Select a team"}
              </option>
              {teams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {!loadingTeams && teams.length === 0
                ? "Contact admin to add teams."
                : "Choose an existing team."}
            </p>
          </div>

          <Input
            label="Tickets Solved *"
            name="tickets_solved"
            type="number"
            value={formData.tickets_solved}
            onChange={handleChange}
            placeholder="0"
            min="0"
            disabled={status.isLoading}
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={status.isLoading || loadingTeams || teams.length === 0}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                status.isLoading || teams.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {status.isLoading ? (
                <span className="flex items-center justify-center">
                  <ImSpinner8 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Creating Account...
                </span>
              ) : teams.length === 0 ? (
                "No Teams Available"
              ) : (
                "Sign Up"
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600 pt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, name, type = "text", ...props }) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  show,
  toggle,
  disabled,
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <div className="relative">
      <input
        id={name}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
      >
        {show ? (
          <AiOutlineEye className="h-5 w-5" />
        ) : (
          <AiOutlineEyeInvisible className="h-5 w-5" />
        )}
      </button>
    </div>
  </div>
);

export default Signup;
