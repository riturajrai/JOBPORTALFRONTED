import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App"; // Adjust path as needed

const EmployerLogin = ({ setRole }) => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const isEmail = formData.identifier.includes("@");
    const isPhone = /^\d{10}$/.test(formData.identifier);
    if (!isEmail && !isPhone) {
      setMessage("Please enter a valid email or 10-digit phone number");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(
        "https://jobporatl.onrender.com/api/employer/login",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (!response.data.employertoken || !response.data.user_id || !response.data.employer) {
        throw new Error("Invalid response from server");
      }

      if (response.data.employer.role === "employer") {
        // Use AuthContext login
        login(response.data.employertoken, response.data.employer.role);
        setRole(response.data.employer.role); // For backward compatibility
        navigate("/");
      } else {
        setMessage("This account is not registered as an employer.");
        localStorage.clear();
      }
    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        "Login failed. Please check your credentials or try again later."
      );
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => formData.identifier && formData.password;

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm fixed w-full top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-[#008080]">
            JobLeaaye
          </Link>
          <Link
            to="/employer-signup"
            className="bg-[#008080] text-white px-4 py-2 rounded-md text-sm sm:text-base font-medium"
            aria-label="Go to employer signup"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center mt-20 px-4 py-12">
        {/* Header */}
        <div className="w-full max-w-lg mb-8 text-center">
          <h1 className="text-1xl mt-[-50px] sm:text-2xl md:text-3xl font-bold text-gray-900">
            Log In to Your Employer Account
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-3">
            Manage your hiring process today
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-6">
            Log In
          </h2>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-6">
            New here?{" "}
            <Link to="/employer-signup" className="text-[#008080] font-medium">
              Create an Account
            </Link>
          </p>

          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-md text-sm sm:text-base text-center ${
                message.includes("successful")
                  ? "bg-teal-100 text-teal-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Identifier */}
            <div className="relative">
              <svg
                className="absolute top-1/2 left-4 transform -translate-y-1/2 w-5 h-5 text-[#008080]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter email or phone"
                className="w-full pl-12 p-4 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
                required
                aria-label="Email or Phone"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <svg
                className="absolute top-1/2 left-4 transform -translate-y-1/2 w-5 h-5 text-[#008080]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-2 2-2 2-2-.9-2-2zm0 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-2-2-2-2zm0 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-2-2-2-2z"
                />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 p-4 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
                required
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Options */}
            <div className="flex justify-between items-center text-sm sm:text-base text-gray-600">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#008080] border-gray-300 rounded focus:ring-[#008080]"
                  aria-label="Remember me"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[#008080] font-medium">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className={`w-full py-4 text-base sm:text-lg font-semibold text-white rounded-md ${
                loading || !isFormValid() ? "bg-gray-400 cursor-not-allowed" : "bg-[#008080]"
              }`}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-sm sm:text-base text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link to="/employer-signup" className="text-[#008080] font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div
        className="w-full max-w-7xl mx-auto px-4 mb-16 flex flex-col lg:flex-row gap-6 text-gray-700"
        role="region"
        aria-label="Employer benefits"
      >
        {/* Info Box 1 */}
        <div className="flex-1 bg-white shadow-sm rounded-lg p-6 text-center border border-gray-200">
          <svg
            className="w-8 h-8 mx-auto text-[#008080] mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Create Job Listings</h3>
          <p className="text-sm sm:text-base text-gray-600">
            Post job openings effortlessly to attract top talent for your company.
          </p>
        </div>

        {/* Info Box 2 */}
        <div className="flex-1 bg-white shadow-sm rounded-lg p-6 text-center border border-gray-200">
          <svg
            className="w-8 h-8 mx-auto text-[#008080] mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Streamline Applications</h3>
          <p className="text-sm sm:text-base text-gray-600">
            Review applications, shortlist candidates, and schedule interviews with ease.
          </p>
        </div>

        {/* Info Box 3 */}
        <div className="flex-1 bg-white shadow-sm rounded-lg p-6 text-center border border-gray-200">
          <svg
            className="w-8 h-8 mx-auto text-[#008080] mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Organize Hiring</h3>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your hiring process efficiently with your employer dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployerLogin;