import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const EmployerLogin = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Clear localStorage before login attempt
    localStorage.clear();

    // Basic validation for identifier (email or phone)
    const isEmail = formData.identifier.includes("@");
    const isPhone = /^\d{10}$/.test(formData.identifier); // Check for 10-digit phone number
    if (!isEmail && !isPhone) {
      setMessage("Please enter a valid email or 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting login with:", formData); // Debug log

      const response = await axios.post(
        "https://jobportalapi.up.railway.app/api/employer/login",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Response from server:", response.data); // Debug log

      // Validate response structure
      if (!response.data.employertoken || !response.data.user_id || !response.data.employer) {
        throw new Error("Invalid response from server");
      }

      // Store token, user_id, and role
      localStorage.setItem("employertoken", response.data.employertoken);
      localStorage.setItem("user_id", response.data.user_id);
      localStorage.setItem("role", response.data.employer.role);

      console.log("Stored in localStorage:", {
        employertoken: response.data.employertoken,
        user_id: response.data.user_id,
        role: response.data.employer.role,
      }); // Debug log

      // Check role and redirect
      if (response.data.employer.role === "employer") {
        navigate("/employer-dashboard");
      } else {
        setMessage("This account is not registered as an employer. Use candidate login if applicable.");
        localStorage.clear();
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message); // Debug log
      setMessage(
        error.response?.data?.error ||
          "Login failed. Please check your credentials or ensure this is an employer account."
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12 mt-[-70px]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Employer Sign In
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          New to Indeed?{" "}
          <Link
            to="/employer-signup"
            className="text-indigo-600 hover:underline font-medium"
          >
            Create an Account
          </Link>{" "}
          |{" "}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Candidate Login
          </Link>
        </p>

        {message && (
          <p className="text-center text-sm mb-4 text-red-600 font-medium">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email or Phone Number
            </label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your email or phone"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
              required
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="remember" className="ml-2 text-gray-600">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-indigo-600 hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-md hover:bg-indigo-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                  />
                </svg>
                Logging In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-all text-gray-700 font-medium">
            <FcGoogle className="text-xl mr-2" />
            Google
          </button>
          <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-all text-gray-700 font-medium">
            <FaGithub className="text-xl mr-2" />
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployerLogin;