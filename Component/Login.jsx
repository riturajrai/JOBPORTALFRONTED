import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../App"; // Adjust path as needed

const API_BASE_URL = "https://jobporatl.onrender.com/api";

const apiService = {
  login: (data) => axios.post(`${API_BASE_URL}/login`, data, { withCredentials: true }),
  forgotPassword: (email) => axios.post(`${API_BASE_URL}/forgot-password`, { email }, { withCredentials: true }),
  verifyOtp: (data) => axios.post(`${API_BASE_URL}/verify-otp`, data, { withCredentials: true }),
  resetPassword: (data) => axios.post(`${API_BASE_URL}/reset-password`, data, { withCredentials: true }),
  getUser: (token) => axios.get(`${API_BASE_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true
  }),
};

const CandidateLogin = ({ setRole }) => {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [forgotData, setForgotData] = useState({ email: "", otp: "", newPassword: "" });
  const [uiState, setUiState] = useState({
    loading: false,
    message: "",
    isForgotOpen: false,
    isOtpSent: false,
    isOtpVerified: false,
    showPassword: false,
    resendCooldown: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value.trim() }));
    setUiState((prev) => ({ ...prev, message: "" }));
  }, []);

  const handleForgotChange = useCallback((e) => {
    setForgotData((prev) => ({ ...prev, [e.target.name]: e.target.value.trim() }));
    setUiState((prev) => ({ ...prev, message: "" }));
  }, []);

  const handleOtpChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setForgotData((prev) => ({ ...prev, otp: value }));
    setUiState((prev) => ({ ...prev, message: "" }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState((prev) => ({ ...prev, loading: true, message: "" }));

    try {
      const response = await apiService.login(formData);
      const { user, token, user_id } = response.data;

      if (!user?.role) throw new Error("Invalid response from server");

      if (user.role === "candidate") {
        login(token, user.role); // Use AuthContext login
        setRole(user.role); // For backward compatibility
        navigate(location.state?.from?.pathname || "/jobs");
      } else {
        setUiState((prev) => ({
          ...prev,
          message: "Please use employer login for employer accounts.",
        }));
        localStorage.clear();
      }
    } catch (error) {
      setUiState((prev) => ({
        ...prev,
        message: error.response?.data?.error || "Login failed. Please try again.",
      }));
      localStorage.clear();
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(forgotData.email)) {
      setUiState((prev) => ({ ...prev, message: "Please enter a valid email" }));
      return;
    }
    setUiState((prev) => ({ ...prev, loading: true, message: "" }));
    try {
      await apiService.forgotPassword(forgotData.email);
      setUiState((prev) => ({
        ...prev,
        message: "OTP sent to your email!",
        isOtpSent: true,
        resendCooldown: 60,
      }));
      startResendCooldown();
    } catch (error) {
      setUiState((prev) => ({
        ...prev,
        message: error.response?.data?.error || "Error sending OTP",
        isOtpSent: false,
      }));
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setUiState((prev) => ({ ...prev, loading: true, message: "" }));
    try {
      await apiService.verifyOtp({ email: forgotData.email, otp: forgotData.otp });
      setUiState((prev) => ({ ...prev, message: "OTP verified!", isOtpVerified: true }));
    } catch (error) {
      setUiState((prev) => ({ ...prev, message: error.response?.data?.error || "Invalid OTP" }));
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (forgotData.newPassword.length < 6) {
      setUiState((prev) => ({ ...prev, message: "Password must be at least 6 characters" }));
      return;
    }

    setUiState((prev) => ({ ...prev, loading: true, message: "" }));
    try {
      await apiService.resetPassword({ email: forgotData.email, newPassword: forgotData.newPassword });
      setUiState((prev) => ({ ...prev, message: "Password reset successful! Redirecting..." }));
      setTimeout(() => {
        setUiState({
          loading: false,
          message: "",
          isForgotOpen: false,
          isOtpSent: false,
          isOtpVerified: false,
          showPassword: false,
          resendCooldown: 0,
        });
        setForgotData({ email: "", otp: "", newPassword: "" });
        navigate("/login");
      }, 2000);
    } catch (error) {
      setUiState((prev) => ({
        ...prev,
        message: error.response?.data?.error || "Failed to reset password",
      }));
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleGoogleLogin = () => {
    setUiState((prev) => ({ ...prev, loading: true }));
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const startResendCooldown = useCallback(() => {
    const timer = setInterval(() => {
      setUiState((prev) => {
        if (prev.resendCooldown <= 1) {
          clearInterval(timer);
          return { ...prev, resendCooldown: 0 };
        }
        return { ...prev, resendCooldown: prev.resendCooldown - 1 };
      });
    }, 1000);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    if (!token) return;

    localStorage.setItem("token", token);
    setUiState((prev) => ({ ...prev, loading: true }));

    apiService
      .getUser(token)
      .then((res) => {
        const { user_id, role } = res.data;
        login(token, role); // Use AuthContext login
        setRole(role); // For backward compatibility
        if (role === "candidate") {
          setUiState((prev) => ({ ...prev, message: "Google login successful!" }));
          navigate(location.state?.from?.pathname || "/");
        } else {
          setUiState((prev) => ({ ...prev, message: "Please use employer login" }));
          localStorage.clear();
        }
      })
      .catch((err) => {
        setUiState((prev) => ({
          ...prev,
          message: err.response?.data?.error || "Google login failed",
        }));
        localStorage.clear();
      })
      .finally(() => setUiState((prev) => ({ ...prev, loading: false })));
  }, [location, navigate, login, setRole]);

  const togglePasswordVisibility = () => {
    setUiState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const isFormValid = () => formData.identifier && formData.password;
  const isForgotFormValid = () => forgotData.email;
  const isOtpValid = () => forgotData.otp.length === 6;
  const isNewPasswordValid = () => forgotData.newPassword.length >= 6;

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex flex-col items-center justify-center px-4 py-12 font-sans">
      {/* Header */}
      <div className="w-full max-w-lg mb-8 text-center">
        <h1 className="text-1xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          Log In to Your Jobseeker Account
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-3">
          Access your job opportunities today
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm w-full max-w-lg">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-6">
          Log In
        </h2>
        <p className="text-center text-sm sm:text-base text-gray-600 mb-6">
          New here?{" "}
          <Link to="/signup" className="text-[#008080] font-medium">
            Create an Account
          </Link>
        </p>

        {uiState.message && !uiState.isForgotOpen && (
          <div
            className={`mb-6 px-4 py-3 rounded-md text-sm sm:text-base ${
              uiState.message.includes("successful")
                ? "bg-teal-100 text-teal-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {uiState.message}
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
              type={uiState.showPassword ? "text" : "password"}
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
              onClick={togglePasswordVisibility}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500"
              aria-label={uiState.showPassword ? "Hide password" : "Show password"}
            >
              {uiState.showPassword ? (
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
          <div className="flex items-center justify-between text-sm sm:text-base">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-[#008080] border-gray-300 rounded focus:ring-[#008080]"
              />
              <label htmlFor="remember" className="ml-2 text-gray-600">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={() => setUiState((prev) => ({ ...prev, isForgotOpen: true }))}
              className="text-[#008080] font-medium"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uiState.loading || !isFormValid()}
            className={`w-full py-4 text-base sm:text-lg font-semibold text-white rounded-md ${
              uiState.loading || !isFormValid() ? "bg-gray-400 cursor-not-allowed" : "bg-[#008080]"
            }`}
          >
            {uiState.loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        {/* Divider and Google Login */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-gray-600 text-sm sm:text-base">Or continue with</span>
          </div>
        </div>
        <button
          onClick={handleGoogleLogin}
          disabled={uiState.loading}
          className={`w-full flex items-center justify-center border border-gray-300 py-4 px-4 rounded-md text-base sm:text-lg text-gray-700 bg-white ${
            uiState.loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FcGoogle className="text-2xl mr-3" /> Continue with Google
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm sm:text-base text-gray-600">
        Need assistance? Reach out to{" "}
        <a href="mailto:support@jobportal.com" className="text-[#008080] font-medium">
          support@jobportal.com
        </a>
      </div>

      {/* Forgot Password Modal */}
      {uiState.isForgotOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20" aria-modal="true">
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm w-full max-w-md sm:max-w-lg">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center">
                {uiState.isOtpVerified ? "Set New Password" : uiState.isOtpSent ? "Enter OTP" : "Reset Your Password"}
              </h2>
              <p className="text-center text-sm sm:text-base text-gray-600 mt-3">
                {uiState.isOtpVerified
                  ? "Choose a new password to secure your account."
                  : uiState.isOtpSent
                  ? `Enter the 6-digit code sent to ${forgotData.email || "your email"}.`
                  : "Enter your email to receive a reset code."}
              </p>
            </div>
            {uiState.message && (
              <div
                className={`mb-6 px-4 py-3 rounded-md text-sm sm:text-base ${
                  uiState.message.includes("sent") || uiState.message.includes("verified") || uiState.message.includes("successful")
                    ? "bg-teal-100 text-teal-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {uiState.message}
              </div>
            )}

            {!uiState.isOtpSent ? (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
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
                    value={forgotData.email}
                    onChange={handleForgotChange}
                    placeholder="Enter your email"
                    className="w-full pl-12 p-4 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    required
                    aria-label="Email Address"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uiState.loading || !isForgotFormValid()}
                  className={`w-full py-4 text-base sm:text-lg font-semibold text-white rounded-md ${
                    uiState.loading || !isForgotFormValid() ? "bg-gray-400 cursor-not-allowed" : "bg-[#008080]"
                  }`}
                >
                  {uiState.loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : !uiState.isOtpVerified ? (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
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
                    value={forgotData.otp}
                    onChange={handleOtpChange}
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-12 p-4 text-sm sm:text-base text-center tracking-widest font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    maxLength="6"
                    required
                    aria-label="6-digit OTP"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uiState.loading || !isOtpValid()}
                  className={`w-full py-4 text-base sm:text-lg font-semibold text-white rounded-md ${
                    uiState.loading || !isOtpValid() ? "bg-gray-400 cursor-not-allowed" : "bg-[#008080]"
                  }`}
                >
                  {uiState.loading ? "Verifying..." : "Verify OTP"}
                </button>
                <p className="text-center text-sm sm:text-base text-gray-600">
                  Didn’t receive the code?{" "}
                  {uiState.resendCooldown > 0 ? (
                    <span className="text-gray-400">Resend in {uiState.resendCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleForgotSubmit}
                      className="text-[#008080] font-medium"
                    >
                      Resend OTP
                    </button>
                  )}
                </p>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
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
                    type={uiState.showPassword ? "text" : "password"}
                    name="newPassword"
                    value={forgotData.newPassword}
                    onChange={handleForgotChange}
                    placeholder="Enter new password"
                    className="w-full pl-12 pr-12 p-4 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    required
                    aria-label="New Password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500"
                    aria-label={uiState.showPassword ? "Hide password" : "Show password"}
                  >
                    {uiState.showPassword ? (
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
                  disabled={uiState.loading || !isNewPasswordValid()}
                  className={`w-full py-4 text-base sm:text-lg font-semibold text-white rounded-md ${
                    uiState.loading || !isNewPasswordValid() ? "bg-gray-400 cursor-not-allowed" : "bg-[#008080]"
                  }`}
                >
                  {uiState.loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
            <div className="mt-6 text-center">
              <button
                onClick={() =>
                  setUiState((prev) => ({
                    ...prev,
                    isForgotOpen: false,
                    isOtpSent: false,
                    isOtpVerified: false,
                  }))
                }
                className="text-[#008080] font-medium text-sm sm:text-base"
              >
                Back to Log In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateLogin;