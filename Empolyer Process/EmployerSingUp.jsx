import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaBuilding,
  FaIndustry,
  FaUsers,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const EmployerSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    industry: "",
    companySize: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [industrySuggestions, setIndustrySuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isIndustryFocused, setIsIndustryFocused] = useState(false);
  const industryInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchIndustries = async () => {
      if (!formData.industry.trim()) {
        setIndustrySuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get(
          `https://jobporatl.onrender.com/api/industry?name=${encodeURIComponent(formData.industry)}`
        );

        const filteredSuggestions = (response.data.data || [])
          .filter((suggestion) =>
            suggestion.name.toLowerCase().includes(formData.industry.toLowerCase())
          )
          .sort((a, b) => {
            const aMatches = (a.name.toLowerCase().match(new RegExp(formData.industry.toLowerCase(), "g")) || []).length;
            const bMatches = (b.name.toLowerCase().match(new RegExp(formData.industry.toLowerCase(), "g")) || []).length;
            return bMatches - aMatches || a.name.length - b.name.length;
          });

        setIndustrySuggestions(filteredSuggestions);
      } catch (error) {
        console.error("Error fetching industries:", error);
        setMessage("Error fetching industries");
        setIndustrySuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchIndustries, 300);
    return () => clearTimeout(debounce);
  }, [formData.industry]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSelectIndustry = (industry) => {
    setFormData((prev) => ({ ...prev, industry }));
    setIndustrySuggestions([]);
    setIsIndustryFocused(false);
    if (industryInputRef.current) {
      industryInputRef.current.blur();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(
        "https://jobporatl.onrender.com/api/employer/signup",
        formData
      );
      setMessage(response.data.message || "Signup successful! Redirecting...");
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        companyName: "",
        industry: "",
        companySize: "",
      });
      setTimeout(() => navigate("/employer-login"), 1500);
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone) => /^[6-9]\d{9}$/.test(phone);
  const isFormValid = () =>
    formData.name &&
    isEmailValid(formData.email) &&
    isPhoneValid(formData.phone) &&
    formData.password.length >= 6 &&
    formData.companyName &&
    formData.industry &&
    formData.companySize;

  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans pt-16">
      {/* Navbar */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-[#008080]">
              JobLeaaye
            </Link>
            <Link
              to="/employer-login"
              className="bg-[#008080] text-white px-4 py-2 rounded-md text-sm sm:text-base font-medium"
              aria-label="Go to employer login"
            >
              Log In
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-4 py-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="w-full max-w-lg mb-8 text-center">
          <h1 className="text-1xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Create Your Employer Account
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-3">
            Start hiring top talent today
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 w-full">
          {/* Form Section */}
          <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-6">
              Get Started
            </h2>
            <p className="text-center text-sm sm:text-base text-gray-600 mb-6">
              Already have an account?{" "}
              <Link to="/employer-login" className="text-[#008080] font-medium">
                Log In
              </Link>
            </p>

            {message && (
              <div
                className={`mb-6 px-4 py-3 rounded-md text-sm sm:text-base ${
                  message.includes("successful")
                    ? "bg-teal-100 text-teal-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <InputWithIcon
                Icon={FaUser}
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                aria-label="Full Name"
              />

              {/* Email */}
              <InputWithIcon
                Icon={FaEnvelope}
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                aria-label="Email Address"
              />

              {/* Phone */}
              <InputWithIcon
                Icon={FaPhone}
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                aria-label="Phone Number"
              />

              {/* Password */}
              <div className="relative">
                <FaLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-[#008080]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
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
                  {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                </button>
              </div>

              {/* Company Name */}
              <InputWithIcon
                Icon={FaBuilding}
                type="text"
                name="companyName"
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={handleChange}
                aria-label="Company Name"
              />

              {/* Industry */}
              <div className="relative">
                <FaIndustry className="absolute top-1/2 left-4 transform -translate-y-1/2 text-[#008080]" />
                <input
                  ref={industryInputRef}
                  type="text"
                  name="industry"
                  placeholder="Enter your industry"
                  value={formData.industry}
                  onChange={handleChange}
                  onFocus={() => setIsIndustryFocused(true)}
                  onBlur={() => setTimeout(() => setIsIndustryFocused(false), 200)}
                  className="w-full pl-12 p-4 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  required
                  aria-label="Industry"
                />
                {isIndustryFocused && isSearching && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-sm mt-1 p-2 z-10">
                    <p className="text-sm text-gray-600">Searching...</p>
                  </div>
                )}
                {isIndustryFocused && industrySuggestions.length > 0 && !isSearching && (
                  <div
                    className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-sm mt-1 z-10 max-h-48 overflow-y-auto"
                    role="listbox"
                  >
                    {industrySuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="px-4 py-2 text-sm text-gray-700 cursor-pointer flex justify-between items-center"
                        onClick={() => handleSelectIndustry(suggestion.name)}
                        role="option"
                        aria-selected="false"
                      >
                        <span>{suggestion.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectIndustry(suggestion.name);
                          }}
                          className="text-[#008080] text-xs font-medium"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Company Size */}
              <div className="relative">
                <FaUsers className="absolute top-1/2 left-4 transform -translate-y-1/2 text-[#008080]" />
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  className="w-full pl-12 p-4 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  required
                  aria-label="Company Size"
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="201-500">201-500 Employees</option>
                  <option value="501+">501+ Employees</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className={`w-full py-4 text-base sm:text-lg font-semibold text-white rounded-md ${
                  loading || !isFormValid() ? "bg-gray-400 cursor-not-allowed" : "bg-[#008080]"
                }`}
              >
                {loading ? "Signing Up..." : "Get Started"}
              </button>
            </form>

            <p className="text-sm sm:text-base text-gray-600 text-center mt-6">
              By signing up, you agree to JobLeaaye’s{" "}
              <a href="/terms" className="text-[#008080] font-medium">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-[#008080] font-medium">
                Privacy Policy
              </a>.
            </p>
          </div>

          {/* Promotional */}
          <div className="w-full max-w-lg mt-6 lg:mt-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center lg:text-left">
              Hire the Best Talent Directly
            </h2>
            <p className="text-base sm:text-lg text-gray-600 text-center lg:text-left">
              Post jobs, connect with top candidates, and build your dream team with JobLeaaye. 🌟
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable input field with icon
const InputWithIcon = ({ Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-[#008080]" />
    <input
      {...props}
      className="w-full pl-12 p-4 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
      required
    />
  </div>
);

export default EmployerSignup;