import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const CandidateSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const API_BASE_URL = "https://jobportalapi.up.railway.app/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, formData);
      setMessage(response.data.message);

      // Auto-login after signup
      const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
        identifier: formData.email,
        password: formData.password,
      });

      console.log("Auto-login Response:", loginResponse.data);

      // Store token, user_id, and role
      localStorage.setItem("usertoken", loginResponse.data.token);
      localStorage.setItem("user_id", loginResponse.data.user.id);
      localStorage.setItem("role", loginResponse.data.user.role);

      // Clear form
      setFormData({ name: "", email: "", phone: "", location: "", password: "" });

      // Redirect to home or job listings
      navigate("/");
    } catch (error) {
      console.error("Signup error:", error.response);
      setMessage(error.response?.data?.error || "Signup failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10 mt-[-50px]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Candidate Sign Up</h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">Sign In</Link>{" "}
          |{" "}
          <Link to="/employer/signup" className="text-indigo-600 hover:underline font-medium">
            Employer Signup
          </Link>
        </p>

        {message && (
          <p
            className={`text-center text-sm mb-4 font-medium ${
              message.includes("successful") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter your location"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="w-full flex items-center justify-center border py-2 rounded-md hover:bg-gray-50 transition-all">
            <FcGoogle className="text-xl mr-2" />
            Google
          </button>
          <button className="w-full flex items-center justify-center border py-2 rounded-md hover:bg-gray-50 transition-all">
            <FaGithub className="text-xl mr-2" />
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateSignup;