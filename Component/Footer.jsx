import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import ReactGA from "react-ga";
import { motion } from "framer-motion";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState("");
  const [jobCategories, setJobCategories] = useState([]);
  const navigate = useNavigate();

  const API_BASE_URL = "https://jobporatl.onrender.com/api";
  // Fetch job categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setJobCategories(response.data.slice(0, 6));
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setJobCategories(["Technology", "Finance", "Healthcare", "Marketing", "Education", "Design"]);
      }
    };
    fetchCategories();
  }, []);

  // Handle newsletter subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setSubscribeStatus("Enter a valid email address.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/newsletter`, { email });
      setSubscribeStatus("Subscribed successfully!");
      setEmail("");
      ReactGA.event({ category: "Newsletter", action: "Subscribe", label: email });
      setTimeout(() => setSubscribeStatus(""), 4000);
    } catch (err) {
      setSubscribeStatus("Subscription failed. Try again.");
      console.error("Subscription error", err);
    }
  };

  // Track social media clicks
  const handleSocialClick = (platform) => {
    ReactGA.event({ category: "Social Media", action: "Click", label: platform });
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <footer className="py-16 font-inter text-gray-200 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-4xl font-bold text-white mb-5 tracking-tight flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500">
                Job
              </span>
              <span className="text-white">LeAaye</span>
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed max-w-md">
              Empowering careers and businesses with seamless job matching. Your journey to success starts here.
            </p>
            <div className="mt-8 flex space-x-6">
              {[
                { Icon: FaFacebookF, link: "https://facebook.com/jobleaye", label: "Facebook" },
                { Icon: FaTwitter, link: "https://twitter.com/jobleaye", label: "Twitter" },
                { Icon: FaLinkedinIn, link: "https://linkedin.com/company/jobleaye", label: "LinkedIn" },
                { Icon: FaInstagram, link: "https://instagram.com/jobleaye", label: "Instagram" },
              ].map(({ Icon, link, label }) => (
                <motion.a
                  key={label}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick(label)}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-300"
                >
                  <Icon className="w-7 h-7" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Job Categories */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-5 tracking-wide border-b border-teal-500/30 pb-2">
              Job Categories
            </h3>
            <ul className="space-y-4 text-sm">
              {jobCategories.map((category) => (
                <motion.li
                  key={category}
                  whileHover={{ x: 8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <FaArrowRight className="w-4 h-4 text-teal-400" />
                  <Link
                    to={`/jobs?category=${category.toLowerCase()}`}
                    className="text-gray-200"
                    onClick={() => ReactGA.event({ category: "Footer", action: "Category Click", label: category })}
                  >
                    {category}
                  </Link>
                </motion.li>
              ))}
              <li>
                <Link
                  to="/jobs"
                  className="text-teal-400 font-medium"
                  onClick={() => ReactGA.event({ category: "Footer", action: "View All Click" })}
                >
                  See All Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-5 tracking-wide border-b border-teal-500/30 pb-2">
              Explore
            </h3>
            <ul className="space-y-4 text-sm">
              {[
                { label: "Home", path: "/" },
                { label: "Find Jobs", path: "/jobs" },
                { label: "Companies", path: "/companies" },
                { label: "Career Tips", path: "/career-advice" },
                { label: "Post Jobs", path: "/employers" },
              ].map(({ label, path }) => (
                <motion.li
                  key={label}
                  whileHover={{ x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={path}
                    className="text-gray-200 flex items-center gap-2"
                    onClick={() => ReactGA.event({ category: "Footer", action: "Nav Click", label })}
                  >
                    <FaArrowRight className="w-4 h-4 text-teal-400" />
                    {label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-xl font-semibold text-white mb-5 tracking-wide border-b border-teal-500/30 pb-2">
              Connect With Us
            </h3>
            <ul className="space-y-5 text-sm text-gray-300 mb-8">
              <li className="flex items-center gap-3">
                <FaEnvelope className="w-5 h-5 text-teal-400" />
                <a href="mailto:support@jobleaaye.com" className="text-gray-300">
                  support@jobleaaye.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="w-5 h-5 text-teal-400" />
                <a href="tel:+1234567890" className="text-gray-300">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaMapMarkerAlt className="w-5 h-5 text-teal-400" />
                <span>123 Job St, Career City, USA</span>
              </li>
            </ul>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <motion.input
                type="email"
                placeholder="Subscribe for Job Alerts"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 text-sm text-gray-900 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none shadow-sm placeholder-gray-400"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-teal-300 to-cyan-500 text-white px-5 py-3 rounded-full text-sm font-semibold shadow-sm flex items-center justify-center gap-2"
              >
                Subscribe
                <FaArrowRight className="w-4 h-4" />
              </motion.button>
              {subscribeStatus && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs text-center ${subscribeStatus.includes("success") ? "text-teal-300" : "text-red-200"}`}
                >
                  {subscribeStatus}
                </motion.p>
              )}
            </form>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-600/30 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-300"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <p className="mb-4 sm:mb-0">
            © {new Date().getFullYear()} JobLeAaye | Crafted for Opportunity Seekers
          </p>
          <div className="flex gap-6">
            {[
              { label: "Privacy", path: "/privacy" },
              { label: "Terms", path: "/terms" },
              { label: "Cookies", path: "/cookies" },
            ].map(({ label, path }) => (
              <motion.div key={label} whileHover={{ y: -2 }}>
                <Link
                  to={path}
                  className="text-gray-300"
                  onClick={() => ReactGA.event({ category: "Footer", action: "Legal Click", label })}
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;76