import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const API_BASE_URL = "https://jobporatl.onrender.com/api";

const CandidateSignup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(`${API_BASE_URL}/signup/send-otp`, formData);
      setMessage("OTP sent to your email! Redirecting to verification...");
      localStorage.setItem("signupData", JSON.stringify(formData));
      setTimeout(() => navigate("/verify-otp"), 2000);
    } catch (error) {
      console.error("Error sending OTP:", error.response?.data || error.message);
      setMessage(error.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setLoading(true);
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      localStorage.setItem("token", token);
      axios
        .get(`${API_BASE_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          localStorage.setItem("user_id", res.data.user_id);
          localStorage.setItem("role", res.data.role);
          if (res.data.role === "candidate") {
            setMessage("Google signup successful! Redirecting to dashboard...");
            navigate("/dashboard");
          } else {
            setMessage("This account is not a candidate account.");
            localStorage.clear();
          }
        })
        .catch((err) => {
          setMessage("Failed to fetch user details.");
          localStorage.clear();
        })
        .finally(() => setLoading(false));
    }
  }, [location, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex flex-col items-center justify-center px-4 py-12 font-sans">
      {/* Header */}
      <div className="w-full max-w-lg mb-8 text-center">
        <h1 className="text-1xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          Create Your Jobseeker Account
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-3">
          Begin your journey to find the perfect job today
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm w-full max-w-lg">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-6">
          Get Started
        </h2>
        <p className="text-center text-sm sm:text-base text-gray-600 mb-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#008080] font-medium">
            Log In
          </Link>
        </p>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-md text-sm sm:text-base ${
              message.includes("successful") || message.includes("OTP sent")
                ? "bg-teal-100 text-teal-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full pl-12 p-4 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
              required
              aria-label="Full Name"
            />
          </div>

          {/* Email */}
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
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="w-full pl-12 p-4 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
              required
              aria-label="Email Address"
            />
          </div>

          {/* Phone */}
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full pl-12 p-4 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
              required
              aria-label="Phone Number"
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
              placeholder="Create a strong password"
              className="w-full pl-12 pr-12 p-4 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
              required
              aria-label="Password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
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

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-base sm:text-lg font-medium text-white rounded-md ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#008080]"
            }`}
          >
            {loading ? "Sending OTP..." : "Get Started"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-gray-600 text-sm sm:text-base">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className={`w-full flex items-center justify-center border border-gray-300 py-4 px-4 rounded-md text-base sm:text-lg text-gray-700 bg-white ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FcGoogle className="text-2xl mr-3" /> Sign Up with Google
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm sm:text-base text-gray-600">
        Need assistance? Reach out to{" "}
        <a href="mailto:support@jobportal.com" className="text-[#008080] font-medium">
          support@jobportal.com
        </a>
      </div>
    </div>
  );
};

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  const signupData = JSON.parse(localStorage.getItem("signupData") || "{}");

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setMessage("");
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/signup/verify-otp`, {
        email: signupData.email,
        otp,
      });
      setMessage("Account created successfully! Redirecting to login...");
      localStorage.removeItem("signupData");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Error verifying OTP:", error.response?.data || error.message);
      setMessage(error.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setMessage("");

    try {
      await axios.post(`${API_BASE_URL}/signup/send-otp`, signupData);
      setMessage("New OTP sent! Check your email.");
      setResendTimer(60);
      setCanResend(false);
    } catch (error) {
      console.error("Error resending OTP:", error.response?.data || error.message);
      setMessage(error.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex flex-col items-center justify-center px-4 py-12 font-sans">
      {/* Header */}
      <div className="w-full max-w-lg mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
          Verify Your Account
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-3">
          Complete your signup with a one-time code
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm w-full max-w-lg">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-6">
          Enter OTP
        </h2>
        <p className="text-center text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
          We’ve sent a 6-digit code to{" "}
          <span className="font-medium text-[#008080] break-all">
            {signupData.email || "your email"}
          </span>
          . It expires in <span className="font-medium">10 minutes</span>.
        </p>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-md text-sm sm:text-base ${
              message.includes("successfully") || message.includes("sent")
                ? "bg-teal-100 text-teal-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-5">
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
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full pl-12 p-4 text-sm sm:text-base text-center tracking-widest font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
              required
              aria-label="Enter 6-digit OTP"
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-4 text-base sm:text-lg font-medium text-white rounded-md ${
              loading || otp.length !== 6 ? "bg-gray-400 cursor-not-allowed" : "bg-[#008080]"
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="text-center text-sm sm:text-base mt-6 text-gray-600">
          Didn’t receive the code?{" "}
          <button
            onClick={handleResendOtp}
            disabled={loading || !canResend}
            className={loading || !canResend ? "text-gray-400 cursor-not-allowed" : "text-[#008080] font-medium"}
          >
            {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
          </button>
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm sm:text-base text-gray-600">
        Need assistance? Reach out to{" "}
        <a href="mailto:support@jobportal.com" className="text-[#008080] font-medium">
          support@jobportal.com
        </a>
      </div>
    </div>
  );
};

export { CandidateSignup, VerifyOTP };
